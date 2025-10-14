import React, { useState, useEffect } from 'react';
import { Layout } from '../components/common';
import { Button, Card } from '../components/ui';
import adminService from '../services/adminService';
import { useToast } from '../contexts/ToastContext';

const RequestsPage = () => {
  const toast = useToast();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [totalPages, setTotalPages] = useState(0);

  const loadApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getApprovals({ page, limit });
      setApprovals(data);
      setTotalPages(data.pagination?.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Failed to load requests.');
      toast.addToast('Failed to load requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [page]);

  const handleRequestAction = async (action, id) => {
    setLoading(true);
    try {
      if (action === 'approve') {
        await adminService.approveUser(id);
        toast.addToast('User approved.', 'success');
      } else if (action === 'reject') {
        await adminService.rejectUser(id);
        toast.addToast('User rejected.', 'warning');
      }
      loadApprovals();
    } catch {
      toast.addToast('Action failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout headerTitle="User Approvals">
      <section className="max-w-4xl mx-auto p-6 space-y-6">
        {loading ? (
          <p>Loading approvals...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : approvals.length === 0 ? (
          <p>No pending approvals.</p>
        ) : (
          <ul className="space-y-4">
            {approvals.map((approval) => (
              <li key={approval._id}>
                <Card className="flex justify-between p-4 items-center">
                  <div>
                    <p className="font-semibold">{approval.name}</p>
                    <p className="text-sm">{approval.email}</p>
                    <p className="text-sm uppercase">{approval.role}</p>
                  </div>
                  <div className="space-x-3">
                    <Button variant="success" size="small" onClick={() => handleRequestAction('approve', approval._id)}>Approve</Button>
                    <Button variant="danger" size="small" onClick={() => handleRequestAction('reject', approval._id)}>Reject</Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-4">
            <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="self-center">Page {page} of {totalPages}</span>
            <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default RequestsPage;
