from flask import Blueprint, jsonify, request
import datetime
from models import db, Notification, User, Course, Organization
from auth_middleware import token_required, role_required, admin_required, portal_admin_required

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications():
    """Get all notifications for the current user"""
    try:
        # Get query parameters
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        # Build query
        query = Notification.query.filter_by(recipient_id=request.token_payload['user_id'])
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        # Filter out expired notifications
        query = query.filter(
            (Notification.expires_at.is_(None)) | 
            (Notification.expires_at > datetime.datetime.utcnow())
        )
        
        # Get total count
        total_count = query.count()
        unread_count = Notification.query.filter_by(
            recipient_id=request.token_payload['user_id'],
            is_read=False
        ).count()
        
        # Get paginated notifications
        notifications = query.order_by(
            Notification.created_at.desc()
        ).limit(limit).offset(offset).all()
        
        notifications_data = []
        for notif in notifications:
            # Get sender info
            sender = User.query.get(notif.sender_id)
            
            # Get course info if exists
            course_info = None
            if notif.course_id:
                course = Course.query.get(notif.course_id)
                if course:
                    course_info = {
                        'id': course.id,
                        'title': course.title
                    }
            
            notifications_data.append({
                'id': notif.id,
                'title': notif.title,
                'message': notif.message,
                'type': notif.notification_type,
                'priority': notif.priority,
                'sender': {
                    'id': sender.id,
                    'username': sender.username,
                    'role': sender.role
                } if sender else None,
                'course': course_info,
                'is_read': notif.is_read,
                'read_at': notif.read_at.isoformat() if notif.read_at else None,
                'action_url': notif.action_url,
                'created_at': notif.created_at.isoformat(),
                'expires_at': notif.expires_at.isoformat() if notif.expires_at else None
            })
        
        return jsonify({
            'success': True,
            'notifications': notifications_data,
            'total_count': total_count,
            'unread_count': unread_count
        })
        
    except Exception as e:
        print(f"Error fetching notifications: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@notification_bp.route('/api/notifications/<int:notification_id>/read', methods=['PATCH'])
@token_required
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        notification = Notification.query.get(notification_id)
        
        if not notification:
            return jsonify({'success': False, 'error': 'Notification not found'}), 404
        
        # Check if user owns this notification
        if notification.recipient_id != request.token_payload['user_id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        # Mark as read
        notification.is_read = True
        notification.read_at = datetime.datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error marking notification as read: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@notification_bp.route('/api/notifications/mark_all_read', methods=['PATCH'])
@token_required
def mark_all_notifications_read():
    """Mark all notifications as read for the current user"""
    try:
        notifications = Notification.query.filter_by(
            recipient_id=request.token_payload['user_id'],
            is_read=False
        ).all()
        
        for notif in notifications:
            notif.is_read = True
            notif.read_at = datetime.datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Marked {len(notifications)} notifications as read'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error marking all notifications as read: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@notification_bp.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
@token_required
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        notification = Notification.query.get(notification_id)
        
        if not notification:
            return jsonify({'success': False, 'error': 'Notification not found'}), 404
        
        # Check if user owns this notification
        if notification.recipient_id != request.token_payload['user_id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notification deleted'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting notification: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@notification_bp.route('/api/notifications/unread_count', methods=['GET'])
@token_required
def get_unread_count():
    """Get count of unread notifications"""
    try:
        unread_count = Notification.query.filter_by(
            recipient_id=request.token_payload['user_id'],
            is_read=False
        ).filter(
            (Notification.expires_at.is_(None)) | 
            (Notification.expires_at > datetime.datetime.utcnow())
        ).count()
        
        return jsonify({
            'success': True,
            'unread_count': unread_count
        })
        
    except Exception as e:
        print(f"Error fetching unread count: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Admin sends notification to Portal Admins
@notification_bp.route('/api/admin/send_notification_to_portal_admins', methods=['POST'])
@admin_required
def admin_send_notification_to_portal_admins():
    """Admin sends notification to all portal admins or specific portal admins"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('title') or not data.get('message'):
            return jsonify({
                'success': False,
                'error': 'Title and message are required'
            }), 400
        
        title = data.get('title')
        message = data.get('message')
        notification_type = data.get('type', 'general')
        priority = data.get('priority', 'normal')
        course_id = data.get('course_id')
        organization_id = data.get('organization_id')
        action_url = data.get('action_url')
        expires_at = data.get('expires_at')  # Optional expiration date
        recipient_ids = data.get('recipient_ids', [])  # Specific portal admins, or empty for all
        
        # Parse expiration date if provided
        expires_at_date = None
        if expires_at:
            try:
                expires_at_date = datetime.datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            except Exception as e:
                print(f"Error parsing expires_at: {str(e)}")
        
        # Get recipients - all portal admins or specific ones
        if recipient_ids:
            recipients = User.query.filter(
                User.id.in_(recipient_ids),
                User.role == 'portal_admin'
            ).all()
        else:
            # Send to all portal admins
            if organization_id:
                # Send to portal admins of specific organization
                recipients = User.query.filter_by(
                    role='portal_admin',
                    org_id=organization_id
                ).all()
            else:
                # Send to all portal admins
                recipients = User.query.filter_by(role='portal_admin').all()
        
        if not recipients:
            return jsonify({
                'success': False,
                'error': 'No portal admins found'
            }), 404
        
        # Create notifications for each recipient
        notifications_created = 0
        for recipient in recipients:
            notification = Notification(
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority,
                sender_id=request.token_payload['user_id'],
                recipient_id=recipient.id,
                course_id=course_id,
                organization_id=organization_id,
                action_url=action_url,
                expires_at=expires_at_date
            )
            db.session.add(notification)
            notifications_created += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Notification sent to {notifications_created} portal admin(s)',
            'recipients_count': notifications_created
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error sending notification to portal admins: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Portal Admin sends notification to Employees
@notification_bp.route('/api/portal_admin/send_notification_to_employees', methods=['POST'])
@portal_admin_required
def portal_admin_send_notification_to_employees():
    """Portal Admin sends notification to employees in their organization"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('title') or not data.get('message'):
            return jsonify({
                'success': False,
                'error': 'Title and message are required'
            }), 400
        
        title = data.get('title')
        message = data.get('message')
        notification_type = data.get('type', 'general')
        priority = data.get('priority', 'normal')
        course_id = data.get('course_id')
        action_url = data.get('action_url')
        expires_at = data.get('expires_at')
        recipient_ids = data.get('recipient_ids', [])  # Specific employees, or empty for all
        
        # Parse expiration date if provided
        expires_at_date = None
        if expires_at:
            try:
                expires_at_date = datetime.datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            except Exception as e:
                print(f"Error parsing expires_at: {str(e)}")
        
        # Get portal admin's organization
        portal_admin = User.query.get(current_user['user_id'])
        if not portal_admin.org_id:
            return jsonify({
                'success': False,
                'error': 'Portal admin not associated with any organization'
            }), 400
        
        # Get recipients - all employees in organization or specific ones
        if recipient_ids:
            # Send to specific employees in the portal admin's organization
            recipients = User.query.filter(
                User.id.in_(recipient_ids),
                User.role == 'employee',
                User.org_id == portal_admin.org_id
            ).all()
        else:
            # Send to all employees in the organization
            recipients = User.query.filter_by(
                role='employee',
                org_id=portal_admin.org_id
            ).all()
        
        if not recipients:
            return jsonify({
                'success': False,
                'error': 'No employees found in your organization'
            }), 404
        
        # Create notifications for each recipient
        notifications_created = 0
        for recipient in recipients:
            notification = Notification(
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority,
                sender_id=request.token_payload['user_id'],
                recipient_id=recipient.id,
                course_id=course_id,
                organization_id=portal_admin.org_id,
                action_url=action_url,
                expires_at=expires_at_date
            )
            db.session.add(notification)
            notifications_created += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Notification sent to {notifications_created} employee(s)',
            'recipients_count': notifications_created
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error sending notification to employees: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Get all portal admins (for Admin to select recipients)
@notification_bp.route('/api/admin/portal_admins', methods=['GET'])
@admin_required
def get_portal_admins_list():
    """Get list of all portal admins for notification recipient selection"""
    try:
        portal_admins = User.query.filter_by(role='portal_admin').all()
        
        portal_admins_data = []
        for admin in portal_admins:
            org = Organization.query.get(admin.org_id) if admin.org_id else None
            portal_admins_data.append({
                'id': admin.id,
                'username': admin.username,
                'email': admin.email,
                'organization': {
                    'id': org.id,
                    'name': org.name
                } if org else None
            })
        
        return jsonify({
            'success': True,
            'portal_admins': portal_admins_data
        })
        
    except Exception as e:
        print(f"Error fetching portal admins: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Get all employees in portal admin's organization (for Portal Admin to select recipients)
@notification_bp.route('/api/portal_admin/employees', methods=['GET'])
@portal_admin_required
def get_employees_list():
    """Get list of employees in portal admin's organization for notification recipient selection"""
    try:
        # Get portal admin's organization
        portal_admin = User.query.get(request.token_payload['user_id'])
        if not portal_admin.org_id:
            return jsonify({
                'success': False,
                'error': 'Portal admin not associated with any organization'
            }), 400
        
        employees = User.query.filter_by(
            role='employee',
            org_id=portal_admin.org_id
        ).all()
        
        employees_data = []
        for emp in employees:
            employees_data.append({
                'id': emp.id,
                'username': emp.username,
                'email': emp.email,
                'designation': emp.designation
            })
        
        return jsonify({
            'success': True,
            'employees': employees_data
        })
        
    except Exception as e:
        print(f"Error fetching employees: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
