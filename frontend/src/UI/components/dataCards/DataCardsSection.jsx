import React from 'react';

const CustomCard = ({
    title,
    data,
    type,
    keyValue = 'label',
    value = 'value',
    valueText,
    typeValue,
    typeText = '',
    classValue = '',
    secondText,
    secondValue,
    tagText,
    tagValue,

}) => {
    if (!data || data.length === 0) {
        return (
            <div className={`section card ${classValue}`}>
                <h3>{title}</h3>

                <p className="card-body text-center">No data available</p>
            </div>
        );
    }

    const renderContent = () => {
        switch (type) {
            case 1:
                return (
                    <div className={`activity-stats top-learners `}>
                        {data.map((stat, index) => (
                            <div key={index} className="card learner-item">
                                {typeText?.length > 0 ? (
                                    <>
                                        <span className="username">{stat[keyValue]}</span>
                                        <span className="progress">{stat[value]}{typeText}</span>
                                    </>
                                ) : <>
                                    <span>{stat[keyValue]}: {stat[value]}</span>
                                </>
                                }
                            </div>
                        ))}
                    </div>
                );
            case 2:
                return (
                    <div className={`quiz-trends `}>
                        {data.map((trend, index) => (
                            <div key={index} className="card quiz-trend-item">
                                <div className="card-header">{trend[keyValue]}</div>
                                <div className="card-body">
                                    <span className="score">{trend[value]}%</span>
                                    <span className="attempts">{trend[typeValue]} {typeText}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 3:
                return (
                    <div className={`content-interactions `}>
                        {data.map((interaction, index) => (
                            <div key={index} className="card interaction-item">
                                <span className="type">{interaction[keyValue]}</span>
                                <span className="count">{interaction[value]} {valueText}</span>
                            </div>
                        ))}
                    </div>
                );
            case 4:
                return (
                    <div className={`system-metrics `}>
                        {data.slice(0, 10).map((metric, index) => {
                            let valueClass = "metric-value";
                            if (metric.name.toLowerCase().includes("cpu") || metric.name.toLowerCase().includes("memory")) {
                                if (metric.value < 50) valueClass += " good";
                                else if (metric.value > 85) valueClass += " bad";
                                else valueClass += " warning";
                            }
                            return (
                                <div key={index} className="metric-card">
                                    <div className="metric-header">{metric[keyValue]}</div>
                                    <div className={valueClass}>
                                        {metric[value]} {metric[valueText]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            case 5:
                return (
                    <div className={`api-usage `}>
                        {data.map((api, index) => (
                            <div key={index} className="api-item">
                                <span className="endpoint">{api[keyValue]}</span>
                                <span className="requests">{api[value]} {valueText}</span>
                                <span className="response-time">{api[typeValue]}{typeText}</span>
                            </div>
                        ))}
                    </div>
                );
            case 6:
                return (
                    <div className={`popular-courses `}>
                        {data?.map((course, index) => (
                            <div key={index} className="course-item">
                                <span className="course-title">{course[keyValue]}</span>
                                <span className="enrollment-count">{course[value]} {typeText}</span>
                            </div>
                        ))}
                    </div>
                );
            case 7:
                return (
                    <div className={`completion-rates `}>
                        {data?.map((course, index) => (
                            <div key={index} className="completion-item">
                                <div className="course-name">{course[keyValue]}</div>
                                <div className="completion-stats">
                                    <span>{typeText}{course[typeValue]}</span>
                                    <span>{secondText} {course[secondValue]}</span>
                                    <span className="rate">{course[tagText]}{tagValue}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 8:
                return (
                    <div className={`role-stats `}>
                        {data?.map((role, index) => (
                            <div key={index + role[keyValue]} className={`role-item  `} >
                                <span className="role-name">{role[keyValue]}{valueText}</span>
                                <span className="role-count">{role[value]} {typeText}</span>
                            </div>
                        ))}
                    </div>
                )
            case 9:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className={``}>
                        {data.map((course, index) => (

                            <div key={index}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ fontWeight: '500' }}>{course[keyValue]}</div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}>
                                        <span>{course[value]} {typeText}</span>
                                        <span style={{
                                            fontWeight: '600',
                                            color: course[secondValue] > 75 ? '#10b981' :
                                                course[secondValue] > 40 ? '#3b82f6' : '#f59e0b'
                                        }}>
                                            {course[secondValue]?.toFixed(1) || 50}%
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: '#f3f4f6',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${course[secondValue]}%`,
                                        height: '100%',
                                        background: course[secondValue] > 75 ? 'linear-gradient(90deg, #10b981, #059669)' :
                                            course[secondValue] > 40 ? 'linear-gradient(90deg, #3b82f6, #1e40af)' :
                                                'linear-gradient(90deg, #f59e0b, #d97706)',
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            case 10:
                return (
                    <div className="top-users">
                        {data?.map((user, index) => (
                            <div key={index + user[keyValue]} className="user-item">
                                <span className="username">{role[keyValue]}{valueText}</span>
                                <span className="sessions">{role[value]} {typeText}</span>
                            </div>
                        ))}
                    </div>
                )
            default:
                return <div >No content for type {type}</div>;
        }
    };

    return (
        <div className={`section ${classValue}`}>
            <h3>{title}</h3>
            {renderContent()}
        </div>
    );
};

const DataCardsSection = ({
    title = 'title',
    dataCards = [],
    type = 1,
    keyValue,
    value,
    valueText,
    text,
    typeValue,
    typeText,
    secondText,
    secondValue,
    tagText,
    tagValue,
    classValue

}) => {
    // if (!dataCards || dataCards.length === 0) {
    //     return <div className='text'>No metrics data available</div>;
    // }

    // Fix: Use strict equality
    if (type === 1) {
        return (
            <CustomCard
                title={title}
                data={dataCards}
                type={1}
                keyValue={keyValue || 'label'}
                value={value || 'value'}
                typeText={typeText}
                classValue={classValue}
            />
        );
    }

    if (type === 2) {
        return (
            <CustomCard
                title={title}
                data={dataCards}
                type={2}
                keyValue={keyValue || 'date'}
                value={value || 'avg_score'}
                typeValue={typeValue || 'attempt_count'}
                typeText={typeText || 'attempts'}
                classValue={classValue}
            />
        );
    }

    if (type === 3) {
        return (
            <CustomCard
                title={title}
                data={dataCards}
                type={3}
                keyValue={keyValue}
                value={value}
                valueText={valueText}
                classValue={classValue}
            />
        );
    }

    if (type === 4) {
        return (
            <CustomCard
                title="🖥️ System Metrics"
                data={dataCards}
                type={4}
                valueText={valueText}
                keyValue={keyValue}
                value={value}
                classValue={classValue}
            />
        );
    }

    if (type === 5) {
        return (
            <CustomCard
                title="API Usage Statistics"
                data={dataCards}
                type={5}
                typeValue={typeValue}
                typeText={typeText}
                value={value}
                valueText={valueText}
                keyValue={keyValue}
                classValue={classValue}
            />
        );
    }
    if (type == 6) {
        return (
            <CustomCard
                title={title}
                data={dataCards}
                type={6}
                keyValue={keyValue}
                value={value}
                typeText={typeText}
                classValue={classValue}
            />
        );
    }
    if (type == 7) {
        return (
            <CustomCard
                title={title}
                data={dataCards}
                type={7}
                keyValue={keyValue}
                typeText={typeText}
                typeValue={typeValue}
                secondText={secondText}
                secondValue={secondValue}
                tagText={tagText}
                tagValue={tagValue}
                classValue={classValue}
            />
        )
    }
    if (type == 8) {
        return (
            <CustomCard
                title={title}
                data={dataCards}
                type={8}
                value={value}
                valueText={valueText}
                keyValue={keyValue}
                typeText={typeText}
                typeValue={typeValue}
                secondText={secondText}
                secondValue={secondValue}
                tagText={tagText}
                tagValue={tagValue}
                classValue={classValue}
            />
        );
    }
    if (type == 9) {
        return (
            <CustomCard
                title={title}
                data={dataCards}
                type={9}
                value={value}
                valueText={valueText}
                keyValue={keyValue}
                typeText={typeText}
                typeValue={typeValue}
                secondText={secondText}
                secondValue={secondValue}
                tagText={tagText}
                tagValue={tagValue}
                classValue={classValue}
            />
        );
    }
    return null;
};

export default DataCardsSection;