import React, { useState } from 'react';
import { Layout } from '../components/common';
import { Card, Button, Pagination } from '../components/ui';
import { useUsers, useApprovals, useSystemStats, useSettings } from '../hooks/useAdminUsers';
import adminService from '../services/adminService';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const labelMap = {
  students: 'Students',
  teachers: 'Teachers',
  admins: 'Admins',
  total: 'Total',
  active: 'Active',
  pending: 'Pending',
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  departments: 'Departments',
  appointments: 'Appointments',
  recentActivity: 'Recent Activity',
};

const AdminPage = () => {
  const { users, pagination: usersPagination, loading: usersLoading, error: usersError, refresh: refreshUsers } = useUsers();
  const { approvals, pagination: approvalsPagination, loading: approvalsLoading, error: approvalsError, refresh: refreshApprovals } = useApprovals();
  const { stats, loading: statsLoading, error: statsError } = useSystemStats();
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleApproveUser = async (id) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await adminService.approveUser(id);
      refreshApprovals();
      refreshUsers();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectUser = async (id) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await adminService.rejectUser(id);
      refreshApprovals();
      refreshUsers();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        <h1 className="text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>

        {/* Users Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Users</h2>
          {usersLoading && <p>Loading users...</p>}
          {usersError && <p className="text-red-600">{usersError}</p>}
          <div className="space-y-4 max-h-96 overflow-auto">
            {users.map(user => (
              <Card key={user._id} className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{user.name}</span> &mdash; <span className="text-sm text-gray-300">{user.role.toUpperCase()}</span>
                  <div className="text-gray-400 text-sm">{user.email}</div>
                </div>
                {/* Placeholder for User actions */}
              </Card>
            ))}
          </div>
          <Pagination pagination={usersPagination} onChange={refreshUsers} />
        </section>

        {/* Approvals Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Pending Approvals</h2>
          {approvalsLoading && <p>Loading approvals...</p>}
          {approvalsError && <p className="text-red-600">{approvalsError}</p>}
          <div className="space-y-4 max-h-96 overflow-auto">
            {approvals.map(approval => (
              <Card key={approval._id} className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{approval.name}</span> &mdash; <span className="text-sm text-gray-500">{approval.type.toUpperCase()}</span>
                  <div className="text-gray-400 text-sm">{approval.email}</div>
                </div>
                <div className="space-x-3">
                  <Button loading={actionLoading} onClick={() => handleApproveUser(approval._id)} variant="success" size="small">Approve</Button>
                  <Button loading={actionLoading} onClick={() => handleRejectUser(approval._id)} variant="danger" size="small">Reject</Button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination pagination={approvalsPagination} onChange={refreshApprovals} />
        </section>

        {/* System Stats Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">System Statistics</h2>
          {statsLoading && <p>Loading stats...</p>}
          {statsError && <p className="text-red-600">{statsError}</p>}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(stats).map(([key, value]) => (
                <Card key={key} className="p-6 text-left">
                  <h3 className="text-lg font-bold mb-4">{labelMap[key] || key}</h3>
                  {Array.isArray(value) ? (
                    <table className="w-full text-sm border border-gray-700 rounded">
                      <thead className="bg-gray-800">
                        <tr>
                          {Object.keys(value[0] || {}).filter(k => k !== '_id').map(col => (
                            <th key={col} className="p-2 border-r border-gray-700 text-left capitalize">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {value.map((item, idx) => (
                          <tr key={item._id || idx} className={idx % 2 === 0 ? 'bg-gray-900' : ''}>
                            {Object.entries(item).filter(([k]) => k !== '_id').map(([col, val]) => (
                              <td key={col} className="p-2 border-r border-gray-700">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : typeof value === 'object' && value !== null ? (
                    <div className="space-y-2">
                      {Object.entries(value).map(([subKey, subVal]) => (
                        <div key={subKey} className="flex justify-between text-sm">
                          <span className="capitalize">{subKey.replace(/([A-Z])/g, ' $1')}</span>
                          <span>{subVal}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-4xl font-extrabold">{value}</div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Optional Settings Section can be added here */}

        {actionError && <p className="text-red-600 mt-4 font-semibold">{actionError}</p>}
      </div>
    </Layout>
  );
};

export default AdminPage;
