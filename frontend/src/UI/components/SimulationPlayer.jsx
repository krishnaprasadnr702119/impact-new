import React, { useState, useEffect } from 'react';
import { FaCogs, FaCheckCircle, FaTimesCircle, FaArrowRight, FaArrowLeft, FaTrophy, FaClock, FaRedo } from 'react-icons/fa';

const SimulationPlayer = ({ contentId, onComplete }) => {
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [attemptId, setAttemptId] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [stepFeedback, setStepFeedback] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        fetchSimulation();
    }, [contentId]);

    const fetchSimulation = async () => {
        try {
            setLoading(true);

            // Fetch simulation by content ID
            const simResponse = await fetch(`/api/contents/${contentId}/simulation`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!simResponse.ok) {
                const errorData = await simResponse.json();
                setError(errorData.message || 'Simulation not found for this content');
                return;
            }

            const simData = await simResponse.json();

            if (simData.success) {
                setSimulation(simData.simulation);
                setStartTime(new Date());
            } else {
                setError(simData.message || 'Failed to load simulation');
            }
        } catch (err) {
            setError(`Error loading simulation: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const startSimulation = async () => {
        if (!simulation || !simulation.id) return;

        try {
            const response = await fetch(`/api/simulations/${simulation.id}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    scenario_id: simulation.scenarios[0]?.id
                })
            });

            const data = await response.json();
            if (data.success) {
                setAttemptId(data.attempt.id);
                setCurrentScenarioIndex(0);
                setCurrentStepIndex(0);
                setStartTime(new Date());
            } else {
                setError(data.message || 'Failed to start simulation');
            }
        } catch (err) {
            setError(`Error starting simulation: ${err.message}`);
        }
    };

    const handleAnswer = (stepId, answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [stepId]: answer
        }));
    };

    const submitStep = () => {
        const scenario = simulation.scenarios[currentScenarioIndex];
        const step = scenario.steps[currentStepIndex];
        const userAnswer = userAnswers[step.id];

        // Check if answer is correct
        const isCorrect = userAnswer === step.expected_action;

        setStepFeedback({
            correct: isCorrect,
            message: isCorrect ? step.feedback_correct : step.feedback_incorrect
        });

        // Update score
        if (isCorrect) {
            setScore(prev => prev + (100 / getTotalSteps()));
        }

        // Update attempt progress
        updateProgress();
    };

    const updateProgress = async () => {
        if (!attemptId) return;

        try {
            await fetch(`/api/attempts/${attemptId}/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    completed_steps: getCompletedStepsCount() + 1,
                    score: Math.round(score),
                    attempt_data: {
                        answers: userAnswers,
                        current_step: currentStepIndex + 1
                    }
                })
            });
        } catch (err) {
            console.error('Error updating progress:', err);
        }
    };

    const nextStep = () => {
        const scenario = simulation.scenarios[currentScenarioIndex];

        if (currentStepIndex < scenario.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setStepFeedback(null);
        } else if (currentScenarioIndex < simulation.scenarios.length - 1) {
            setCurrentScenarioIndex(prev => prev + 1);
            setCurrentStepIndex(0);
            setStepFeedback(null);
        } else {
            completeSimulation();
        }
    };

    const previousStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
            setStepFeedback(null);
        }
    };

    const completeSimulation = async () => {
        if (!attemptId) return;

        const endTime = new Date();
        const timeTaken = Math.round((endTime - startTime) / 1000 / 60); // minutes

        try {
            const response = await fetch(`/api/attempts/${attemptId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    score: Math.round(score),
                    completed_steps: getTotalSteps(),
                    attempt_data: {
                        answers: userAnswers,
                        time_taken: timeTaken
                    }
                })
            });

            const data = await response.json();
            if (data.success) {
                setCompleted(true);
                if (onComplete) onComplete();
            }
        } catch (err) {
            console.error('Error completing simulation:', err);
        }
    };

    const getTotalSteps = () => {
        return simulation?.scenarios.reduce((total, scenario) => total + scenario.steps.length, 0) || 0;
    };

    const getCompletedStepsCount = () => {
        let count = 0;
        for (let i = 0; i < currentScenarioIndex; i++) {
            count += simulation.scenarios[i].steps.length;
        }
        count += currentStepIndex;
        return count;
    };

    const restartSimulation = () => {
        setAttemptId(null);
        setUserAnswers({});
        setStepFeedback(null);
        setCompleted(false);
        setScore(0);
        setCurrentScenarioIndex(0);
        setCurrentStepIndex(0);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <FaCogs size={48} style={{ color: '#10b981', animation: 'spin 2s linear infinite' }} />
                <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading simulation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '20px',
                color: '#991b1b'
            }}>
                <p><strong>Error:</strong> {error}</p>
            </div>
        );
    }

    if (!simulation) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>No simulation found</div>;
    }

    // Start screen
    if (!attemptId && !completed) {
        return (
            <div className="simulation-start">
                <div style={{
                    background: '#f0fdf4',
                    border: '2px solid #86efac',
                    borderRadius: '12px',
                    padding: '32px',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <FaCogs size={40} style={{ color: '#10b981' }} />
                        <div>
                            <h2 style={{ margin: 0, color: '#065f46', fontSize: '2rem' }}>
                                {simulation.simulation_type.replace('_', ' ').toUpperCase()}
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: '#047857' }}>{simulation.description}</p>
                        </div>
                    </div>

                    <div style={{
                        background: '#fff',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#374151' }}>About this Simulation</h3>
                        <ul style={{ color: '#6b7280', lineHeight: '1.8' }}>
                            <li><strong>{simulation.scenarios.length}</strong> scenario(s) to complete</li>
                            <li><strong>{getTotalSteps()}</strong> total steps</li>
                            <li>Estimated time: <strong>{simulation.config_data?.time_limit || 30} minutes</strong></li>
                            <li>Passing score: <strong>{simulation.config_data?.passing_score || 70}%</strong></li>
                        </ul>

                        {simulation.scenarios.map((scenario, idx) => (
                            <div key={scenario.id} style={{
                                background: '#f9fafb',
                                padding: '16px',
                                borderRadius: '6px',
                                marginTop: '12px'
                            }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#111827' }}>
                                    Scenario {idx + 1}: {scenario.title}
                                </h4>
                                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{scenario.description}</p>
                                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
                                    {scenario.steps.length} steps
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={startSimulation}
                        style={{
                            width: '100%',
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '16px 24px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}
                    >
                        <FaCogs /> Start Simulation
                    </button>
                </div>
            </div>
        );
    }

    // Completion screen
    if (completed) {
        const passed = score >= (simulation.config_data?.passing_score || 70);

        return (
            <div style={{
                background: passed ? '#f0fdf4' : '#fef2f2',
                border: `2px solid ${passed ? '#86efac' : '#fca5a5'}`,
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                {passed ? (
                    <FaTrophy size={64} style={{ color: '#10b981', marginBottom: '16px' }} />
                ) : (
                    <FaTimesCircle size={64} style={{ color: '#ef4444', marginBottom: '16px' }} />
                )}

                <h2 style={{ color: passed ? '#065f46' : '#991b1b', marginBottom: '16px' }}>
                    {passed ? 'Congratulations!' : 'Simulation Complete'}
                </h2>

                <div style={{
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: passed ? '#10b981' : '#ef4444' }}>
                        {Math.round(score)}%
                    </div>
                    <p style={{ margin: '8px 0', color: '#6b7280' }}>
                        {passed ? 'You passed the simulation!' : 'Keep practicing to improve your score.'}
                    </p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                        Passing score: {simulation.config_data?.passing_score || 70}%
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        onClick={restartSimulation}
                        style={{
                            backgroundColor: '#6b7280',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaRedo /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Simulation in progress
    const scenario = simulation.scenarios[currentScenarioIndex];
    const step = scenario.steps[currentStepIndex];
    const progress = ((getCompletedStepsCount() + 1) / getTotalSteps()) * 100;

    return (
        <div className="simulation-player">
            {/* Progress Bar */}
            <div style={{
                background: '#f3f4f6',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '24px'
            }}>
                <div style={{
                    background: '#10b981',
                    height: '8px',
                    width: `${progress}%`,
                    transition: 'width 0.3s ease'
                }} />
                <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Step {getCompletedStepsCount() + 1} of {getTotalSteps()}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Score: {Math.round(score)}%
                    </span>
                </div>
            </div>

            {/* Scenario Header */}
            <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
            }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>
                    Scenario {currentScenarioIndex + 1}: {scenario.title}
                </h3>
                <p style={{ margin: 0, color: '#3b82f6' }}>{scenario.description}</p>
            </div>

            {/* Step Content */}
            <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '24px'
            }}>
                {/* Email Display (if scenario has email data) */}
                {scenario.scenario_data && (scenario.scenario_data.email_from || scenario.scenario_data.email_subject) && (
                    <div style={{
                        background: '#f9fafb',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '32px',
                        fontFamily: 'monospace'
                    }}>
                        <div style={{
                            borderBottom: '1px solid #d1d5db',
                            paddingBottom: '12px',
                            marginBottom: '12px'
                        }}>
                            <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: '#374151' }}>From:</strong>{' '}
                                <span style={{ color: '#dc2626' }}>{scenario.scenario_data.email_from}</span>
                            </div>
                            <div>
                                <strong style={{ color: '#374151' }}>Subject:</strong>{' '}
                                <span style={{ color: '#111827', fontWeight: '600' }}>
                                    {scenario.scenario_data.email_subject}
                                </span>
                            </div>
                        </div>
                        <div style={{
                            color: '#1f2937',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            fontSize: '14px'
                        }}>
                            {scenario.scenario_data.email_body}
                        </div>
                    </div>
                )}

                <h2 style={{ marginTop: 0, color: '#111827' }}>{step.title}</h2>
                <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6' }}>{step.description}</p>

                {/* Answer Options */}
                {step.step_data && step.step_data.options && (
                    <div style={{ marginTop: '24px' }}>
                        {step.step_data.options.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => !stepFeedback && handleAnswer(step.id, option.id)}
                                style={{
                                    background: userAnswers[step.id] === option.id ? '#dbeafe' : '#f9fafb',
                                    border: `2px solid ${userAnswers[step.id] === option.id ? '#3b82f6' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '12px',
                                    cursor: stepFeedback ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: stepFeedback ? 0.7 : 1
                                }}
                            >
                                {option.text}
                            </div>
                        ))}
                    </div>
                )}

                {/* Feedback */}
                {stepFeedback && (
                    <div style={{
                        background: stepFeedback.correct ? '#d1fae5' : '#fee2e2',
                        border: `1px solid ${stepFeedback.correct ? '#6ee7b7' : '#fca5a5'}`,
                        borderRadius: '8px',
                        padding: '16px',
                        marginTop: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            {stepFeedback.correct ? (
                                <FaCheckCircle size={24} style={{ color: '#10b981' }} />
                            ) : (
                                <FaTimesCircle size={24} style={{ color: '#ef4444' }} />
                            )}
                            <strong style={{ color: stepFeedback.correct ? '#065f46' : '#991b1b' }}>
                                {stepFeedback.correct ? 'Correct!' : 'Not Quite'}
                            </strong>
                        </div>
                        <p style={{
                            margin: 0,
                            color: stepFeedback.correct ? '#047857' : '#991b1b',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {stepFeedback.message}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <button
                    onClick={previousStep}
                    disabled={currentStepIndex === 0 && currentScenarioIndex === 0}
                    style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: (currentStepIndex === 0 && currentScenarioIndex === 0) ? 0.5 : 1
                    }}
                >
                    <FaArrowLeft /> Previous
                </button>

                {!stepFeedback ? (
                    <button
                        onClick={submitStep}
                        disabled={!userAnswers[step.id]}
                        style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '12px 32px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            opacity: !userAnswers[step.id] ? 0.5 : 1
                        }}
                    >
                        Submit Answer
                    </button>
                ) : (
                    <button
                        onClick={nextStep}
                        style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '12px 32px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600'
                        }}
                    >
                        {currentStepIndex === scenario.steps.length - 1 && currentScenarioIndex === simulation.scenarios.length - 1
                            ? 'Finish'
                            : 'Next'} <FaArrowRight />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SimulationPlayer;
