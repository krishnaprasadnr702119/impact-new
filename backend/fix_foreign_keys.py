#!/usr/bin/env python3
"""
Script to fix foreign key constraints in the database.
This adds CASCADE and SET NULL options to foreign keys to prevent constraint violations.
"""

from app import app
from models import db
from sqlalchemy import text
import os

def fix_foreign_keys():
    """Fix all foreign key constraints with proper CASCADE/SET NULL options"""
    
    with app.app_context():
        print("🔧 Fixing foreign key constraints...")
        
        try:
            # Drop and recreate foreign keys with proper cascade options
            
            # 1. Fix User.org_id - SET NULL when organization is deleted
            print("Fixing User.org_id foreign key...")
            db.session.execute(text("""
                ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_org_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE "user" ADD CONSTRAINT user_org_id_fkey 
                FOREIGN KEY (org_id) REFERENCES organization(id) ON DELETE SET NULL;
            """))
            
            # 2. Fix association tables - CASCADE delete
            print("Fixing organization_courses association table...")
            db.session.execute(text("""
                ALTER TABLE organization_courses DROP CONSTRAINT IF EXISTS organization_courses_organization_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE organization_courses ADD CONSTRAINT organization_courses_organization_id_fkey 
                FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE organization_courses DROP CONSTRAINT IF EXISTS organization_courses_course_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE organization_courses ADD CONSTRAINT organization_courses_course_id_fkey 
                FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE;
            """))
            
            print("Fixing user_courses association table...")
            db.session.execute(text("""
                ALTER TABLE user_courses DROP CONSTRAINT IF EXISTS user_courses_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE user_courses ADD CONSTRAINT user_courses_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE user_courses DROP CONSTRAINT IF EXISTS user_courses_course_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE user_courses ADD CONSTRAINT user_courses_course_id_fkey 
                FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE;
            """))
            
            # 3. Fix CourseProgress - CASCADE delete
            print("Fixing course_progress foreign keys...")
            db.session.execute(text("""
                ALTER TABLE course_progress DROP CONSTRAINT IF EXISTS course_progress_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE course_progress ADD CONSTRAINT course_progress_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE course_progress DROP CONSTRAINT IF EXISTS course_progress_course_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE course_progress ADD CONSTRAINT course_progress_course_id_fkey 
                FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE;
            """))
            
            # 4. Fix Task - CASCADE delete
            print("Fixing task foreign keys...")
            db.session.execute(text("""
                ALTER TABLE task DROP CONSTRAINT IF EXISTS task_course_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE task ADD CONSTRAINT task_course_id_fkey 
                FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE task DROP CONSTRAINT IF EXISTS task_employee_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE task ADD CONSTRAINT task_employee_id_fkey 
                FOREIGN KEY (employee_id) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE task DROP CONSTRAINT IF EXISTS task_assigned_by_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE task ADD CONSTRAINT task_assigned_by_fkey 
                FOREIGN KEY (assigned_by) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            
            # 5. Fix CourseRequest - CASCADE delete for org/course/requester, SET NULL for approver
            print("Fixing course_request foreign keys...")
            db.session.execute(text("""
                ALTER TABLE course_request DROP CONSTRAINT IF EXISTS course_request_organization_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE course_request ADD CONSTRAINT course_request_organization_id_fkey 
                FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE course_request DROP CONSTRAINT IF EXISTS course_request_course_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE course_request ADD CONSTRAINT course_request_course_id_fkey 
                FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE course_request DROP CONSTRAINT IF EXISTS course_request_requested_by_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE course_request ADD CONSTRAINT course_request_requested_by_fkey 
                FOREIGN KEY (requested_by) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE course_request DROP CONSTRAINT IF EXISTS course_request_approved_by_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE course_request ADD CONSTRAINT course_request_approved_by_fkey 
                FOREIGN KEY (approved_by) REFERENCES "user"(id) ON DELETE SET NULL;
            """))
            
            # 6. Fix AuditLog - SET NULL (preserve logs)
            print("Fixing audit_log foreign keys...")
            db.session.execute(text("""
                ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
            """))
            
            # 7. Fix SystemAnnouncement - CASCADE delete
            print("Fixing system_announcement foreign keys...")
            db.session.execute(text("""
                ALTER TABLE system_announcement DROP CONSTRAINT IF EXISTS system_announcement_created_by_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE system_announcement ADD CONSTRAINT system_announcement_created_by_fkey 
                FOREIGN KEY (created_by) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            
            # 8. Fix UserSession - CASCADE delete
            print("Fixing user_session foreign keys...")
            db.session.execute(text("""
                ALTER TABLE user_session DROP CONSTRAINT IF EXISTS user_session_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE user_session ADD CONSTRAINT user_session_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            
            # 9. Fix PageView - SET NULL (preserve analytics)
            print("Fixing page_view foreign keys...")
            db.session.execute(text("""
                ALTER TABLE page_view DROP CONSTRAINT IF EXISTS page_view_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE page_view ADD CONSTRAINT page_view_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
            """))
            
            # 10. Fix QuizAttempt - CASCADE delete
            print("Fixing quiz_attempt foreign keys...")
            db.session.execute(text("""
                ALTER TABLE quiz_attempt DROP CONSTRAINT IF EXISTS quiz_attempt_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE quiz_attempt ADD CONSTRAINT quiz_attempt_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE quiz_attempt DROP CONSTRAINT IF EXISTS quiz_attempt_quiz_content_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE quiz_attempt ADD CONSTRAINT quiz_attempt_quiz_content_id_fkey 
                FOREIGN KEY (quiz_content_id) REFERENCES module_content(id) ON DELETE CASCADE;
            """))
            
            # 11. Fix ContentInteraction - CASCADE delete
            print("Fixing content_interaction foreign keys...")
            db.session.execute(text("""
                ALTER TABLE content_interaction DROP CONSTRAINT IF EXISTS content_interaction_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE content_interaction ADD CONSTRAINT content_interaction_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE content_interaction DROP CONSTRAINT IF EXISTS content_interaction_content_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE content_interaction ADD CONSTRAINT content_interaction_content_id_fkey 
                FOREIGN KEY (content_id) REFERENCES module_content(id) ON DELETE CASCADE;
            """))
            
            # 12. Fix CourseEnrollment - CASCADE delete (KEY FIX FOR THE ERROR!)
            print("Fixing course_enrollment foreign keys...")
            db.session.execute(text("""
                ALTER TABLE course_enrollment DROP CONSTRAINT IF EXISTS course_enrollment_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE course_enrollment ADD CONSTRAINT course_enrollment_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
            """))
            db.session.execute(text("""
                ALTER TABLE course_enrollment DROP CONSTRAINT IF EXISTS course_enrollment_course_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE course_enrollment ADD CONSTRAINT course_enrollment_course_id_fkey 
                FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE;
            """))
            
            # 13. Fix FeatureUsage - SET NULL (preserve analytics)
            print("Fixing feature_usage foreign keys...")
            db.session.execute(text("""
                ALTER TABLE feature_usage DROP CONSTRAINT IF EXISTS feature_usage_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE feature_usage ADD CONSTRAINT feature_usage_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
            """))
            
            # 14. Fix APIUsage - SET NULL (preserve analytics)
            print("Fixing api_usage foreign keys...")
            db.session.execute(text("""
                ALTER TABLE api_usage DROP CONSTRAINT IF EXISTS api_usage_user_id_fkey;
            """))
            db.session.execute(text("""
                ALTER TABLE api_usage ADD CONSTRAINT api_usage_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
            """))
            
            # Commit all changes
            db.session.commit()
            print("✅ All foreign key constraints have been fixed successfully!")
            print("\n📋 Summary:")
            print("   - CASCADE DELETE: Related records deleted when parent is deleted")
            print("   - SET NULL: Foreign key set to NULL when parent is deleted (preserves records)")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error fixing foreign keys: {str(e)}")
            raise

if __name__ == '__main__':
    print("=" * 60)
    print("Foreign Key Constraint Fix Script")
    print("=" * 60)
    fix_foreign_keys()
    print("\n🎉 Database migration completed!")
    print("You can now delete organizations without foreign key errors.")
