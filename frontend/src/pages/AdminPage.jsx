import React, { useState, useEffect } from 'react';
import { Layout } from '../components/common';
import { Card, Button, Badge } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import adminService from '../services/adminService';

const AdminPage = () => {
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingApprovals, setLoadingApprovals] = useState(false);

  // Load users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getUsers({ page: 1, limit: 20 });
      setUsers(data.users);
    } catch {
      toast.addToast('Failed to load users', 'error');
    }
    setLoadingUsers(false);
  };

  // Load approvals
  const loadApprovals = async () => {
    setLoadingApprovals(true);
    try {
      const data = await adminService.getApprovals({ page: 1, limit: 20 });
      setApprovals(data.approvals);
    } catch {
      toast.addToast('Failed to load approvals', 'error');
    }
    setLoadingApprovals(false);
  };

  useEffect(() => {
    loadUsers();
    loadApprovals();
  }, []);

  // Approve or reject user
  const handleApprove = async (id) => {
    try {
      await adminService.approveUser(id);
      toast.addToast('User approved successfully', 'success');
      loadApprovals();
    } catch {
      toast.addToast('Failed to approve user', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectUser(id);
      toast.addToast('User rejected', 'warning');
      loadApprovals();
    } catch {
      toast.addToast('Failed to reject user', 'error');
    }
  };

  return (
    <Layout headerTitle="Admin Dashboard">
      <section className="max-w-6xl mx-auto p-6 space-y-8 text-white">
        <h1 className="text-3xl font-bold mb-4">User Approvals</h1>
        {loadingApprovals ? (
          <p>Loading approvals...</p>
        ) : approvals.length === 0 ? (
          <p>No user approvals pending.</p>
        ) : (
          <ul className="space-y-4">
            {approvals.map(({ _id, name, email, status }) => (
              <Card key={_id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-gray-400">{email}</p>
                  <Badge variant={status === 'pending' ? 'warning' : 'info'}>{status}</Badge>
                </div>
                <div className="flex space-x-2">
                  <Button size="small" variant="success" onClick={() => handleApprove(_id)}>
                    Approve
                  </Button>
                  <Button size="small" variant="danger" onClick={() => handleReject(_id)}>
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </ul>
        )}

        <h2 className="text-2xl font-bold mt-12 mb-4">Users</h2>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="space-y-4">
            {users.map(({ _id, name, email, role, status }) => (
              <Card key={_id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-gray-400">{email}</p>
                  <Badge variant={role === 'admin' ? 'primary' : 'info'}>{role}</Badge>{' '}
                  <Badge variant={status === 'active' ? 'success' : 'danger'}>{status}</Badge>
                </div>
                <div>
                  {/* Add user management buttons here if needed */}
                </div>
              </Card>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
};

export default AdminPage;
