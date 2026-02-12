from flask import Blueprint, request, jsonify
from models import User, Course, CourseProgress, db
import datetime

bp = Blueprint('mark_course_complete', __name__)

@bp.route('/api/employee/mark_course_complete', methods=['POST'])
def mark_course_complete():
	"""Mark the entire course as completed for an employee."""
	data = request.get_json()
	username = data.get('username')
	course_id = data.get('course_id')
	if not username or not course_id:
		return jsonify({'success': False, 'error': 'username and course_id are required'}), 400

	user = User.query.filter_by(username=username, role='employee').first()
	if not user:
		return jsonify({'success': False, 'error': 'Employee not found'}), 404

	course = Course.query.get(course_id)
	if not course:
		return jsonify({'success': False, 'error': 'Course not found'}), 404
	if course not in user.courses:
		return jsonify({'success': False, 'error': 'Course not assigned to employee'}), 403

	# Get or create progress record
	progress_record = CourseProgress.query.filter_by(user_id=user.id, course_id=course_id).first()
	total_modules = len(course.modules)
	if not progress_record:
		progress_record = CourseProgress(
			user_id=user.id,
			course_id=course_id,
			total_modules=total_modules,
			completed_modules=total_modules,
			progress_percentage=100,
			completion_date=datetime.datetime.utcnow()
		)
		db.session.add(progress_record)
	else:
		progress_record.completed_modules = total_modules
		progress_record.progress_percentage = 100
		progress_record.completion_date = datetime.datetime.utcnow()
	db.session.commit()

	return jsonify({'success': True, 'message': 'Course marked as completed!', 'progress': {
		'progress_percentage': 100,
		'completed_modules': total_modules
	}}), 200
