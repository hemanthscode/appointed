import React, { useEffect, useState } from 'react';
import * as adminService from '../../api/adminService';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService
      .getSystemStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <main className="p-4 text-black">
      <h1 className="text-3xl mb-4 font-bold">Admin Dashboard</h1>
      <pre className="whitespace-pre-wrap bg-white p-4 border border-black rounded">{JSON.stringify(stats, null, 2)}</pre>
    </main>
  );
};

export default Dashboard;
