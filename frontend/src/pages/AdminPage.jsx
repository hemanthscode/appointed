import React, { useState, useEffect } from 'react';
import { Layout } from '../components/common';
import { Card, Button, Pagination } from '../components/ui';
import { useUsers, useApprovals, useSystemStats } from '../hooks/useAdminUsers';
import { useToast } from '../contexts/ToastContext';

/**
 * Debounce hook to prevent excessive re-renders on page changes.
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const AdminPage = () => {
  const toast = useToast();

  // Pagination state
  const [page, setPage] = useState(1);
  const debouncedPage = useDebounce(page, 300);
  const limit = 10;

  // Hooks for fetching data
  const {
    users,
    pagination: usersPagination,
    loading: usersLoading,
    error: usersError,
    refresh: refreshUsers,
  } = useUsers({ page: debouncedPage, limit });

  const {
    approvals,
    loading: approvalsLoading,
    error: approvalsError,
    refresh: refreshApprovals,
  } = useApprovals({ page: 1, limit: 10 });

  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useSystemStats();

  // Fetch approvals initially
  useEffect(() => {
    refreshApprovals();
  }, [refreshApprovals]);

  // Approve user handler
  const approveUser = async (id) => {
    try {
      await fetch(`/admin/approvals/${id}/approve`, { method: 'PATCH' });
      toast.addToast('User approved successfully.', 'success');
      refreshApprovals();
      refreshUsers();
    } catch {
      toast.addToast('Failed to approve user.', 'error');
    }
  };

  // Reject user handler
  const rejectUser = async (id) => {
    try {
      await fetch(`/admin/approvals/${id}/reject`, { method: 'PATCH' });
      toast.addToast('User rejected.', 'warning');
      refreshApprovals();
      refreshUsers();
    } catch {
      toast.addToast('Failed to reject user.', 'error');
    }
  };

  // Page change handler
  const onPageChange = (newPage) => {
    if (
      newPage !== page &&
      newPage > 0 &&
      newPage <= (usersPagination?.totalPages ?? 1)
    ) {
      setPage(newPage);
    }
  };

  return (
    <Layout headerTitle="Admin Dashboard">
      <div className="max-w-7xl mx-auto p-6 space-y-10 text-white">
        {/* -------------------- SYSTEM STATISTICS -------------------- */}
        <section>
          <h2 className="text-2xl font-bold mb-4">System Statistics</h2>

          {statsLoading ? (
            <p>Loading statistics...</p>
          ) : statsError ? (
            <p className="text-red-500">Failed to load statistics.</p>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card>
                <h3 className="text-lg font-semibold">Total Users</h3>
                <p className="text-3xl">{stats?.totalUsers ?? '-'}</p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold">Pending Approvals</h3>
                <p className="text-3xl">{stats?.pendingApprovals ?? '-'}</p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold">Appointments</h3>
                <p className="text-3xl">{stats?.totalAppointments ?? '-'}</p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold">Departments</h3>
                <p className="text-3xl">
                  {Array.isArray(stats?.departments)
                    ? stats.departments.length
                    : '-'}
                </p>
              </Card>
            </div>
          ) : (
            <p>No statistics available.</p>
          )}
        </section>

        {/* -------------------- PENDING APPROVALS -------------------- */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Pending Approvals</h2>

          {approvalsLoading ? (
            <p>Loading approvals...</p>
          ) : approvalsError ? (
            <p className="text-red-500">Failed to load approvals.</p>
          ) : approvals && approvals.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {approvals.map(({ _id, name, email, role }) => (
                <Card key={_id} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-gray-400">{email}</p>
                    <p className="text-sm uppercase">{role}</p>
                  </div>
                  <div className="space-x-3">
                    <Button
                      size="small"
                      variant="success"
                      onClick={() => approveUser(_id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => rejectUser(_id)}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p>No pending approvals.</p>
          )}
        </section>

        {/* -------------------- USERS -------------------- */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Users</h2>

          {usersLoading ? (
            <p>Loading users...</p>
          ) : usersError ? (
            <p className="text-red-500">Failed to load users.</p>
          ) : users && users.length > 0 ? (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {users.map(({ _id, name, email, role }) => (
                  <Card
                    key={_id}
                    className="p-4 flex justify-between items-center"
                  >
                    <p>
                      {name} ({email}) – {role?.toUpperCase?.() ?? 'UNKNOWN'}
                    </p>
                  </Card>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={usersPagination?.totalPages ?? 1}
                onPageChange={onPageChange}
              />
            </>
          ) : (
            <p>No users found.</p>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default AdminPage;
