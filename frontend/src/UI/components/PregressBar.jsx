import React from 'react'

export const ProgressBar = ({percentage, color = 'linear-gradient(90deg, #3b82f6, #8b5cf6)'}) => {
    return(
    <div style={{
        width: '100%',
        height: '8px',
        background: '#f3f4f6',
        borderRadius: '4px',
        overflow: 'hidden'
    }}>
        <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: color,
            borderRadius: '4px'
        }}></div>
    </div>
    )

}
