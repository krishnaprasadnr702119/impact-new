from app import app, db

# Create a Flask application context
with app.app_context():
    try:
        print("Attempting to connect to the database...")
        db.engine.connect()
        print("Successfully connected to the database")
        
        print("Dropping all existing tables...")
        db.drop_all()
        print("All tables have been dropped successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Failed to drop tables. Please check database connection.")

