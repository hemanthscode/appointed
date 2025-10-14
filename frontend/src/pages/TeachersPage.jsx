// pages/TeachersPage.jsx
import React, { useState } from 'react';
import { Layout } from '../components/common';
import { Card, Button, Select, Input, Badge } from '../components/ui';
import useTeachers from '../hooks/useTeachers';
import { DEPARTMENTS } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';

const TeachersPage = () => {
  const toast = useToast();

  const [filters, setFilters] = useState({ department: '', subject: '', search: '', page: 1, limit: 10 });
  const { teachers, pagination, loading, error, reload } = useTeachers(filters);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const onPageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (error) return <Layout><div className="text-red-500 p-6">Failed to load teachers.</div></Layout>;

  return (
    <Layout headerTitle="Teachers">
      <section className="max-w-5xl mx-auto p-6 text-white">
        <h2 className="text-3xl mb-6 font-bold">Teachers</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          <Select
            name="department"
            value={filters.department}
            onChange={onFilterChange}
            className="w-48"
            options={[{ value: '', label: 'All Departments' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
          />
          <Input
            name="subject"
            value={filters.subject}
            onChange={onFilterChange}
            placeholder="Filter by Subject"
            className="flex-grow min-w-[200px]"
          />
          <Input
            name="search"
            value={filters.search}
            onChange={onFilterChange}
            placeholder="Search by Name/Department/Subject"
            className="flex-grow min-w-[200px]"
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : teachers.length === 0 ? (
          <p>No teachers found.</p>
        ) : (
          <ul className="space-y-4">
            {teachers.map(({ _id, name, subject, department, availability, nextSlot }) => (
              <li key={_id}>
                <Card className="p-4 bg-gray-900 rounded shadow">
                  <p className="text-xl font-semibold">{name}</p>
                  <p>Subject: {subject}</p>
                  <p>Department: {department}</p>
                  <p>
                    Availability: <Badge variant={availability === 'Available' ? 'success' : 'danger'}>{availability}</Badge>
                  </p>
                  <p>Next Slot: {nextSlot}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-4">
            <Button
              variant="secondary"
              disabled={filters.page <= 1}
              onClick={() => onPageChange(filters.page - 1)}
            >
              Previous
            </Button>
            <span className="self-center">
              Page {filters.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => onPageChange(filters.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default TeachersPage;
