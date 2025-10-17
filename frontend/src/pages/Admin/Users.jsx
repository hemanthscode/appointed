import React, { useEffect, useState } from 'react';
import * as adminService from '../../api/adminService';
import UserCard from '../../components/cards/UserCard';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/common/Loader';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = (page = 1) => {
    setLoading(true);
    adminService
      .getUsers({ page })
      .then(({ data }) => {
        setUsers(data.data);
        setPagination(data.pagination);
      })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <main className="p-4 text-black">
      <h1 className="text-3xl mb-4 font-bold">Users</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        users.map((user) => <UserCard key={user._id} user={user} />)
      )}
      <Pagination pagination={pagination} onPageChange={fetchUsers} />
    </main>
  );
};

export default Users;
