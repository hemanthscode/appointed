import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import { DEPARTMENTS } from '../utils';
import Pagination from '../components/user/Pagination';
import { Button, Select, Input, Card } from '../components/ui';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({ department: '', subject: '', search: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(false);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await userService.getTeachers(filters);
      setTeachers(data.teachers);
      setPagination(data.pagination);
    } catch {
      // handle errors optionally
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [filters]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const onPageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h2 className="text-3xl mb-6 font-bold">Teachers</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <Select name="department" value={filters.department} onChange={onFilterChange} className="w-48" options={[{value: '', label:'All Departments'}, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]} />
        <Input name="subject" value={filters.subject} onChange={onFilterChange} placeholder="Filter by Subject" className="flex-grow min-w-[200px]" />
        <Input name="search" value={filters.search} onChange={onFilterChange} placeholder="Search by Name/Department/Subject" className="flex-grow min-w-[200px]" />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : teachers.length === 0 ? (
        <p>No teachers found.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {teachers.map((t) => (
              <li key={t._id}>
                <Card className="p-4 bg-gray-900 rounded shadow">
                  <p className="text-xl font-semibold">{t.name}</p>
                  <p>Subject: {t.subject}</p>
                  <p>Department: {t.department}</p>
                  <p>Availability: {t.availability}</p>
                  <p>Next Slot: {t.nextSlot}</p>
                </Card>
              </li>
            ))}
          </ul>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
};

export default TeachersList;
