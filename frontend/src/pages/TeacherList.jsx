// pages/TeachersList.jsx
import React from 'react';
import { Layout } from '../components/common';
import { Card, Pagination } from '../components/ui';
import TeacherCard from '../components/cards/TeacherCard';
import useTeachers from '../hooks/useTeachers';

const TeachersList = () => {
  const { teachers, loading, pagination, error, reload } = useTeachers();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold">Teachers</h2>
        {error && <div className="text-red-500">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          teachers.map((teacher) => (
            <Card key={teacher._id} hoverable>
              <TeacherCard teacher={teacher} />
            </Card>
          ))
        )}
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={reload} />
      </div>
    </Layout>
  );
};

export default TeachersList;
