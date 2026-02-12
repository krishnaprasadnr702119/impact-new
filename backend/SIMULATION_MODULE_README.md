# Simulation Module Documentation

## Overview

The Simulation Module provides interactive, scenario-based training capabilities for the LMS. It allows administrators to create hands-on learning experiences where employees can practice real-world situations in a safe environment.

## Features

- **Multiple Simulation Types**: Interactive, Scenario-based, Lab environments, Incident Response, and Assessments
- **Multi-Step Workflows**: Create complex scenarios with sequential steps
- **Decision Points**: Add decision-making opportunities with feedback
- **Progress Tracking**: Track user attempts, scores, and completion
- **Analytics**: Monitor performance metrics and pass rates
- **Retry Support**: Allow users to attempt simulations multiple times

## Database Models

### Simulation
- `id`: Primary key
- `content_id`: Link to ModuleContent
- `simulation_type`: Type of simulation (interactive, scenario, lab, incident_response, assessment)
- `description`: Simulation description
- `config_data`: JSON configuration data
- `created_at`, `updated_at`: Timestamps

### SimulationScenario
- `id`: Primary key
- `simulation_id`: Parent simulation
- `title`: Scenario name
- `description`: Scenario description
- `order`: Display order
- `scenario_data`: JSON scenario configuration
- `passing_criteria`: JSON passing criteria

### SimulationStep
- `id`: Primary key
- `scenario_id`: Parent scenario
- `title`: Step name
- `description`: Step description
- `order`: Step sequence
- `step_type`: action, decision, or evaluation
- `step_data`: JSON step configuration
- `expected_action`: What user should do
- `feedback_correct`: Feedback for correct action
- `feedback_incorrect`: Feedback for incorrect action

### SimulationAttempt
- `id`: Primary key
- `user_id`: User who attempted
- `simulation_id`: Simulation attempted
- `scenario_id`: Specific scenario (optional)
- `attempt_number`: Sequential attempt count
- `score`: Final score (0-100)
- `completed_steps`: Steps completed
- `total_steps`: Total steps available
- `time_taken_minutes`: Time to complete
- `started_at`, `completed_at`: Timestamps
- `attempt_data`: JSON user actions log

## API Endpoints

### Simulation Management

#### Create Simulation
```http
POST /api/contents/{content_id}/simulation
Authorization: Bearer {token}
Content-Type: application/json

{
  "simulation_type": "incident_response",
  "description": "Practice responding to security incidents",
  "config_data": {
    "difficulty": "intermediate",
    "time_limit": 60
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation created successfully",
  "simulation": {
    "id": 1,
    "content_id": 5,
    "simulation_type": "incident_response",
    "description": "Practice responding to security incidents",
    "config_data": {"difficulty": "intermediate", "time_limit": 60},
    "created_at": "2026-02-02T10:30:00"
  }
}
```

#### Get Simulation Details
```http
GET /api/simulations/{simulation_id}
Authorization: Bearer {token}
```

#### Update Simulation
```http
PUT /api/simulations/{simulation_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Updated description",
  "config_data": {"difficulty": "advanced"}
}
```

#### Delete Simulation
```http
DELETE /api/simulations/{simulation_id}
Authorization: Bearer {token}
```

### Scenario Management

#### Create Scenario
```http
POST /api/simulations/{simulation_id}/scenarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Data Breach Detection",
  "description": "Detect and respond to a data breach",
  "order": 1,
  "scenario_data": {
    "initial_state": "normal",
    "threat_level": "high"
  },
  "passing_criteria": {
    "min_score": 70,
    "required_steps": ["detect", "isolate", "report"]
  }
}
```

#### Update Scenario
```http
PUT /api/scenarios/{scenario_id}
Authorization: Bearer {token}
```

#### Delete Scenario
```http
DELETE /api/scenarios/{scenario_id}
Authorization: Bearer {token}
```

### Step Management

#### Create Step
```http
POST /api/scenarios/{scenario_id}/steps
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Identify the Threat",
  "description": "Analyze the alert and identify the threat type",
  "order": 1,
  "step_type": "decision",
  "step_data": {
    "options": [
      {"id": "malware", "text": "Malware infection"},
      {"id": "phishing", "text": "Phishing attack"},
      {"id": "ddos", "text": "DDoS attack"}
    ]
  },
  "expected_action": "malware",
  "feedback_correct": "Correct! This is a malware infection.",
  "feedback_incorrect": "Not quite. Look at the network traffic patterns."
}
```

**Step Types:**
- `action`: User performs an action
- `decision`: User makes a choice
- `evaluation`: System evaluates user's response

#### Update Step
```http
PUT /api/steps/{step_id}
Authorization: Bearer {token}
```

#### Delete Step
```http
DELETE /api/steps/{step_id}
Authorization: Bearer {token}
```

### User Attempts & Progress

#### Start Simulation
```http
POST /api/simulations/{simulation_id}/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "scenario_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation started successfully",
  "attempt": {
    "id": 15,
    "attempt_number": 2,
    "total_steps": 10,
    "started_at": "2026-02-02T11:00:00"
  }
}
```

#### Update Progress
```http
PUT /api/attempts/{attempt_id}/progress
Authorization: Bearer {token}
Content-Type: application/json

{
  "completed_steps": 5,
  "score": 60,
  "attempt_data": {
    "current_step": 6,
    "actions": [
      {"step": 1, "action": "malware", "correct": true},
      {"step": 2, "action": "isolate", "correct": true}
    ]
  }
}
```

#### Complete Simulation
```http
POST /api/attempts/{attempt_id}/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "score": 85,
  "completed_steps": 10,
  "attempt_data": {
    "actions": [...],
    "summary": "Successfully completed all steps"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation completed successfully",
  "attempt": {
    "id": 15,
    "score": 85,
    "completed_steps": 10,
    "total_steps": 10,
    "time_taken_minutes": 25,
    "completed_at": "2026-02-02T11:25:00",
    "passed": true
  }
}
```

#### Get User Attempts
```http
GET /api/simulations/{simulation_id}/attempts
Authorization: Bearer {token}
```

### Analytics

#### Get Simulation Analytics
```http
GET /api/simulations/{simulation_id}/analytics
Authorization: Bearer {token}
Role: admin or portal_admin
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "simulation_id": 1,
    "total_attempts": 150,
    "completed_attempts": 120,
    "in_progress": 30,
    "average_score": 78.5,
    "pass_rate": 85.5,
    "average_time_minutes": 32,
    "unique_users": 75
  }
}
```

## Usage Examples

### Creating a Complete Simulation

```bash
#!/bin/bash

# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  jq -r '.access_token')

# 2. Create course content with simulation type
CONTENT_ID=$(curl -s -X POST http://localhost/api/modules/1/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -F "title=Security Incident Response" \
  -F "content_type=simulation" | \
  jq -r '.content.id')

# 3. Create simulation
SIMULATION_ID=$(curl -s -X POST http://localhost/api/contents/$CONTENT_ID/simulation \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_type": "incident_response",
    "description": "Practice responding to security incidents",
    "config_data": {"difficulty": "intermediate"}
  }' | jq -r '.simulation.id')

# 4. Add scenario
SCENARIO_ID=$(curl -s -X POST http://localhost/api/simulations/$SIMULATION_ID/scenarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ransomware Attack",
    "description": "Respond to a ransomware incident",
    "order": 1,
    "passing_criteria": {"min_score": 70}
  }' | jq -r '.scenario.id')

# 5. Add steps
curl -s -X POST http://localhost/api/scenarios/$SCENARIO_ID/steps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Detect the Threat",
    "description": "Identify the type of attack",
    "order": 1,
    "step_type": "decision",
    "expected_action": "ransomware",
    "feedback_correct": "Correct! This is a ransomware attack.",
    "feedback_incorrect": "Review the file encryption patterns."
  }'

# 6. Continue adding more steps...
```

### Taking a Simulation (User Flow)

```javascript
// 1. Start simulation
const startResponse = await fetch(`/api/simulations/${simulationId}/start`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ scenario_id: 1 })
});
const { attempt } = await startResponse.json();

// 2. Process each step and update progress
for (let step of steps) {
  const userAction = await getUserInput(step);
  
  await fetch(`/api/attempts/${attempt.id}/progress`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      completed_steps: currentStep,
      score: calculateScore(),
      attempt_data: {
        actions: [...previousActions, {
          step: step.id,
          action: userAction,
          timestamp: new Date().toISOString()
        }]
      }
    })
  });
}

// 3. Complete simulation
await fetch(`/api/attempts/${attempt.id}/complete`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    score: finalScore,
    completed_steps: totalSteps,
    attempt_data: { actions, summary: "Completed successfully" }
  })
});
```

## Permissions

- **Admin & Portal Admin**: Full CRUD access to simulations, scenarios, and steps
- **Employees**: Can start, attempt, and view their own simulation attempts
- **Analytics**: Admin and Portal Admin only

## Best Practices

1. **Clear Instructions**: Provide detailed descriptions for each step
2. **Meaningful Feedback**: Give specific feedback for both correct and incorrect actions
3. **Realistic Scenarios**: Base simulations on real-world situations
4. **Progressive Difficulty**: Start simple, increase complexity
5. **Time Tracking**: Use time limits when appropriate
6. **Multiple Attempts**: Allow retries for learning
7. **Analytics Review**: Regularly check analytics to identify improvement areas

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Server error

## Future Enhancements

- [ ] Real-time collaboration (multiple users in same simulation)
- [ ] Branching scenarios (different paths based on choices)
- [ ] Video integration within steps
- [ ] Certificate generation for completion
- [ ] Leaderboards
- [ ] Hints system
- [ ] Save/resume functionality
- [ ] Export simulation data
- [ ] Clone/template simulations
- [ ] Integration with external simulation platforms
