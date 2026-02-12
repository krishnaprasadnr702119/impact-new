from app import app, db
from models import User, Organization, Course, Module, ModuleContent, QuizQuestion, QuizOption
from models import Task, CourseRequest, CourseProgress, SystemSettings, AuditLog, EmailTemplate, SystemAnnouncement
from models import UserSession, PageView, QuizAttempt, ContentInteraction, CourseEnrollment, SystemMetrics, EmailMetrics, FeatureUsage, APIUsage
from models import Simulation, SimulationScenario, SimulationStep, SimulationAttempt, Notification
import datetime
import bcrypt
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def hash_password(password):
    """Hash a password for storing."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Database configuration - Load from environment variables (REQUIRED)
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

# Validate required database configuration
required_db_vars = {
    'DB_HOST': DB_HOST,
    'DB_PORT': DB_PORT,
    'DB_USER': DB_USER,
    'DB_PASSWORD': DB_PASSWORD,
    'DB_NAME': DB_NAME
}

missing_vars = [key for key, value in required_db_vars.items() if not value]
if missing_vars:
    print(f"❌ ERROR: Missing required database configuration: {', '.join(missing_vars)}")
    print(f"   Please set these in your .env file.")
    exit(1)

# Admin configuration - Load from environment variables
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')

if not ADMIN_PASSWORD:
    print(f"⚠️  WARNING: ADMIN_PASSWORD not set in .env, using default: admin123")
    ADMIN_PASSWORD = 'admin123'

if not ADMIN_EMAIL:
    print(f"⚠️  WARNING: ADMIN_EMAIL not set in .env, using default: admin@example.com")
    ADMIN_EMAIL = 'admin@example.com'

print(f"✓ Database configuration loaded from environment")
print(f"  DB_HOST: {DB_HOST}")
print(f"  DB_USER: {DB_USER}")
print(f"  DB_PORT: {DB_PORT}")
print(f"  DB_NAME: {DB_NAME}")

# Update database URI if needed
if 'DATABASE_URL' not in os.environ:
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    print(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")

# Create a Flask application context
with app.app_context():
    try:
        print("Starting database initialization...")
        
        # Check if we can connect to the database
        try:
            db.engine.connect()
            print("Successfully connected to the database")
        except Exception as e:
            print(f"Error connecting to the database: {e}")
            print("Please check your Docker database service is running and properly configured")
            exit(1)
            
        # Drop all existing tables and recreate them
        print("Dropping all existing tables...")
        db.drop_all()
        
        print("Creating all tables...")
        db.create_all()
    except Exception as e:
        print(f"Error during database setup: {e}")
        exit(1)
    
    # Create admin user
    print("Creating default admin user...")
    admin_user = User(
        username='admin',
        password=hash_password(ADMIN_PASSWORD),
        role='admin',
        email=ADMIN_EMAIL,
        designation='System Administrator'
    )
    db.session.add(admin_user)
    
    # Create portal admin user
    portal_admin = User(
        username='portaladmin',
        password=hash_password('portal123'),
        role='portal_admin',
        email='portal@example.com',
        designation='Portal Administrator'
    )
    db.session.add(portal_admin)
    
    # Create sample organization
    print("Creating sample organization...")
    organization = Organization(
        name='Sample Organization',
        portal_admin=portal_admin.username,
        org_domain='example.com',
        created=datetime.datetime.now().date(),
        status='active'
    )
    db.session.add(organization)
    
    # Link portal admin to organization
    portal_admin.org_id = 1
    
    # Create sample employee user
    print("Creating sample employee user...")
    employee = User(
        username='employee1',
        password=hash_password('employee123'),
        role='employee',
        email='employee@example.com',
        designation='Software Engineer',
        org_id=1
    )
    db.session.add(employee)
    
    # Create sample courses
    print("Creating sample courses...")
    course1 = Course(
        title='Introduction to Programming',
        description='Learn the basics of programming with this introductory course',
        status='published'
    )
    
    course2 = Course(
        title='Advanced Data Science',
        description='Explore advanced concepts in data science and machine learning',
        status='published'
    )
    
    db.session.add_all([course1, course2])
    db.session.flush()  # Flush to get IDs
    
    # Assign courses to organization
    organization.courses.extend([course1, course2])
    
    # Create modules for courses
    print("Creating course modules and content...")
    # Modules for Course 1
    module1 = Module(
        title='Getting Started',
        description='Introduction to programming concepts',
        order=1,
        course_id=course1.id
    )
    
    module2 = Module(
        title='Basic Syntax',
        description='Learn about variables, data types, and operators',
        order=2,
        course_id=course1.id
    )
    
    # Modules for Course 2
    module3 = Module(
        title='Machine Learning Basics',
        description='Introduction to machine learning algorithms',
        order=1,
        course_id=course2.id
    )
    
    db.session.add_all([module1, module2, module3])
    db.session.flush()
    
    # Create content for modules
    # Content for Module 1
    content1 = ModuleContent(
        title='What is Programming?',
        content_type='pdf',
        file_path='uploads/courses/sample.pdf',
        content='Introduction to programming concepts',
        order=1,
        module_id=module1.id
    )
    
    content2 = ModuleContent(
        title='Setting Up Your Environment',
        content_type='video',
        file_path='uploads/courses/sample_video.mp4',
        order=2,
        module_id=module1.id
    )
    
    # Quiz for Module 1
    quiz1 = ModuleContent(
        title='Programming Basics Quiz',
        content_type='quiz',
        order=3,
        module_id=module1.id
    )
    
    db.session.add_all([content1, content2, quiz1])
    db.session.flush()
    
    # Create quiz questions
    question1 = QuizQuestion(
        question_text='What does CPU stand for?',
        question_type='single-choice',
        order=1,
        content_id=quiz1.id
    )
    
    db.session.add(question1)
    db.session.flush()
    
    # Create quiz options
    options = [
        QuizOption(option_text='Central Processing Unit', is_correct=True, question_id=question1.id),
        QuizOption(option_text='Central Program Unit', is_correct=False, question_id=question1.id),
        QuizOption(option_text='Computer Processing Unit', is_correct=False, question_id=question1.id),
        QuizOption(option_text='Control Processing Unit', is_correct=False, question_id=question1.id)
    ]
    db.session.add_all(options)
    
    # Create sample simulation content
    print("Creating sample simulation...")
    simulation_content = ModuleContent(
        title='Email Phishing Simulation',
        content_type='simulation',
        order=4,
        module_id=module1.id
    )
    db.session.add(simulation_content)
    db.session.flush()
    
    # Create simulation
    simulation = Simulation(
        content_id=simulation_content.id,
        simulation_type='scenario',
        description='Interactive phishing email simulation',
        config_data=json.dumps({
            'passing_score': 70,
            'time_limit': 30
        })
    )
    db.session.add(simulation)
    db.session.flush()
    
    # Create scenario
    scenario = SimulationScenario(
        simulation_id=simulation.id,
        title='Suspicious Email Analysis',
        description='You receive an urgent email claiming to be from IT support. Analyze and respond appropriately.',
        order=1,
        scenario_data=json.dumps({
            'email_from': 'it-support@compny-help.com',
            'email_subject': 'URGENT: Verify Your Account Now!',
            'email_body': 'Dear Employee,\n\nWe have detected suspicious activity on your account. Please verify your credentials immediately by clicking the link below:\n\nhttp://verify-account.suspicious-link.com\n\nFailure to verify within 24 hours will result in account suspension.\n\nIT Support Team'
        })
    )
    db.session.add(scenario)
    db.session.flush()
    
    # Create simulation steps
    step1 = SimulationStep(
        scenario_id=scenario.id,
        title='Identify Red Flags',
        description='What makes this email suspicious? Select all that apply.',
        order=1,
        step_type='decision',
        step_data=json.dumps({
            'type': 'multiple_choice',
            'options': [
                {'id': 'urgent', 'text': 'Creates false sense of urgency'},
                {'id': 'sender', 'text': 'Suspicious sender domain (compny-help.com)'},
                {'id': 'link', 'text': 'Suspicious link URL'},
                {'id': 'grammar', 'text': 'Poor grammar or spelling'},
                {'id': 'none', 'text': 'Nothing suspicious, it looks legitimate'}
            ],
            'correct_answers': ['urgent', 'sender', 'link']
        }),
        feedback_correct='Excellent! You correctly identified the red flags. The suspicious domain (compny-help.com), urgency tactics, and phishing link are all warning signs.',
        feedback_incorrect='Review the email more carefully. Look for:\n• Urgency tactics\n• Domain name spelling\n• External links\n• Generic greetings'
    )
    
    step2 = SimulationStep(
        scenario_id=scenario.id,
        title='Best Course of Action',
        description='What should you do with this email?',
        order=2,
        step_type='decision',
        step_data=json.dumps({
            'type': 'multiple_choice',
            'options': [
                {'id': 'click', 'text': 'Click the link to verify your account'},
                {'id': 'reply', 'text': 'Reply asking for more information'},
                {'id': 'delete', 'text': 'Delete the email and report to IT security'},
                {'id': 'ignore', 'text': 'Ignore the email'}
            ],
            'correct_answers': ['delete']
        }),
        feedback_correct='Correct! Always delete suspicious emails and report them to your IT security team immediately.',
        feedback_incorrect='Never click links in suspicious emails. The safest action is to delete and report to IT security.'
    )
    
    step3 = SimulationStep(
        scenario_id=scenario.id,
        title='Reporting the Incident',
        description='Why is it important to report phishing attempts?',
        order=3,
        step_type='decision',
        step_data=json.dumps({
            'type': 'multiple_choice',
            'options': [
                {'id': 'help', 'text': 'Helps protect other employees'},
                {'id': 'analysis', 'text': 'Allows IT to analyze and block the threat'},
                {'id': 'training', 'text': 'Improves company security awareness'},
                {'id': 'all', 'text': 'All of the above'}
            ],
            'correct_answers': ['all']
        }),
        feedback_correct='Perfect! Reporting helps protect everyone and improves overall security.',
        feedback_incorrect='Reporting phishing is crucial for protecting all employees and improving security measures.'
    )
    
    step4 = SimulationStep(
        scenario_id=scenario.id,
        title='Prevention Strategies',
        description='How can you protect yourself from phishing in the future?',
        order=4,
        step_type='decision',
        step_data=json.dumps({
            'type': 'multiple_choice',
            'options': [
                {'id': 'hover', 'text': 'Hover over links before clicking'},
                {'id': 'verify', 'text': 'Verify sender email addresses carefully'},
                {'id': 'suspicious', 'text': 'Be cautious of urgent requests'},
                {'id': 'all_prevention', 'text': 'All of the above'}
            ],
            'correct_answers': ['all_prevention']
        }),
        feedback_correct='Excellent! These are all important prevention strategies to protect against phishing.',
        feedback_incorrect='All these strategies are important: verify senders, check links, and be cautious of urgency.'
    )
    
    db.session.add_all([step1, step2, step3, step4])
    
    # Assign course to employee
    employee.courses.append(course1)
    
    # Create course progress
    progress = CourseProgress(
        user_id=employee.id,
        course_id=course1.id,
        completed_modules=1,
        total_modules=2,
        progress_percentage=50.0,
        module_progress=json.dumps({
            str(module1.id): {"completed": True, "completion_date": datetime.datetime.now().isoformat()},
            str(module2.id): {"completed": False, "completion_date": None}
        })
    )
    db.session.add(progress)
    
    # Create course request
    request = CourseRequest(
        organization_id=organization.id,
        course_id=course2.id,
        requested_by=employee.id,
        status='pending',
        payment_amount=99.99,
        admin_notes='Employee has requested access to this advanced course'
    )
    db.session.add(request)
    
    # Initialize system settings
    print("Creating default system settings...")
    default_settings = [
        # Email Settings
        ('email', 'smtp_server', 'smtp.gmail.com', 'string', 'SMTP Server'),
        ('email', 'smtp_port', '587', 'integer', 'SMTP Port'),
        ('email', 'smtp_use_tls', 'true', 'boolean', 'Use TLS'),
        ('email', 'smtp_username', '', 'string', 'SMTP Username'),
        ('email', 'smtp_password', '', 'string', 'SMTP Password'),
        ('email', 'default_sender', 'noreply@lms.com', 'string', 'Default Sender Email'),
        ('email', 'notification_enabled', 'true', 'boolean', 'Email Notifications Enabled'),
        
        # Security Settings
        ('security', 'password_min_length', '8', 'integer', 'Minimum Password Length'),
        ('security', 'password_require_uppercase', 'true', 'boolean', 'Require Uppercase'),
        ('security', 'password_require_lowercase', 'true', 'boolean', 'Require Lowercase'),
        ('security', 'password_require_numbers', 'true', 'boolean', 'Require Numbers'),
        ('security', 'password_require_special', 'false', 'boolean', 'Require Special Characters'),
        ('security', 'session_timeout', '480', 'integer', 'Session Timeout (minutes)'),
        ('security', 'max_login_attempts', '5', 'integer', 'Max Login Attempts'),
        ('security', 'lockout_duration', '30', 'integer', 'Lockout Duration (minutes)'),
        ('security', 'two_factor_enabled', 'false', 'boolean', 'Two-Factor Authentication'),
        ('security', 'audit_logging', 'true', 'boolean', 'Audit Logging Enabled'),
        
        # Organization Settings
        ('organization', 'default_employee_limit', '100', 'integer', 'Default Employee Limit'),
        ('organization', 'auto_assign_courses', 'true', 'boolean', 'Auto-assign Organization Courses'),
        ('organization', 'allow_self_registration', 'false', 'boolean', 'Allow Self Registration'),
        ('organization', 'require_domain_verification', 'true', 'boolean', 'Require Domain Verification'),
        ('organization', 'default_subscription_plan', 'basic', 'string', 'Default Subscription Plan'),
        
        # Course Settings
        ('course', 'auto_publish', 'false', 'boolean', 'Auto-publish Courses'),
        ('course', 'require_approval', 'true', 'boolean', 'Require Course Approval'),
        ('course', 'default_quiz_time_limit', '30', 'integer', 'Default Quiz Time Limit (minutes)'),
        ('course', 'default_passing_score', '70', 'integer', 'Default Passing Score (%)'),
        ('course', 'max_quiz_attempts', '3', 'integer', 'Maximum Quiz Attempts'),
        ('course', 'allow_content_download', 'false', 'boolean', 'Allow Content Downloads'),
        
        # File Upload Settings
        ('file_upload', 'max_file_size_mb', '100', 'integer', 'Max File Size (MB)'),
        ('file_upload', 'max_video_size_mb', '500', 'integer', 'Max Video Size (MB)'),
        ('file_upload', 'allowed_image_types', '["jpg", "jpeg", "png", "gif"]', 'json', 'Allowed Image Types'),
        ('file_upload', 'allowed_video_types', '["mp4", "avi", "mov", "wmv"]', 'json', 'Allowed Video Types'),
        ('file_upload', 'allowed_document_types', '["pdf", "doc", "docx", "ppt", "pptx"]', 'json', 'Allowed Document Types'),
        ('file_upload', 'storage_quota_gb', '10', 'integer', 'Storage Quota per Organization (GB)'),
        
        # System Settings
        ('system', 'maintenance_mode', 'false', 'boolean', 'Maintenance Mode'),
        ('system', 'system_name', 'Learning Management System', 'string', 'System Name'),
        ('system', 'support_email', 'support@lms.com', 'string', 'Support Email'),
        ('system', 'backup_enabled', 'true', 'boolean', 'Automated Backups Enabled'),
        ('system', 'backup_frequency_hours', '24', 'integer', 'Backup Frequency (hours)'),
        ('system', 'log_retention_days', '90', 'integer', 'Log Retention (days)'),
    ]
    
    for category, key, value, data_type, description in default_settings:
        setting = SystemSettings(
            category=category,
            setting_key=key,
            setting_value=value,
            data_type=data_type,
            description=description
        )
        db.session.add(setting)
    
    # Initialize default email templates
    print("Creating default email templates...")
    default_templates = [
        {
            'template_name': 'welcome_employee',
            'subject': 'Welcome to {org_name} - Learning Management Portal',
            'html_content': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to {org_name}</title>
</head>
<body>
    <h1>Welcome to {org_name}</h1>
    <p>Dear {user_name},</p>
    <p>You have been invited to join {org_name} on our Learning Management System.</p>
    <p><strong>Email:</strong> {user_email}</p>
    <p><strong>Temporary Password:</strong> {temp_password}</p>
    <p><a href="{login_url}">Login to Portal</a></p>
    <p>Please change your password after your first login.</p>
    <p>Best regards,<br>The {org_name} Team</p>
</body>
</html>''',
            'text_content': '''Welcome to {org_name}

Dear {user_name},

You have been invited to join {org_name} on our Learning Management System.

Email: {user_email}
Temporary Password: {temp_password}
Login URL: {login_url}

Please change your password after your first login.

Best regards,
The {org_name} Team''',
            'variables': json.dumps(["org_name", "user_name", "user_email", "temp_password", "login_url"])
        },
        {
            'template_name': 'password_reset',
            'subject': 'Password Reset - {org_name} Learning Portal',
            'html_content': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset - {org_name}</title>
</head>
<body>
    <h1>Password Reset - {org_name}</h1>
    <p>Dear {user_name},</p>
    <p>Your password has been reset for the {org_name} Learning Management System.</p>
    <p><strong>Email:</strong> {user_email}</p>
    <p><strong>New Password:</strong> {new_password}</p>
    <p><a href="{login_url}">Login to Portal</a></p>
    <p><strong>Important:</strong> Please change your password after logging in for security.</p>
    <p>Best regards,<br>The {org_name} Team</p>
</body>
</html>''',
            'text_content': '''Password Reset - {org_name}

Dear {user_name},

Your password has been reset for the {org_name} Learning Management System.

Email: {user_email}
New Password: {new_password}
Login URL: {login_url}

Important: Please change your password after logging in for security.

Best regards,
The {org_name} Team''',
            'variables': json.dumps(["org_name", "user_name", "user_email", "new_password", "login_url"])
        }
    ]
    
    for template_data in default_templates:
        template = EmailTemplate(**template_data)
        db.session.add(template)
    
    # Create a sample system announcement
    print("Creating sample system announcement...")
    announcement = SystemAnnouncement(
        title='Welcome to the New LMS System',
        content='We are excited to announce the launch of our new Learning Management System with enhanced features including system settings, email templates, and audit logging. Please explore the new Settings section in the admin dashboard.',
        announcement_type='info',
        target_roles=json.dumps(['admin', 'portal_admin']),
        target_organizations=json.dumps([]),
        created_by=admin_user.id,
        show_until=datetime.datetime.now() + datetime.timedelta(days=30)
    )
    db.session.add(announcement)
    
    # Create an audit log entry
    print("Creating sample audit log entry...")
    audit_entry = AuditLog(
        user_id=admin_user.id,
        action='database_initialized',
        resource_type='system',
        details=json.dumps({
            'message': 'Database initialized with sample data',
            'timestamp': datetime.datetime.now().isoformat(),
            'settings_count': len(default_settings),
            'templates_count': len(default_templates)
        })
    )
    db.session.add(audit_entry)
    
    # Create sample analytics data
    print("Creating sample analytics data...")
    
    # Create sample user sessions
    for i in range(10):
        session = UserSession(
            user_id=1,  # admin user
            session_id=f'session_{i}',
            login_time=datetime.datetime.utcnow() - datetime.timedelta(days=i, hours=i),
            logout_time=datetime.datetime.utcnow() - datetime.timedelta(days=i, hours=i-1) if i < 5 else None,
            ip_address=f'192.168.1.{100+i}',
            user_agent='Mozilla/5.0 (Test Browser)',
            location='Test City, Test Country',
            session_duration_minutes=60 if i < 5 else None,
            pages_visited=i * 5
        )
        db.session.add(session)
    
    # Create sample page views
    pages = ['/dashboard', '/courses', '/profile', '/settings', '/admin']
    for i in range(20):
        page_view = PageView(
            user_id=1,
            session_id=f'session_{i % 10}',
            page_url=pages[i % len(pages)],
            page_title=f'Test Page {i}',
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=i),
            time_spent_seconds=60 + (i * 10),
            referrer='/' if i > 0 else None
        )
        db.session.add(page_view)
    
    # Create sample quiz attempts
    quiz_attempt = QuizAttempt(
        user_id=3,  # employee user
        quiz_content_id=3,  # quiz1 will have ID 3
        attempt_number=1,
        score=85.0,
        total_questions=10,
        correct_answers=8,
        time_taken_minutes=15,
        started_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
        completed_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=45),
        answers='{"1": "A", "2": "B", "3": "C"}'
    )
    db.session.add(quiz_attempt)
    
    # Create sample content interactions
    for i in range(3):  # Only 3 content items exist
        interaction = ContentInteraction(
            user_id=3,
            content_id=i + 1,
            interaction_type=['view', 'download', 'complete'][i % 3],
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=i),
            duration_seconds=300 + (i * 60),
            completion_percentage=20.0 * (i + 1)
        )
        db.session.add(interaction)
    
    # Create sample course enrollments
    enrollment = CourseEnrollment(
        user_id=3,
        course_id=1,
        enrolled_at=datetime.datetime.utcnow() - datetime.timedelta(days=7),
        progress_percentage=75.0,
        time_spent_minutes=120,
        last_accessed=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
    )
    db.session.add(enrollment)
    
    # Create sample system metrics
    metrics = [
        ('cpu_usage', 45.5, '%'),
        ('memory_usage', 62.3, '%'),
        ('disk_usage', 78.1, '%'),
        ('active_sessions', 15, 'count'),
        ('response_time', 250, 'ms')
    ]
    
    for name, value, unit in metrics:
        metric = SystemMetrics(
            metric_name=name,
            metric_value=value,
            metric_unit=unit,
            timestamp=datetime.datetime.utcnow(),
            meta_data='{"server": "app-01"}'
        )
        db.session.add(metric)
    
    # Create sample feature usage
    features = ['course_viewer', 'quiz_taker', 'dashboard', 'profile_edit', 'settings']
    for feature in features:
        usage = FeatureUsage(
            feature_name=feature,
            user_id=1,
            usage_count=1,
            timestamp=datetime.datetime.utcnow()
        )
        db.session.add(usage)
    
    # Create sample API usage
    endpoints = ['/api/courses', '/api/users', '/api/dashboard', '/api/progress']
    for endpoint in endpoints:
        api_usage = APIUsage(
            endpoint=endpoint,
            method='GET',
            user_id=1,
            response_time_ms=150,
            status_code=200,
            timestamp=datetime.datetime.utcnow(),
            ip_address='192.168.1.100'
        )
        db.session.add(api_usage)
    
    # Commit all changes
    print("Committing changes to database...")
    db.session.commit()
    
    print("Database tables have been reset and recreated successfully with sample data!")
    print(f"✅ Initialized {len(default_settings)} system settings")
    print(f"✅ Initialized {len(default_templates)} email templates")
    print("✅ Created sample system announcement")
    print("✅ Created audit log entry")
    print("✅ Created sample analytics data")
    print()
    print("Default login credentials:")
    print("Admin: username='admin', password='admin123'")
    print("Portal Admin: username='portaladmin', password='portal123'")
    print("Employee: username='employee1', password='employee123'")
    print()
    print("Admin Settings:")
    print("- Access the Settings page in admin dashboard to configure system preferences")
    print("- Email templates can be customized for user invitations and password resets")
    print("- System announcements can be created for user notifications")
    print("- Analytics dashboard provides comprehensive insights into system usage")
