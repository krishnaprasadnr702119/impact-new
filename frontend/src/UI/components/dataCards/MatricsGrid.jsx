import React from 'react'

const MatricsGrid = ({ metricsData = [] }) => {
    if (!metricsData || metricsData.length === 0) return <div className='tex'>No metrics available</div>;
    return (
        <div className="metrics-grid">
            {metricsData.map((metric, index) => (
                <div className="metric-card" key={index}>
                    <h3>{metric.title}</h3>
                    <div className="metric-value">{metric.value}</div>
                    {metric.sub && <div className="metric-sub">{metric.sub}</div>}
                </div>
            ))}
        </div>

    )
}

export default MatricsGrid