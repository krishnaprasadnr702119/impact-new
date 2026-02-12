import { useEffect, useState } from "react";
import { FaUsers,FaCheck } from "react-icons/fa";
import PageHeader from "../../components/PageHeader";
import UserCard from "../../components/dataCards/UserCard";
import SearchBar from "../../components/SearchBar";

// Total Users List Component
const TotalUsersList = ({ username }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/all_users?username=${username}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setUsers(data.users);
          setFilteredUsers(data.users);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch users');
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Network error when fetching users');
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchUsers();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, [username]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.designation && user.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.organization && user.organization.name && user.organization.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  return (
    <>
      <PageHeader
        icon="👥 "
        title="Total Users"
        subtitle="View and manage all users in the system">
        <div style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#3730a3',
          border: '1px solid rgba(59,130,246,0.2)'
        }}>
          {filteredUsers.length} of {users.length} Total
        </div>
      </PageHeader>

      <div
        className="content-card-section"
      >
        {/* Search Bar */}
        <SearchBar placeholder="🔍  Search users by name, email, role, designation, or organization..." searchTerm={searchTerm} onSearch={(e) => setSearchTerm(e)} />
        {loading ? (
          <div className="loader-box-section">
            <div className="loader-box-card"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-box">
            <h3 >Error Loading Data</h3>
            <p >{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="box">
            <FaUsers className="icon" />
            <h3 >
              {users ? 'No Users Found' : 'No Result Found'}
            </h3>
            <p >
              {users ? 'There are currently no users in the system.':'No users match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                username={user.username}
                email={user.email}
                designation={user.designation || 'No designation'}
                organization={user.organization}
                createdAt={user.created_at}
                role={user.role}
                showRoleBadge={true}
              />
            ))}
          </div>
        )}
      </div >
    </>
  );
}
export default TotalUsersList;