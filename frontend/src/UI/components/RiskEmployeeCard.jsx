import React from 'react'
import { ProgressBar } from './PregressBar'

export const RiskEmployeeCard = ({ empData, keyValue, classValue }) => {
    return (
        <div key={keyValue}
            className={`risk-card ${classValue}`}>
            <div className='data'>
                <div >
                    <div className='bold2'>{empData.username}</div>
                    <div className='email'>{empData.email}</div>
                </div>
                <div
                    className='status-tag risk'>
                    At Risk
                </div>
            </div>

            <div className='title'>
                Risk courses:
            </div>
            {empData.risk_courses.map((course, index) => (
                <div key={index +'c'} className='progress'>
                    <div className='first'>
                        <div className='bold'>{course.title}</div>
                        <div style={{
                            color: course.risk_score > 70 ? '#dc2626' : '#f59e0b',
                            fontWeight: '600'
                        }}>
                            Risk Score: {course.risk_score}
                        </div>
                    </div>

                    <div className='email title'>
                        Current progress: {course.progress.toFixed(1)}%
                    </div>

                    <ProgressBar percentage={course.progress} color={course.risk_score > 70
                        ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                        : 'linear-gradient(90deg, #f59e0b, #fbbf24)'} />
                </div>
            ))}
        </div>
    )
}
