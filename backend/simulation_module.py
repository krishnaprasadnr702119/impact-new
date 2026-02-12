"""
Simulation Module for Interactive Training
Handles all simulation-related functionality including:
- Simulation creation and management
- Scenario and step configuration
- User attempts and progress tracking
- Scoring and feedback
"""

from flask import Blueprint, jsonify, request
from models import db, Simulation, SimulationScenario, SimulationStep, SimulationAttempt, ModuleContent, User
from auth_middleware import token_required, role_required
import json
import datetime

# Create blueprint
simulation_bp = Blueprint('simulation', __name__, url_prefix='/api')


# ========================
# Simulation CRUD Operations
# ========================

@simulation_bp.route('/contents/<int:content_id>/simulation', methods=['POST'])
@token_required
def create_simulation(content_id):
    """Create a new simulation for module content"""
    try:
        # Get current user from request context
        current_user = request.current_user
        
        content = ModuleContent.query.get_or_404(content_id)
        
        if content.content_type != 'simulation':
            return jsonify({
                "success": False, 
                "message": "Content type must be 'simulation'"
            }), 400
        
        # Check if simulation already exists
        existing_simulation = Simulation.query.filter_by(content_id=content_id).first()
        if existing_simulation:
            return jsonify({
                "success": False, 
                "message": "Simulation already exists for this content"
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        simulation_type = data.get('simulation_type', 'interactive')
        if simulation_type not in ['interactive', 'scenario', 'lab', 'incident_response', 'assessment']:
            return jsonify({
                "success": False,
                "message": "Invalid simulation type. Must be: interactive, scenario, lab, incident_response, or assessment"
            }), 400
        
        # Create simulation
        simulation = Simulation(
            content_id=content_id,
            simulation_type=simulation_type,
            description=data.get('description', ''),
            config_data=json.dumps(data.get('config_data')) if data.get('config_data') else None
        )
        
        db.session.add(simulation)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Simulation created successfully",
            "simulation": {
                "id": simulation.id,
                "content_id": simulation.content_id,
                "simulation_type": simulation.simulation_type,
                "description": simulation.description,
                "config_data": json.loads(simulation.config_data) if simulation.config_data else None,
                "created_at": simulation.created_at.isoformat() if simulation.created_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating simulation: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error creating simulation: {str(e)}"
        }), 500


@simulation_bp.route('/contents/<int:content_id>/simulation', methods=['GET'])
@token_required
def get_simulation_by_content(content_id):
    """Get simulation by content ID"""
    try:
        simulation = Simulation.query.filter_by(content_id=content_id).first()
        if not simulation:
            return jsonify({
                "success": False,
                "message": "Simulation not found for this content"
            }), 404
        
        # Build scenarios with steps
        scenarios_data = []
        for scenario in sorted(simulation.scenarios, key=lambda s: s.order):
            steps_data = [{
                "id": step.id,
                "title": step.title,
                "description": step.description,
                "order": step.order,
                "step_type": step.step_type,
                "step_data": json.loads(step.step_data) if step.step_data else None,
                "expected_action": step.expected_action,
                "feedback_correct": step.feedback_correct,
                "feedback_incorrect": step.feedback_incorrect
            } for step in sorted(scenario.steps, key=lambda s: s.order)]
            
            scenarios_data.append({
                "id": scenario.id,
                "title": scenario.title,
                "description": scenario.description,
                "order": scenario.order,
                "scenario_data": json.loads(scenario.scenario_data) if scenario.scenario_data else None,
                "passing_criteria": json.loads(scenario.passing_criteria) if scenario.passing_criteria else None,
                "steps": steps_data,
                "total_steps": len(steps_data)
            })
        
        return jsonify({
            "success": True,
            "simulation": {
                "id": simulation.id,
                "content_id": simulation.content_id,
                "simulation_type": simulation.simulation_type,
                "description": simulation.description,
                "config_data": json.loads(simulation.config_data) if simulation.config_data else None,
                "scenarios": scenarios_data,
                "total_scenarios": len(scenarios_data),
                "created_at": simulation.created_at.isoformat() if simulation.created_at else None,
                "updated_at": simulation.updated_at.isoformat() if simulation.updated_at else None
            }
        })
        
    except Exception as e:
        print(f"Error fetching simulation: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error fetching simulation: {str(e)}"
        }), 500

@simulation_bp.route('/simulations/<int:simulation_id>', methods=['GET'])
@token_required
def get_simulation(simulation_id):
    """Get simulation details with all scenarios and steps"""
    try:
        simulation = Simulation.query.get_or_404(simulation_id)
        
        # Build scenarios with steps
        scenarios_data = []
        for scenario in sorted(simulation.scenarios, key=lambda s: s.order):
            steps_data = [{
                "id": step.id,
                "title": step.title,
                "description": step.description,
                "order": step.order,
                "step_type": step.step_type,
                "step_data": json.loads(step.step_data) if step.step_data else None,
                "expected_action": step.expected_action,
                "feedback_correct": step.feedback_correct,
                "feedback_incorrect": step.feedback_incorrect
            } for step in sorted(scenario.steps, key=lambda s: s.order)]
            
            scenarios_data.append({
                "id": scenario.id,
                "title": scenario.title,
                "description": scenario.description,
                "order": scenario.order,
                "scenario_data": json.loads(scenario.scenario_data) if scenario.scenario_data else None,
                "passing_criteria": json.loads(scenario.passing_criteria) if scenario.passing_criteria else None,
                "steps": steps_data,
                "total_steps": len(steps_data)
            })
        
        return jsonify({
            "success": True,
            "simulation": {
                "id": simulation.id,
                "content_id": simulation.content_id,
                "simulation_type": simulation.simulation_type,
                "description": simulation.description,
                "config_data": json.loads(simulation.config_data) if simulation.config_data else None,
                "scenarios": scenarios_data,
                "total_scenarios": len(scenarios_data),
                "created_at": simulation.created_at.isoformat() if simulation.created_at else None,
                "updated_at": simulation.updated_at.isoformat() if simulation.updated_at else None
            }
        })
        
    except Exception as e:
        print(f"Error fetching simulation: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error fetching simulation: {str(e)}"
        }), 500


@simulation_bp.route('/simulations/<int:simulation_id>', methods=['PUT'])
def update_simulation(simulation_id):
    """Update simulation details"""
    try:
        simulation = Simulation.query.get_or_404(simulation_id)
        data = request.get_json()
        
        # Update fields
        if 'simulation_type' in data:
            if data['simulation_type'] not in ['interactive', 'scenario', 'lab', 'incident_response', 'assessment']:
                return jsonify({
                    "success": False,
                    "message": "Invalid simulation type"
                }), 400
            simulation.simulation_type = data['simulation_type']
        
        if 'description' in data:
            simulation.description = data['description']
        
        if 'config_data' in data:
            simulation.config_data = json.dumps(data['config_data'])
        
        simulation.updated_at = datetime.datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Simulation updated successfully",
            "simulation": {
                "id": simulation.id,
                "simulation_type": simulation.simulation_type,
                "description": simulation.description,
                "config_data": json.loads(simulation.config_data) if simulation.config_data else None,
                "updated_at": simulation.updated_at.isoformat()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating simulation: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error updating simulation: {str(e)}"
        }), 500


@simulation_bp.route('/simulations/<int:simulation_id>', methods=['DELETE'])
def delete_simulation(simulation_id):
    """Delete a simulation and all associated data"""
    try:
        simulation = Simulation.query.get_or_404(simulation_id)
        
        db.session.delete(simulation)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Simulation deleted successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting simulation: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error deleting simulation: {str(e)}"
        }), 500


# ========================
# Scenario Management
# ========================

@simulation_bp.route('/simulations/<int:simulation_id>/scenarios', methods=['POST'])
def create_scenario(simulation_id):
    """Add a scenario to a simulation"""
    try:
        simulation = Simulation.query.get_or_404(simulation_id)
        data = request.get_json()
        
        title = data.get('title')
        if not title:
            return jsonify({
                "success": False, 
                "message": "Scenario title is required"
            }), 400
        
        # Get max order for current scenarios
        max_order = db.session.query(db.func.max(SimulationScenario.order)).filter(
            SimulationScenario.simulation_id == simulation_id
        ).scalar() or 0
        
        scenario = SimulationScenario(
            simulation_id=simulation_id,
            title=title,
            description=data.get('description', ''),
            order=data.get('order', max_order + 1),
            scenario_data=json.dumps(data.get('scenario_data')) if data.get('scenario_data') else None,
            passing_criteria=json.dumps(data.get('passing_criteria')) if data.get('passing_criteria') else None
        )
        
        db.session.add(scenario)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Scenario created successfully",
            "scenario": {
                "id": scenario.id,
                "simulation_id": scenario.simulation_id,
                "title": scenario.title,
                "description": scenario.description,
                "order": scenario.order,
                "scenario_data": json.loads(scenario.scenario_data) if scenario.scenario_data else None,
                "passing_criteria": json.loads(scenario.passing_criteria) if scenario.passing_criteria else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating scenario: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error creating scenario: {str(e)}"
        }), 500


@simulation_bp.route('/scenarios/<int:scenario_id>', methods=['PUT'])
def update_scenario(scenario_id):
    """Update a scenario"""
    try:
        scenario = SimulationScenario.query.get_or_404(scenario_id)
        data = request.get_json()
        
        if 'title' in data:
            scenario.title = data['title']
        if 'description' in data:
            scenario.description = data['description']
        if 'order' in data:
            scenario.order = data['order']
        if 'scenario_data' in data:
            scenario.scenario_data = json.dumps(data['scenario_data'])
        if 'passing_criteria' in data:
            scenario.passing_criteria = json.dumps(data['passing_criteria'])
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Scenario updated successfully",
            "scenario": {
                "id": scenario.id,
                "title": scenario.title,
                "description": scenario.description,
                "order": scenario.order
            }
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating scenario: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error updating scenario: {str(e)}"
        }), 500


@simulation_bp.route('/scenarios/<int:scenario_id>', methods=['DELETE'])
def delete_scenario(scenario_id):
    """Delete a scenario"""
    try:
        scenario = SimulationScenario.query.get_or_404(scenario_id)
        
        db.session.delete(scenario)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Scenario deleted successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting scenario: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error deleting scenario: {str(e)}"
        }), 500


# ========================
# Step Management
# ========================

@simulation_bp.route('/scenarios/<int:scenario_id>/steps', methods=['POST'])
def create_step(scenario_id):
    """Add a step to a simulation scenario"""
    try:
        scenario = SimulationScenario.query.get_or_404(scenario_id)
        data = request.get_json()
        
        title = data.get('title')
        step_type = data.get('step_type')
        
        if not title or not step_type:
            return jsonify({
                "success": False, 
                "message": "Title and step type are required"
            }), 400
        
        if step_type not in ['action', 'decision', 'evaluation']:
            return jsonify({
                "success": False, 
                "message": "Invalid step type. Must be: action, decision, or evaluation"
            }), 400
        
        # Get max order for current steps
        max_order = db.session.query(db.func.max(SimulationStep.order)).filter(
            SimulationStep.scenario_id == scenario_id
        ).scalar() or 0
        
        step = SimulationStep(
            scenario_id=scenario_id,
            title=title,
            description=data.get('description', ''),
            order=data.get('order', max_order + 1),
            step_type=step_type,
            step_data=json.dumps(data.get('step_data')) if data.get('step_data') else None,
            expected_action=data.get('expected_action'),
            feedback_correct=data.get('feedback_correct'),
            feedback_incorrect=data.get('feedback_incorrect')
        )
        
        db.session.add(step)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Step created successfully",
            "step": {
                "id": step.id,
                "scenario_id": step.scenario_id,
                "title": step.title,
                "description": step.description,
                "order": step.order,
                "step_type": step.step_type,
                "step_data": json.loads(step.step_data) if step.step_data else None,
                "expected_action": step.expected_action,
                "feedback_correct": step.feedback_correct,
                "feedback_incorrect": step.feedback_incorrect
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating step: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error creating step: {str(e)}"
        }), 500


@simulation_bp.route('/steps/<int:step_id>', methods=['PUT'])
def update_step(step_id):
    """Update a simulation step"""
    try:
        step = SimulationStep.query.get_or_404(step_id)
        data = request.get_json()
        
        if 'title' in data:
            step.title = data['title']
        if 'description' in data:
            step.description = data['description']
        if 'order' in data:
            step.order = data['order']
        if 'step_type' in data:
            if data['step_type'] not in ['action', 'decision', 'evaluation']:
                return jsonify({
                    "success": False,
                    "message": "Invalid step type"
                }), 400
            step.step_type = data['step_type']
        if 'step_data' in data:
            step.step_data = json.dumps(data['step_data'])
        if 'expected_action' in data:
            step.expected_action = data['expected_action']
        if 'feedback_correct' in data:
            step.feedback_correct = data['feedback_correct']
        if 'feedback_incorrect' in data:
            step.feedback_incorrect = data['feedback_incorrect']
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Step updated successfully",
            "step": {
                "id": step.id,
                "title": step.title,
                "order": step.order,
                "step_type": step.step_type
            }
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating step: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error updating step: {str(e)}"
        }), 500


@simulation_bp.route('/steps/<int:step_id>', methods=['DELETE'])
def delete_step(step_id):
    """Delete a simulation step"""
    try:
        step = SimulationStep.query.get_or_404(step_id)
        
        db.session.delete(step)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Step deleted successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting step: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error deleting step: {str(e)}"
        }), 500


# ========================
# Attempt Tracking & Progress
# ========================

@simulation_bp.route('/simulations/<int:simulation_id>/start', methods=['POST'])
@token_required
def start_simulation(simulation_id):
    """Start a new simulation attempt"""
    try:
        current_user = request.current_user
        simulation = Simulation.query.get_or_404(simulation_id)
        data = request.get_json()
        
        # Get total steps
        total_steps = db.session.query(db.func.count(SimulationStep.id)).join(
            SimulationScenario
        ).filter(SimulationScenario.simulation_id == simulation_id).scalar() or 0
        
        # Get attempt number
        last_attempt = SimulationAttempt.query.filter_by(
            user_id=current_user.id,
            simulation_id=simulation_id
        ).order_by(SimulationAttempt.attempt_number.desc()).first()
        
        attempt_number = (last_attempt.attempt_number + 1) if last_attempt else 1
        
        attempt = SimulationAttempt(
            user_id=current_user.id,
            simulation_id=simulation_id,
            scenario_id=data.get('scenario_id'),
            attempt_number=attempt_number,
            total_steps=total_steps,
            completed_steps=0,
            score=0,
            attempt_data=json.dumps({"started": True, "steps": []})
        )
        
        db.session.add(attempt)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Simulation started successfully",
            "attempt": {
                "id": attempt.id,
                "attempt_number": attempt.attempt_number,
                "total_steps": attempt.total_steps,
                "started_at": attempt.started_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error starting simulation: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error starting simulation: {str(e)}"
        }), 500


@simulation_bp.route('/attempts/<int:attempt_id>/progress', methods=['PUT'])
@token_required
def update_attempt_progress(attempt_id):
    """Update progress for an ongoing attempt"""
    try:
        current_user = request.current_user
        attempt = SimulationAttempt.query.get_or_404(attempt_id)
        
        # Verify ownership
        if attempt.user_id != current_user.id:
            return jsonify({
                "success": False,
                "message": "Unauthorized access to this attempt"
            }), 403
        
        data = request.get_json()
        
        if 'completed_steps' in data:
            attempt.completed_steps = data['completed_steps']
        if 'score' in data:
            attempt.score = data['score']
        if 'attempt_data' in data:
            # Merge with existing data
            existing_data = json.loads(attempt.attempt_data) if attempt.attempt_data else {}
            existing_data.update(data['attempt_data'])
            attempt.attempt_data = json.dumps(existing_data)
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Progress updated successfully",
            "attempt": {
                "id": attempt.id,
                "completed_steps": attempt.completed_steps,
                "total_steps": attempt.total_steps,
                "score": attempt.score
            }
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating progress: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error updating progress: {str(e)}"
        }), 500


@simulation_bp.route('/attempts/<int:attempt_id>/complete', methods=['POST'])
@token_required
def complete_simulation(attempt_id):
    """Mark a simulation attempt as completed"""
    try:
        current_user = request.current_user
        attempt = SimulationAttempt.query.get_or_404(attempt_id)
        
        # Verify ownership
        if attempt.user_id != current_user.id:
            return jsonify({
                "success": False,
                "message": "Unauthorized access to this attempt"
            }), 403
        
        data = request.get_json()
        
        attempt.completed_at = datetime.datetime.utcnow()
        attempt.score = data.get('score', attempt.score)
        attempt.completed_steps = data.get('completed_steps', attempt.completed_steps)
        
        # Calculate time taken
        if attempt.started_at:
            time_diff = attempt.completed_at - attempt.started_at
            attempt.time_taken_minutes = int(time_diff.total_seconds() / 60)
        
        if 'attempt_data' in data:
            attempt.attempt_data = json.dumps(data['attempt_data'])
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Simulation completed successfully",
            "attempt": {
                "id": attempt.id,
                "score": attempt.score,
                "completed_steps": attempt.completed_steps,
                "total_steps": attempt.total_steps,
                "time_taken_minutes": attempt.time_taken_minutes,
                "completed_at": attempt.completed_at.isoformat(),
                "passed": attempt.score >= 70 if attempt.score is not None else False
            }
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error completing simulation: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error completing simulation: {str(e)}"
        }), 500


@simulation_bp.route('/simulations/<int:simulation_id>/attempts', methods=['GET'])
@token_required
def get_user_attempts(simulation_id):
    """Get all attempts by current user for a simulation"""
    try:
        current_user = request.current_user
        attempts = SimulationAttempt.query.filter_by(
            user_id=current_user.id,
            simulation_id=simulation_id
        ).order_by(SimulationAttempt.started_at.desc()).all()
        
        attempts_data = [{
            "id": attempt.id,
            "attempt_number": attempt.attempt_number,
            "score": attempt.score,
            "completed_steps": attempt.completed_steps,
            "total_steps": attempt.total_steps,
            "time_taken_minutes": attempt.time_taken_minutes,
            "started_at": attempt.started_at.isoformat() if attempt.started_at else None,
            "completed_at": attempt.completed_at.isoformat() if attempt.completed_at else None,
            "completed": attempt.completed_at is not None,
            "passed": attempt.score >= 70 if attempt.score is not None else False
        } for attempt in attempts]
        
        return jsonify({
            "success": True,
            "attempts": attempts_data,
            "total_attempts": len(attempts_data)
        })
        
    except Exception as e:
        print(f"Error fetching attempts: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error fetching attempts: {str(e)}"
        }), 500


# ========================
# Analytics & Reporting
# ========================

@simulation_bp.route('/simulations/<int:simulation_id>/analytics', methods=['GET'])
def get_simulation_analytics(simulation_id):
    """Get analytics for a simulation"""
    try:
        simulation = Simulation.query.get_or_404(simulation_id)
        
        # Get all attempts for this simulation
        attempts = SimulationAttempt.query.filter_by(simulation_id=simulation_id).all()
        
        completed_attempts = [a for a in attempts if a.completed_at is not None]
        
        analytics = {
            "simulation_id": simulation_id,
            "total_attempts": len(attempts),
            "completed_attempts": len(completed_attempts),
            "in_progress": len(attempts) - len(completed_attempts),
            "average_score": sum(a.score for a in completed_attempts if a.score) / len(completed_attempts) if completed_attempts else 0,
            "pass_rate": len([a for a in completed_attempts if a.score and a.score >= 70]) / len(completed_attempts) * 100 if completed_attempts else 0,
            "average_time_minutes": sum(a.time_taken_minutes for a in completed_attempts if a.time_taken_minutes) / len(completed_attempts) if completed_attempts else 0,
            "unique_users": len(set(a.user_id for a in attempts))
        }
        
        return jsonify({
            "success": True,
            "analytics": analytics
        })
        
    except Exception as e:
        print(f"Error fetching analytics: {str(e)}")
        return jsonify({
            "success": False, 
            "message": f"Error fetching analytics: {str(e)}"
        }), 500
