from models import db, User, Organization, Course, Module, CourseProgress, QuizAttempt
from sqlalchemy import func, extract, and_, case
from datetime import datetime, timedelta
from flask import Blueprint, jsonify
import json

bp = Blueprint('admin_stats', __name__)

@bp.route('/api/admin/org_stats', methods=['GET'])
def get_organization_stats():
    """Get organization-wise course completion and risk score statistics."""
    print("Fetching organization stats...")
    
    try:
        # Get all organizations first
        orgs = Organization.query.all()
        print(f"Found {len(orgs)} organizations")

        # Query to get organization stats
        org_stats = db.session.query(
            Organization.id,
            Organization.name,
            Organization.status,
            Organization.created,
            func.count(func.distinct(User.id)).label('total_employees'),
            func.count(func.distinct(CourseProgress.id)).label('total_completions'),
            func.avg(CourseProgress.risk_score).label('avg_risk_score'),
            func.count(func.distinct(case((CourseProgress.progress_percentage == 100, CourseProgress.id))))
                .label('courses_completed'),
            func.count(func.distinct(case(
                (and_(CourseProgress.progress_percentage < 100, CourseProgress.progress_percentage > 0),
                    CourseProgress.id)
            ))).label('in_progress_courses'),
            func.count(func.distinct(case((CourseProgress.risk_score >= 8, CourseProgress.id))))
                .label('high_risk_count'),
            func.count(func.distinct(case(
                (and_(CourseProgress.risk_score >= 5, CourseProgress.risk_score < 8),
                    CourseProgress.id)
            ))).label('medium_risk_count'),
            func.count(func.distinct(case((CourseProgress.risk_score < 5, CourseProgress.id))))
                .label('low_risk_count')
        ).outerjoin(
            User, User.org_id == Organization.id
        ).outerjoin(
            CourseProgress, CourseProgress.user_id == User.id
        ).group_by(
            Organization.id, Organization.name, Organization.status, Organization.created
        ).all()
        
        print(f"Query executed, found {len(org_stats)} results")

        # Format results
        formatted_stats = []
        for org in org_stats:
            # Calculate completion rate based on completed courses vs total courses assigned
            completion_rate = (org.courses_completed / org.total_completions * 100) if org.total_completions > 0 else 0
            
            # Count the risk distribution
            risk_distribution = {
                'high': int(org.high_risk_count or 0),
                'medium': int(org.medium_risk_count or 0),
                'low': int(org.low_risk_count or 0)
            }
            total_risk_assessments = sum(risk_distribution.values())
            
            # Format the stat dictionary
            stat = {
                'org_id': org.id,
                'org_name': org.name,
                'status': org.status or 'inactive',
                'created_date': org.created.strftime('%Y-%m-%d') if org.created else '',
                'total_employees': int(org.total_employees or 0),
                'total_completions': int(org.total_completions or 0),
                'avg_risk_score': float(org.avg_risk_score or 0),
                'courses_completed': int(org.courses_completed or 0),
                'in_progress_courses': int(org.in_progress_courses or 0),
                'completion_rate': float(completion_rate),
                'risk_distribution': risk_distribution,
                'risk_percentage': {
                    'high': (risk_distribution['high'] / total_risk_assessments * 100) if total_risk_assessments > 0 else 0,
                    'medium': (risk_distribution['medium'] / total_risk_assessments * 100) if total_risk_assessments > 0 else 0,
                    'low': (risk_distribution['low'] / total_risk_assessments * 100) if total_risk_assessments > 0 else 0
                }
            }
            print(f"Organization stats: {stat}")
            formatted_stats.append(stat)

        print(f"Successfully formatted {len(formatted_stats)} organizations stats")
        return jsonify({
            'success': True,
            'data': formatted_stats
        })

    except Exception as e:
        import traceback
        error_msg = f"Error fetching organization stats: {str(e)}"
        traceback_str = traceback.format_exc()
        print(error_msg)
        print(f"Traceback: {traceback_str}")
        return jsonify({
            'success': False,
            'error': error_msg,
            'traceback': traceback_str
        }), 500

    # Format the results
    results = []
    for stat in org_stats:
        results.append({
            'org_id': stat.id,
            'org_name': stat.name,
            'total_employees': stat.total_employees,
            'total_completions': stat.total_completions,
            'avg_risk_score': float(stat.avg_risk_score) if stat.avg_risk_score else 0,
            'courses_completed': stat.courses_completed,
            'completion_rate': (stat.courses_completed / stat.total_completions * 100) if stat.total_completions > 0 else 0
        })

    return jsonify({
        'success': True,
        'data': results
    })

def get_system_statistics(user_id=None, role=None):
    """Get comprehensive system statistics for admin dashboard
    
    Args:
        user_id: The ID of the user requesting statistics (for permission checks)
        role: The role of the user (admin or portal_admin)
        
    Returns:
        A dictionary containing various system statistics
    """
    # Find the user and their role
    if user_id:
        user = User.query.get(user_id)
        if user:
            role = user.role

    # Base statistics - shared between all admin types
    stats = {
        'total_courses': Course.query.count(),
    }

    # Recent user statistics (past 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    stats['recent_users'] = User.query.filter(User.created_at >= thirty_days_ago).count()
    # Recent course statistics
    stats['recent_courses'] = Course.query.filter(Course.created >= thirty_days_ago).count()

    if role == 'admin':
        # Superadmin gets system-wide statistics
        total_users = User.query.count()
        
        # Active users (logged in within last 30 days)
        active_users = User.query.filter(
            User.last_login >= thirty_days_ago
        ).count() if hasattr(User, 'last_login') else 0
        
        # Calculate system-wide completion rate
        total_enrollments = CourseProgress.query.count()
        completed_enrollments = CourseProgress.query.filter(
            CourseProgress.progress_percentage == 100
        ).count()
        completion_rate = round((completed_enrollments / total_enrollments * 100), 1) if total_enrollments > 0 else 0
        
        # Calculate average quiz score from QuizAttempt table
        avg_score_result = db.session.query(
            func.avg(QuizAttempt.score)
        ).filter(
            QuizAttempt.score.isnot(None),
            QuizAttempt.score > 0
        ).scalar()
        avg_quiz_score = round(avg_score_result, 1) if avg_score_result else 0
        
        stats.update({
            'total_users': total_users,
            'active_users': active_users,
            'total_organizations': Organization.query.count(),
            'active_organizations': Organization.query.filter_by(status='active').count(),
            'total_portal_admins': User.query.filter_by(role='portal_admin').count(),
            'total_employees': User.query.filter_by(role='employee').count(),
            'completion_rate': completion_rate,
            'avg_quiz_score': avg_quiz_score,
        })

        # Recent organizations (up to 5)
        recent_orgs = Organization.query.order_by(Organization.created.desc()).limit(5).all()
        stats['recent_organizations'] = [
            {
                'id': org.id,
                'name': org.name,
                'status': org.status if hasattr(org, 'status') else 'unknown',
                'created': org.created.isoformat() if org.created else None
            }
            for org in recent_orgs
        ]

        # Monthly user growth (past 6 months)
        current_month = datetime.now().month
        current_year = datetime.now().year

        monthly_users = []
        for i in range(6):
            month = (current_month - i) % 12 or 12  # Handle December (0 case)
            year = current_year if month <= current_month else current_year - 1

            month_count = User.query.filter(
                extract('month', User.created_at) == month,
                extract('year', User.created_at) == year
            ).count()

            month_name = datetime(year, month, 1).strftime('%b')
            monthly_users.append({'month': month_name, 'count': month_count})

        stats['monthly_user_growth'] = list(reversed(monthly_users))

    elif role == 'portal_admin':
        # Portal admin only gets organization-specific statistics
        if user_id:
            user = User.query.get(user_id)
            if user and user.organization_id:
                org_id = user.organization_id

                # Employee count for this organization
                stats['employee_count'] = User.query.filter_by(
                    organization_id=org_id,
                    role='employee'
                ).count()

                # Course statistics for this organization
                org_courses = Course.query.filter_by(organization_id=org_id).all()
                stats['total_courses'] = len(org_courses)

                # Active courses (has at least one enrollment)
                active_course_count = db.session.query(Course).join(
                    CourseProgress, Course.id == CourseProgress.course_id
                ).filter(
                    Course.organization_id == org_id
                ).distinct().count()

                stats['active_courses'] = active_course_count

                # Calculate completion rate
                total_enrollments = CourseProgress.query.join(
                    Course, CourseProgress.course_id == Course.id
                ).filter(
                    Course.organization_id == org_id
                ).count()

                if total_enrollments > 0:
                    completed_enrollments = CourseProgress.query.join(
                        Course, CourseProgress.course_id == Course.id
                    ).filter(
                        Course.organization_id == org_id,
                        CourseProgress.completion_percentage == 100
                    ).count()

                    completion_rate = int((completed_enrollments / total_enrollments) * 100)
                    stats['completion_rate'] = completion_rate
                else:
                    stats['completion_rate'] = 0

    # Top courses by enrollment - useful for both admin types
    top_courses_query = db.session.query(
        Course.id, Course.title, func.count(CourseProgress.id).label('enrollment_count')
    ).join(
        CourseProgress, Course.id == CourseProgress.course_id
    )

    if role == 'portal_admin' and user_id and user and user.organization_id:
        org_id = user.organization_id
        top_courses_query = top_courses_query.filter(Course.organization_id == org_id)

    top_courses = top_courses_query.group_by(
        Course.id
    ).order_by(
        func.count(CourseProgress.id).desc()
    ).limit(5).all()

    stats['top_courses'] = [
        {'id': course.id, 'title': course.title, 'enrollments': course.enrollment_count}
        for course in top_courses
    ]

    return stats
