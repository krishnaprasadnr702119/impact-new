"""
Script to add simulation tables to the database
"""
from app import app, db
from models import Simulation, SimulationScenario, SimulationStep, SimulationAttempt

def add_simulation_tables():
    with app.app_context():
        print("Creating simulation tables...")
        
        # Create tables
        db.create_all()
        
        print("✅ Simulation tables created successfully!")
        print("   - simulation")
        print("   - simulation_scenario")
        print("   - simulation_step")
        print("   - simulation_attempt")

if __name__ == '__main__':
    add_simulation_tables()
