import React, { useEffect, useState } from 'react';
import * as adminService from '../../api/adminService';
import UserCard from '../../components/cards/UserCard';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/common/Loader';

const Approvals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApprovals = (page = 1) => {
    setLoading(true);
    adminService
      .getApprovals({ page })
      .then(({ data }) => {
        setPendingUsers(data.data);
        setPagination(data.pagination);
      })
      .catch(() => setError('Failed to load pending approvals'))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await adminService.approveUser(id);
      fetchApprovals(pagination.page);
    } catch {
      alert('Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await adminService.rejectUser(id);
      fetchApprovals(pagination.page);
    } catch {
      alert('Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <main className="p-4 text-black">
      <h1 className="text-3xl mb-4 font-bold">User Approvals</h1>
      {pendingUsers.length === 0 ? (
        <p>No users pending approval.</p>
      ) : (
        pendingUsers.map((user) => (
          <div key={user._id} className="mb-4 border border-black rounded p-4 bg-white flex justify-between items-center">
            <UserCard user={user} />
            <div className="space-x-2">
              <button disabled={actionLoading} className="bg-black text-white px-3 py-1 rounded" onClick={() => handleApprove(user._id)}>
                Approve
              </button>
              <button disabled={actionLoading} className="bg-white text-black border border-black px-3 py-1 rounded" onClick={() => handleReject(user._id)}>
                Reject
              </button>
            </div>
          </div>
        ))
      )}
      <Pagination pagination={pagination} onPageChange={fetchApprovals} />
    </main>
  );
};

export default Approvals;
