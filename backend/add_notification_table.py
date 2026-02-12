"""
Add Notification table to the database
Run this script to add the notification feature to your existing database
"""

from app import app
from models import db, Notification
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def add_notification_table():
    """Add the Notification table to the database"""
    with app.app_context():
        try:
            # Create the notification table
            db.create_all()
            
            print("✅ Notification table added successfully!")
            print("\nNotification table schema:")
            print("- id (Primary Key)")
            print("- title (String, 200)")
            print("- message (Text)")
            print("- notification_type (String, 50)")
            print("- priority (String, 20)")
            print("- sender_id (Foreign Key -> User)")
            print("- recipient_id (Foreign Key -> User)")
            print("- course_id (Foreign Key -> Course, Optional)")
            print("- organization_id (Foreign Key -> Organization, Optional)")
            print("- is_read (Boolean, default False)")
            print("- read_at (DateTime, Optional)")
            print("- action_url (String, 500, Optional)")
            print("- metadata (Text, Optional)")
            print("- created_at (DateTime)")
            print("- expires_at (DateTime, Optional)")
            
            print("\n✅ Notification feature is now ready to use!")
            print("\nAPI Endpoints:")
            print("- GET    /api/notifications - Get all notifications")
            print("- PATCH  /api/notifications/<id>/read - Mark as read")
            print("- PATCH  /api/notifications/mark_all_read - Mark all as read")
            print("- DELETE /api/notifications/<id> - Delete notification")
            print("- GET    /api/notifications/unread_count - Get unread count")
            print("- POST   /api/admin/send_notification_to_portal_admins - Admin sends to portal admins")
            print("- POST   /api/portal_admin/send_notification_to_employees - Portal admin sends to employees")
            print("- GET    /api/admin/portal_admins - Get portal admins list")
            print("- GET    /api/portal_admin/employees - Get employees list")
            
        except Exception as e:
            print(f"❌ Error adding notification table: {str(e)}")
            print(f"Error details: {type(e).__name__}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    print("Adding Notification table to database...")
    add_notification_table()
