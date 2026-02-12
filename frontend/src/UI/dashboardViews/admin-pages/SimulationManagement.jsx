import React, { useState, useEffect } from 'react';
import { FaCogs, FaPlus, FaEdit, FaTrash, FaEye, FaChevronDown, FaChevronUp, FaSave, FaTimes } from 'react-icons/fa';

const SimulationManagement = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [contents, setContents] = useState([]);
    const [simulations, setSimulations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form states
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [currentSimulation, setCurrentSimulation] = useState(null);
    const [expandedSimulation, setExpandedSimulation] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        content_id: '',
        simulation_type: 'phishing',
        description: '',
        passing_score: 70,
        time_limit: 30,
        scenarios: []
    });

    const [scenarioForm, setScenarioForm] = useState({
        title: '',
        description: '',
        order: 1,
        email_from: '',
        email_subject: '',
        email_body: '',
        steps: []
    });

    const [stepForm, setStepForm] = useState({
        title: '',
        description: '',
        order: 1,
        step_type: 'decision',
        options: [{ id: '', text: '' }],
        correct_answers: [],
        feedback_correct: '',
        feedback_incorrect: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/courses', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setCourses(data.courses);
            }
        } catch (err) {
            setError('Failed to load courses');
        }
    };

    const fetchModules = async (courseId) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/modules`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setModules(data.modules);
            }
        } catch (err) {
            setError('Failed to load modules');
        }
    };

    const fetchContents = async (moduleId) => {
        try {
            const response = await fetch(`/api/modules/${moduleId}/contents`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setContents(data.contents);
            }
        } catch (err) {
            setError('Failed to load contents');
        }
    };

    const createSimulationContent = async () => {
        if (!selectedModule) {
            setError('Please select a module first');
            return;
        }

        try {
            setLoading(true);

            // 1. Create content
            const contentResponse = await fetch(`/api/modules/${selectedModule}/contents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: formData.description || 'New Simulation',
                    content_type: 'simulation',
                    order: contents.length + 1
                })
            });
            const contentData = await contentResponse.json();

            if (!contentData.success) {
                throw new Error(contentData.message);
            }

            const contentId = contentData.content.id;

            // 2. Create simulation
            const simResponse = await fetch(`/api/contents/${contentId}/simulation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    simulation_type: formData.simulation_type,
                    description: formData.description,
                    config_data: {
                        passing_score: formData.passing_score,
                        time_limit: formData.time_limit
                    }
                })
            });
            const simData = await simResponse.json();

            if (!simData.success) {
                throw new Error(simData.message);
            }

            const simulationId = simData.simulation.id;

            // 3. Create scenario
            const scenarioResponse = await fetch(`/api/simulations/${simulationId}/scenarios`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: scenarioForm.title,
                    description: scenarioForm.description,
                    order: scenarioForm.order,
                    scenario_data: {
                        email_from: scenarioForm.email_from,
                        email_subject: scenarioForm.email_subject,
                        email_body: scenarioForm.email_body
                    }
                })
            });
            const scenarioData = await scenarioResponse.json();

            if (!scenarioData.success) {
                throw new Error(scenarioData.message);
            }

            const scenarioId = scenarioData.scenario.id;

            // 4. Create steps
            for (let i = 0; i < scenarioForm.steps.length; i++) {
                const step = scenarioForm.steps[i];
                await fetch(`/api/scenarios/${scenarioId}/steps`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: step.title,
                        description: step.description,
                        order: i + 1,
                        step_type: step.step_type,
                        step_data: {
                            type: 'multiple_choice',
                            options: step.options,
                            correct_answers: step.correct_answers
                        },
                        feedback_correct: step.feedback_correct,
                        feedback_incorrect: step.feedback_incorrect
                    })
                });
            }

            setSuccess('Simulation created successfully!');
            setShowCreateForm(false);
            resetForms();
            fetchContents(selectedModule);

        } catch (err) {
            setError(err.message || 'Failed to create simulation');
        } finally {
            setLoading(false);
        }
    };

    const addOption = () => {
        setStepForm({
            ...stepForm,
            options: [...stepForm.options, { id: '', text: '' }]
        });
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...stepForm.options];
        newOptions[index][field] = value;
        setStepForm({ ...stepForm, options: newOptions });
    };

    const removeOption = (index) => {
        const newOptions = stepForm.options.filter((_, i) => i !== index);
        setStepForm({ ...stepForm, options: newOptions });
    };

    const toggleCorrectAnswer = (optionId) => {
        const correct = stepForm.correct_answers || [];
        if (correct.includes(optionId)) {
            setStepForm({
                ...stepForm,
                correct_answers: correct.filter(id => id !== optionId)
            });
        } else {
            setStepForm({
                ...stepForm,
                correct_answers: [...correct, optionId]
            });
        }
    };

    const addStepToScenario = () => {
        if (!stepForm.title || stepForm.options.length === 0) {
            setError('Please fill in all step fields');
            return;
        }

        setScenarioForm({
            ...scenarioForm,
            steps: [...scenarioForm.steps, { ...stepForm }]
        });

        // Reset step form
        setStepForm({
            title: '',
            description: '',
            order: scenarioForm.steps.length + 2,
            step_type: 'decision',
            options: [{ id: '', text: '' }],
            correct_answers: [],
            feedback_correct: '',
            feedback_incorrect: ''
        });

        setSuccess('Step added to scenario');
    };

    const removeStepFromScenario = (index) => {
        setScenarioForm({
            ...scenarioForm,
            steps: scenarioForm.steps.filter((_, i) => i !== index)
        });
    };

    const resetForms = () => {
        setFormData({
            content_id: '',
            simulation_type: 'phishing',
            description: '',
            passing_score: 70,
            time_limit: 30,
            scenarios: []
        });
        setScenarioForm({
            title: '',
            description: '',
            order: 1,
            email_from: '',
            email_subject: '',
            email_body: '',
            steps: []
        });
        setStepForm({
            title: '',
            description: '',
            order: 1,
            step_type: 'decision',
            options: [{ id: '', text: '' }],
            correct_answers: [],
            feedback_correct: '',
            feedback_incorrect: ''
        });
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <FaCogs style={{ color: '#3b82f6' }} />
                    Simulation Management
                </h1>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}
                >
                    <FaPlus /> Create Simulation
                </button>
            </div>

            {error && (
                <div style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {error}
                    <FaTimes style={{ cursor: 'pointer' }} onClick={() => setError(null)} />
                </div>
            )}

            {success && (
                <div style={{
                    background: '#d1fae5',
                    border: '1px solid #6ee7b7',
                    color: '#065f46',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {success}
                    <FaTimes style={{ cursor: 'pointer' }} onClick={() => setSuccess(null)} />
                </div>
            )}

            {/* Selection Section */}
            <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h2 style={{ marginTop: 0 }}>Select Course & Module</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            Course
                        </label>
                        <select
                            value={selectedCourse || ''}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                setSelectedModule(null);
                                setModules([]);
                                setContents([]);
                                if (e.target.value) fetchModules(e.target.value);
                            }}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Select a course...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            Module
                        </label>
                        <select
                            value={selectedModule || ''}
                            onChange={(e) => {
                                setSelectedModule(e.target.value);
                                setContents([]);
                                if (e.target.value) fetchContents(e.target.value);
                            }}
                            disabled={!selectedCourse}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                opacity: !selectedCourse ? 0.5 : 1
                            }}
                        >
                            <option value="">Select a module...</option>
                            {modules.map(module => (
                                <option key={module.id} value={module.id}>{module.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            Total Simulations
                        </label>
                        <div style={{
                            padding: '10px',
                            background: '#f3f4f6',
                            borderRadius: '6px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#3b82f6',
                            textAlign: 'center'
                        }}>
                            {contents.filter(c => c.content_type === 'simulation').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Simulation Form */}
            {showCreateForm && (
                <div style={{
                    background: '#fff',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <h2 style={{ marginTop: 0, color: '#3b82f6' }}>Create New Simulation</h2>

                    {/* Basic Info */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3>Basic Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    Simulation Type
                                </label>
                                <select
                                    value={formData.simulation_type}
                                    onChange={(e) => setFormData({ ...formData, simulation_type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db'
                                    }}
                                >
                                    <option value="phishing">Phishing Attack</option>
                                    <option value="social_engineering">Social Engineering</option>
                                    <option value="password_security">Password Security</option>
                                    <option value="data_breach">Data Breach Response</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the simulation"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    Passing Score (%)
                                </label>
                                <input
                                    type="number"
                                    value={formData.passing_score}
                                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                                    min="0"
                                    max="100"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    Time Limit (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={formData.time_limit}
                                    onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                                    min="1"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scenario Form */}
                    <div style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Scenario Details</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Scenario Title
                            </label>
                            <input
                                type="text"
                                value={scenarioForm.title}
                                onChange={(e) => setScenarioForm({ ...scenarioForm, title: e.target.value })}
                                placeholder="e.g., Suspicious Email Analysis"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Scenario Description
                            </label>
                            <textarea
                                value={scenarioForm.description}
                                onChange={(e) => setScenarioForm({ ...scenarioForm, description: e.target.value })}
                                placeholder="Describe the scenario..."
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db'
                                }}
                            />
                        </div>

                        {/* Email Content */}
                        <div style={{
                            background: '#fff',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <h4 style={{ marginTop: 0 }}>Email Content (for Phishing Simulations)</h4>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                                    From
                                </label>
                                <input
                                    type="text"
                                    value={scenarioForm.email_from}
                                    onChange={(e) => setScenarioForm({ ...scenarioForm, email_from: e.target.value })}
                                    placeholder="e.g., it-support@compny-help.com"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={scenarioForm.email_subject}
                                    onChange={(e) => setScenarioForm({ ...scenarioForm, email_subject: e.target.value })}
                                    placeholder="e.g., URGENT: Verify Your Account Now!"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                                    Body
                                </label>
                                <textarea
                                    value={scenarioForm.email_body}
                                    onChange={(e) => setScenarioForm({ ...scenarioForm, email_body: e.target.value })}
                                    placeholder="Enter the email body text..."
                                    rows="6"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '14px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step Builder */}
                    <div style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#1e40af' }}>Add Step (Question)</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Question Title
                            </label>
                            <input
                                type="text"
                                value={stepForm.title}
                                onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                                placeholder="e.g., Identify Red Flags"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid #93c5fd'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Question Description
                            </label>
                            <textarea
                                value={stepForm.description}
                                onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                                placeholder="e.g., What makes this email suspicious? Select all that apply."
                                rows="2"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid #93c5fd'
                                }}
                            />
                        </div>

                        {/* Answer Options */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Answer Options
                            </label>
                            {stepForm.options.map((option, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '8px',
                                    alignItems: 'center'
                                }}>
                                    <input
                                        type="text"
                                        value={option.id}
                                        onChange={(e) => updateOption(index, 'id', e.target.value)}
                                        placeholder="ID (e.g., urgent)"
                                        style={{
                                            flex: '0 0 150px',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: '1px solid #93c5fd',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                                        placeholder="Answer text"
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: '1px solid #93c5fd',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                        <input
                                            type="checkbox"
                                            checked={stepForm.correct_answers?.includes(option.id)}
                                            onChange={() => toggleCorrectAnswer(option.id)}
                                        />
                                        Correct
                                    </label>
                                    {stepForm.options.length > 1 && (
                                        <button
                                            onClick={() => removeOption(index)}
                                            style={{
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addOption}
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FaPlus /> Add Option
                            </button>
                        </div>

                        {/* Feedback */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                    Feedback (Correct)
                                </label>
                                <textarea
                                    value={stepForm.feedback_correct}
                                    onChange={(e) => setStepForm({ ...stepForm, feedback_correct: e.target.value })}
                                    placeholder="Feedback shown when answer is correct..."
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid #93c5fd',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                    Feedback (Incorrect)
                                </label>
                                <textarea
                                    value={stepForm.feedback_incorrect}
                                    onChange={(e) => setStepForm({ ...stepForm, feedback_incorrect: e.target.value })}
                                    placeholder="Feedback shown when answer is incorrect..."
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid #93c5fd',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={addStepToScenario}
                            style={{
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaPlus /> Add Step to Scenario
                        </button>
                    </div>

                    {/* Steps Preview */}
                    {scenarioForm.steps.length > 0 && (
                        <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{ marginTop: 0, color: '#065f46' }}>
                                Steps in Scenario ({scenarioForm.steps.length})
                            </h3>
                            {scenarioForm.steps.map((step, index) => (
                                <div key={index} style={{
                                    background: '#fff',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong>Step {index + 1}:</strong> {step.title}
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                            {step.options.length} options, {step.correct_answers?.length || 0} correct
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeStepFromScenario(index)}
                                        style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '6px 12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => {
                                setShowCreateForm(false);
                                resetForms();
                            }}
                            style={{
                                background: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={createSimulationContent}
                            disabled={loading || !selectedModule || scenarioForm.steps.length === 0}
                            style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                cursor: loading || !selectedModule || scenarioForm.steps.length === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: '600',
                                opacity: loading || !selectedModule || scenarioForm.steps.length === 0 ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaSave /> {loading ? 'Creating...' : 'Create Simulation'}
                        </button>
                    </div>
                </div>
            )}

            {/* Existing Simulations List */}
            {selectedModule && contents.filter(c => c.content_type === 'simulation').length > 0 && (
                <div style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    <h2 style={{ marginTop: 0 }}>Existing Simulations</h2>
                    {contents.filter(c => c.content_type === 'simulation').map(content => (
                        <div key={content.id} style={{
                            background: '#f9fafb',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0' }}>{content.title}</h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                                        Content ID: {content.id} | Order: {content.order}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        style={{
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <FaEye /> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SimulationManagement;
