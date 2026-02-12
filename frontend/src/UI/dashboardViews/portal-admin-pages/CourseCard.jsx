import React from 'react'

export const CourseCard = ({ course, assignedCourses, actionLoading, handlePurchase, handleUnassign, setSelectedCourse }) => {
    return (
        <div key={course.id} className='section item'>
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: course.can_buy
                    ? 'linear-gradient(90deg, #667eea, #764ba2)'
                    : 'linear-gradient(90deg, #10b981, #059669)'
            }}></div>
            <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
                lineHeight: '1.3'
            }}>
                {course.title}
            </h3>
            <p style={{
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0 0 20px 0',
                minHeight: '42px'
            }}>
                {course.description || 'No description available'}
            </p>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontWeight: '500'
                    }}>
                        📚 {course.module_count} module{course.module_count !== 1 ? 's' : ''}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: '#059669',
                        fontWeight: '700'
                    }}>
                        💰 ${course.price}
                    </div>
                </div>
                {!assignedCourses && <>
                    {course.is_assigned ? (
                        <div style={{
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            ✅ Assigned
                        </div>
                    ) : course.is_pending_request ? (
                        <div style={{
                            background: '#fef3c7',
                            color: '#d97706',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            ⏳ Pending Approval
                        </div>
                    ) : (

                        <button
                            onClick={() => handlePurchase(course.id, course.title, course.price)}
                            disabled={actionLoading === course.id}
                            className={`action-new ${actionLoading === course.id ? 'not-allowed' : 'blue'}`}
                        >
                            {actionLoading === course.id ? '⏳ Requesting...' : '� Request Purchase'}
                        </button>

                    )}
                </>
                }
                {assignedCourses && (
                    <div className='flex flex-column gap8'>

                        <button
                            onClick={() => setSelectedCourse(course)}
                            className={`action-new ${actionLoading === course.id ? 'not-allowed' : 'blue'}`}

                        >
                            👥 Assign to Employees
                        </button>
                        <button
                            onClick={() => handleUnassign(course.id, course.title)}
                            disabled={actionLoading === course.id}
                            className={`action-new ${actionLoading === course.id ? 'not-allowed' : 'red'}`}
                        >
                            {actionLoading === course.id ? '⏳...' : '🗑️ Remove'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
