import React, { useState, useEffect } from 'react';
import { StatsCard, StatsGrid } from '../../components/dataCards/StatsGrid';
import DataCardsSection from '../../components/dataCards/DataCardsSection';
import { getToken, parseJwt } from '../../../utils/auth';
import { RiskEmployeeCard } from '../../components/RiskEmployeeCard';
import NoDataDisplay from '../../components/NoDataDisplay';
const PortalDashboard = () => {
  const [stats, setStats] = useState({
    organization: {
      employees_at_risk: 0,
      overall_completion_rate: 0,
      total_courses: 0,
      total_employees: 0
    },
    course_statistics: [
    ],
    employees_at_risk: [
    ]
  });
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statsData, setStatsData] = useState([])
  const [employeesAtRisk, setEmployeesAtRisk] = useState([])
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        const payload = token ? parseJwt(token) : null;
        const username = payload?.username;
        if (!username) {
          setError('User information not found');
          setLoading(false);
          return;
        }
        // Fetch organization statistics
        const orgResponse = await fetch(`/api/portal_admin/organization_statistics?username=${username}`);
        const orgData = await orgResponse.json();
        if (orgData.success) {
          const data = orgData.data;
          setStats(orgData);
          setStatsData([
            { id: 1, title: 'Employees at Risk', value: 0, trend: 1 },
            { id: 2, title: 'Overall Completion', value: data.avg_progress.toFixed(1) + "%", trend: 1 },
            { id: 3, title: 'Assigned Courses', value: data.offered_courses?.length || 0, trend: -3 },
            { id: 4, title: 'Total Employees', value: data.total_employees, trend: 5 }
          ])

          setEmployeesAtRisk(stats.employees_at_risk)
        } else {
          setError(orgData.error || 'Failed to fetch statistics');
        }
        // Fetch system-wide statistics (optional, can be removed if not needed)
        // const sysResponse = await fetch(`/api/portal_admin/system_stats?username=${username}`);
        // const sysData = await sysResponse.json();
        // if (sysData.success) setSystemStats(sysData);
      } catch (err) {
        setError('Network error while fetching statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid #f3f4f6',
            borderTopColor: '#3b82f6',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ color: '#6b7280', fontSize: '16px' }}>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '20px',
          color: '#dc2626'
        }}>
          <h3 style={{ marginTop: 0 }}>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  // Dashboard display when stats are loaded
  return (
    <div>
      {stats ? (
        <>
          <StatsGrid>
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                colorIndex={index}
                trend={stat.trend}
                icon={index === 0 ? '👥' : index === 1 ? '📚' : index === 2 ? '✅' : index === 3 ? '⚠️' : null}
              />
            ))}
          </StatsGrid>
          <div className="flex-container">
            {stats && stats.course_statistics &&
              <DataCardsSection title='Course Completion Rates' dataCards={stats.course_statistics}
                keyValue={'title'} value={'enrolled_count'} type={9} classValue='flex-item'
                typeText='enrolled' secondValue={'completion_rate'} />}

            {/* Employees at Risk */}

            <div
              className='flex-item section'>
              <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '20px', fontWeight: '600', color: '#dc2626' }}>
                Employees at Risk
              </h2>

              {employeesAtRisk.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {employeesAtRisk.map((emp, index) => (
                    <RiskEmployeeCard classValue="flex-item" key={index} empData={emp} keyValue={index + emp.id} />
                  ))}
                </div>
              ) : (
                // <p className='text-center'>No Employee at risk</p>
                <NoDataDisplay icon="🧑‍💼" message={'No Employee at risk'} />
              )}

            </div>
          </div>

        </>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          padding: '40px 24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '24px' }}>Welcome to your Dashboard</h2>
          <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto' }}>
            Loading organization statistics...
          </p>
        </div>
      )}
    </div>
  );
}

export default PortalDashboard;