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
from sqlalchemy import inspect, text

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
    print(f"❌ ERROR: ADMIN_PASSWORD must be set in .env file for production")
    exit(1)

if not ADMIN_EMAIL:
    print(f"❌ ERROR: ADMIN_EMAIL must be set in .env file for production")
    exit(1)

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
            print("Please check your database service is running and properly configured")
            exit(1)
        
        # Check if tables already exist
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        if not existing_tables:
            print("Creating all tables...")
            db.create_all()
            
            # Only create admin user if it doesn't exist
            admin_exists = db.session.execute(text("SELECT 1 FROM \"user\" WHERE username = 'admin'")).fetchone()
            if not admin_exists:
                print("Creating default admin user...")
                admin_user = User(
                    username='admin',
                    password=hash_password(ADMIN_PASSWORD),
                    role='admin',
                    email=ADMIN_EMAIL,
                    designation='System Administrator'
                )
                db.session.add(admin_user)
                db.session.commit()
                print("Admin user created successfully")
        else:
            print("Database tables already exist. Skipping initialization.")
            
        print("Database setup complete.")
        
    except Exception as e:
        print(f"Error during database setup: {e}")
        exit(1)
