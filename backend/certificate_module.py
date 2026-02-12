from flask import Blueprint, jsonify, request, send_file
from models import db, User, Course, CourseProgress
from datetime import datetime
import io
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors

certificate_bp = Blueprint('certificate', __name__)

@certificate_bp.route('/employee/certificate/<int:course_id>', methods=['GET'])
def get_certificate(course_id):
    """Generate and return certificate PDF for a completed course"""
    try:
        username = request.args.get('username')
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        user = User.query.filter_by(username=username, role='employee').first()
        if not user:
            return jsonify({'error': 'Employee not found'}), 404

        course = db.session.get(Course, course_id)
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        # Check if course is completed
        progress = CourseProgress.query.filter_by(user_id=user.id, course_id=course_id).first()
        if not progress or not progress.completion_date:
            return jsonify({'error': 'Course not completed yet'}), 400

        # Generate PDF certificate
        buffer = io.BytesIO()
        
        # Create PDF with landscape orientation
        c = canvas.Canvas(buffer, pagesize=landscape(letter))
        width, height = landscape(letter)
        
        # Draw certificate border
        c.setStrokeColor(colors.HexColor('#3b82f6'))
        c.setLineWidth(3)
        c.rect(0.5*inch, 0.5*inch, width-1*inch, height-1*inch, fill=0)
        
        # Draw inner border
        c.setStrokeColor(colors.HexColor('#8b5cf6'))
        c.setLineWidth(1)
        c.rect(0.7*inch, 0.7*inch, width-1.4*inch, height-1.4*inch, fill=0)
        
        # Add decorative elements
        c.setFillColor(colors.HexColor('#3b82f6'))
        c.circle(1*inch, height-1*inch, 0.3*inch, fill=1)
        c.circle(width-1*inch, height-1*inch, 0.3*inch, fill=1)
        c.circle(1*inch, 1*inch, 0.3*inch, fill=1)
        c.circle(width-1*inch, 1*inch, 0.3*inch, fill=1)
        
        # Certificate title
        c.setFont("Helvetica-Bold", 40)
        c.setFillColor(colors.HexColor('#1e293b'))
        title_text = "CERTIFICATE OF COMPLETION"
        title_width = c.stringWidth(title_text, "Helvetica-Bold", 40)
        c.drawString((width - title_width) / 2, height - 2*inch, title_text)
        
        # Subtitle
        c.setFont("Helvetica", 16)
        c.setFillColor(colors.HexColor('#64748b'))
        subtitle_text = "This certifies that"
        subtitle_width = c.stringWidth(subtitle_text, "Helvetica", 16)
        c.drawString((width - subtitle_width) / 2, height - 2.7*inch, subtitle_text)
        
        # Employee name
        c.setFont("Helvetica-Bold", 32)
        c.setFillColor(colors.HexColor('#3b82f6'))
        name_text = user.username.upper()
        name_width = c.stringWidth(name_text, "Helvetica-Bold", 32)
        c.drawString((width - name_width) / 2, height - 3.5*inch, name_text)
        
        # Draw line under name
        c.setStrokeColor(colors.HexColor('#3b82f6'))
        c.setLineWidth(2)
        c.line((width - name_width) / 2 - 0.5*inch, height - 3.6*inch, 
               (width + name_width) / 2 + 0.5*inch, height - 3.6*inch)
        
        # Course completion text
        c.setFont("Helvetica", 16)
        c.setFillColor(colors.HexColor('#64748b'))
        completion_text = "has successfully completed the course"
        completion_width = c.stringWidth(completion_text, "Helvetica", 16)
        c.drawString((width - completion_width) / 2, height - 4.2*inch, completion_text)
        
        # Course name
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(colors.HexColor('#1e293b'))
        course_text = course.title
        course_width = c.stringWidth(course_text, "Helvetica-Bold", 24)
        c.drawString((width - course_width) / 2, height - 4.9*inch, course_text)
        
        # Completion date
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor('#64748b'))
        date_text = f"Completed on: {progress.completion_date.strftime('%B %d, %Y')}"
        date_width = c.stringWidth(date_text, "Helvetica", 14)
        c.drawString((width - date_width) / 2, height - 5.5*inch, date_text)
        
        # Progress percentage
        if progress.progress_percentage:
            score_text = f"Final Score: {int(progress.progress_percentage)}%"
            score_width = c.stringWidth(score_text, "Helvetica", 14)
            c.drawString((width - score_width) / 2, height - 5.9*inch, score_text)
        
        # Signature line and title (left side)
        c.setFont("Helvetica", 10)
        c.setStrokeColor(colors.HexColor('#1e293b'))
        c.setLineWidth(1)
        c.line(2*inch, 1.7*inch, 4*inch, 1.7*inch)
        signature_text = "Learning Management System"
        c.drawString(2*inch, 1.4*inch, signature_text)
        
        # Date line (right side)
        c.line(width-4*inch, 1.7*inch, width-2*inch, 1.7*inch)
        c.drawString(width-4*inch, 1.4*inch, "Date of Issue")
        date_issue = datetime.now().strftime('%B %d, %Y')
        c.drawString(width-4*inch, 1.2*inch, date_issue)
        
        # Footer
        c.setFont("Helvetica-Oblique", 10)
        c.setFillColor(colors.HexColor('#94a3b8'))
        footer_text = "Impact Learning Management System - Empowering Growth Through Education"
        footer_width = c.stringWidth(footer_text, "Helvetica-Oblique", 10)
        c.drawString((width - footer_width) / 2, 0.8*inch, footer_text)
        
        # Save PDF
        c.save()
        buffer.seek(0)
        
        # Return PDF
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'Certificate_{course.title.replace(" ", "_")}_{user.username}.pdf'
        )

    except Exception as e:
        print(f"Error generating certificate: {str(e)}")
        return jsonify({'error': f'Failed to generate certificate: {str(e)}'}), 500

@certificate_bp.route('/employee/certificates', methods=['GET'])
def get_available_certificates():
    """Get list of courses with available certificates for the employee"""
    try:
        username = request.args.get('username')
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        user = User.query.filter_by(username=username, role='employee').first()
        if not user:
            return jsonify({'error': 'Employee not found'}), 404

        # Get all completed courses
        completed_progresses = CourseProgress.query.filter_by(user_id=user.id).filter(
            CourseProgress.completion_date.isnot(None)
        ).all()

        certificates = []
        for progress in completed_progresses:
            course = db.session.get(Course, progress.course_id)
            if course:
                certificates.append({
                    'course_id': course.id,
                    'course_title': course.title,
                    'completion_date': progress.completion_date.strftime('%Y-%m-%d'),
                    'progress_percentage': progress.progress_percentage
                })

        return jsonify({
            'success': True,
            'certificates': certificates
        }), 200

    except Exception as e:
        print(f"Error fetching certificates: {str(e)}")
        return jsonify({'error': f'Failed to fetch certificates: {str(e)}'}), 500
