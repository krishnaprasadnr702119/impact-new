import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Tabs, { TabPanel } from "../../components/Tab";
import DataCardsSection from "../../components/dataCards/DataCardsSection";
import { RiskEmployeeCard } from "../../components/RiskEmployeeCard";
import GridTable, { TableActions, TableButton } from "../../components/grid/GridTable";

const EmployeeTable = ({ employeeData }) => {
  const employeeColumns = [
    {
      header: "Employee",
      field: "username",
      align: "left",
      width: "1fr",
      render: (row) => (
        <div className="bold text-left">
          <div>{row.username}</div>
          <div className="subtext">{row.email}</div>
        </div>
      )
    },
    {
      header: "Designation",
      field: "designation",
      align: "left",
      width: "180px",
      render: (row) => row.designation || 'N/A'
    },
    {
      header: "Assigned",
      field: "assigned_count",
      width: "100px"
    },
    {
      header: "Completed",
      field: "completed_count",
      width: "100px"
    },
    {
      header: "Avg Progress",
      field: "avg_progress",
      width: "120px",
      render: (row) => `${row.avg_progress.toFixed(1)}%`
    },
    {
      header: "High Risk",
      field: "high_risk_count",
      width: "100px",
      cellStyle: (row) => ({
        color: row.high_risk_count > 0 ? '#dc2626' : 'inherit',
        fontWeight: row.high_risk_count > 0 ? '600' : 'inherit'
      })
    }
  ];
  return (
    <GridTable
      columns={employeeColumns}
      data={employeeData}
      emptyMessage="No Data available"
    />
  )
}
const CourseTable = ({ courseData }) => {
  const courseColumns = [
    {
      header: "Course Name",
      field: "title",
      align: "left",
      width: "1fr",
      render: (row) => <span className="bold">{row.title}</span>
    },
    {
      header: "Enrolled",
      field: "enrolled_count",
      width: "100px"
    },
    {
      header: "Completed",
      field: "completed_count",
      width: "100px"
    },
    {
      header: "Completion Rate",
      field: "completion_rate",
      width: "140px",
      render: (row) => `${row.completion_rate.toFixed(1)}%`
    },
    {
      header: "Avg Progress",
      field: "avg_progress",
      width: "120px",
      render: (row) => `${row.avg_progress.toFixed(1)}%`
    },
    {
      header: "At Risk",
      field: "at_risk_count",
      width: "100px",
      cellStyle: (row) => ({
        color: row.at_risk_count > 0 ? '#dc2626' : 'inherit',
        fontWeight: row.at_risk_count > 0 ? '600' : 'inherit'
      })
    }
  ];
  return (
    <GridTable
      columns={courseColumns}
      data={courseData}
      emptyMessage="No Data available"
    />
  )
}
const PortalAnalyticsContent = ({ username }) => {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [employeesAtRisk, setEmployeesAtRisk] = useState([]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        if (!username) {
          setError('User information not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/portal_admin/organization_statistics?username=${username}`);
        const data = await response.json();

        if (data.success) {
          setStats(data);
          // Use real risk data from API
          setEmployeesAtRisk(data.data?.employees_at_risk || []);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch statistics');
        }
      } catch (err) {
        setError('Network error while fetching statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div style={{
        padding: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
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
            Loading organization statistics...
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{
          background: '#fee2e2',
          borderRadius: '8px',
          padding: '20px',
          color: '#b91c1c',
          fontSize: '16px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          textAlign: 'center'
        }}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!stats) {
    return (
      <div style={{ padding: '32px', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📊</div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 16px 0'
          }}>
            Analytics & Reports
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            margin: 0
          }}>
            No statistics available yet. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Tabs for different analytics views
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Course Analytics' },
    { id: 'employees', label: 'Employee Progress' },
    { id: 'risk', label: 'Risk Assessment' }
  ];

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#6b7280' }}>Loading analytics...</div>
      </div>
    );
  }

  if (error || !stats || !stats.data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#ef4444' }}>
          {error || 'Failed to load analytics data'}
        </div>
      </div>
    );
  }

  const orgData = stats.data;

  return (<>
    <PageHeader
      icon="🏢"
      title={`Analytics Dashboard`}
      subtitle="Real-time insights into your organization's learning progress"
    />

    {/* Organization header */}
    <div className="stat-board">
      <div className="grid">
        <div className="item">
          <div className="value">{orgData.total_employees}</div>
          <div className="key">Total Employees</div>
        </div>

        <div className="item">
          <div className="value">{orgData.offered_courses?.length || 0}</div>
          <div className="key">Total Courses</div>
        </div>

        <div className="item">
          <div className="value">{orgData.avg_progress?.toFixed(1) || 0}%</div>
          <div className="key">Avg Progress</div>
        </div>

        <div className="item">
          <div className={`${employeesAtRisk.length > 0 ? 'value orange' : 'value'}`}>
            {employeesAtRisk.length}
          </div>
          <div className="key">Employees at Risk</div>
        </div>
      </div>
    </div>

    <Tabs
      tabs={tabs}
      variant="pills"
      defaultTab="overview"
      onChange={(tab) => setActiveTab(tab)}
      fullWidth
    />
    <div className="mb24">
      <TabPanel activeTab={activeTab} tabId="overview">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Course Completion Rates */}
          {orgData && orgData.course_statistics && <DataCardsSection title='Course Completion Rates' dataCards={orgData.course_statistics}
            keyValue={'title'} value={'enrolled_count'} type={9} classValue='flex-item'
            typeText='enrolled' secondValue={'completion_rate'} />}

          {/* Top Performing Employees */}
          {orgData && orgData.employee_statistics && <DataCardsSection title='Top Performing Employees' dataCards={orgData.employee_statistics
            .filter(emp => emp.assigned_count > 0)
            .sort((a, b) => b.avg_progress - a.avg_progress)}
            keyValue={'username'} value={'avg_progress'} type={9} classValue='flex-item'
            secondValue={'avg_progress'} />}

        </div>
      </TabPanel>
      <TabPanel activeTab={activeTab} tabId="courses">
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: 0, marginBottom: '20px' }}>
            Course Performance Analysis
          </h3>
          {orgData?.course_statistics && orgData.course_statistics.length > 0 ?
            <CourseTable courseData={orgData.course_statistics} />
            : <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No course data available</div>
          }
        </div>
      </TabPanel>
      <TabPanel activeTab={activeTab} tabId="employees">
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: 0, marginBottom: '20px' }}>
            Employee Progress Summary
          </h3>
          {orgData?.employee_statistics && orgData.employee_statistics.length > 0 ?
            <EmployeeTable employeeData={orgData.employee_statistics} />
            : <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No employee data available</div>
          }
        </div>
      </TabPanel>
      <TabPanel activeTab={activeTab} tabId="risk">
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: 0, marginBottom: '20px' }}>
            Risk Assessment
          </h3>

          {employeesAtRisk.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: '#10b981',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <p>Great news! No employees are currently at risk.</p>
            </div>
          ) :
            <div className="flex-container">
              {employeesAtRisk.map((emp, index) => (
                <RiskEmployeeCard classValue="flex-item" key={index} empData={emp} keyValue={index + emp.id} />
              ))}
            </div>
          }

        </div>
      </TabPanel>
    </div>
  </>
  );
}
export default PortalAnalyticsContent;