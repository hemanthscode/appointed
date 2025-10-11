import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import { DEPARTMENTS, USER_YEARS } from '../utils';
import { Button, Select, Input, Card, Pagination } from '../components/ui';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ department: '', year: '', search: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await userService.getStudents(filters);
      setStudents(data.students);
      setPagination(data.pagination);
    } catch {
      // handle errors optionally
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const onPageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white mt-10">
      <h2 className="text-3xl mb-6 font-bold">Students</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <Select name="department" value={filters.department} onChange={onFilterChange} className="w-48" options={[{value: '', label:'All Departments'}, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]} />
        <Select name="year" value={filters.year} onChange={onFilterChange} className="w-48" options={[{value: '', label:'All Years'}, ...USER_YEARS.map((y) => ({ value: y, label: y }))]} />
        <Input name="search" value={filters.search} onChange={onFilterChange} placeholder="Search by Name or Email" className="flex-grow min-w-[200px]" />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {students.map((s) => (
              <li key={s._id}>
                <Card className="p-4 bg-gray-900 rounded shadow">
                  <p className="text-xl font-semibold">{s.name}</p>
                  <p>Email: {s.email}</p>
                  <p>Department: {s.department}</p>
                  <p>Year: {s.year}</p>
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

export default StudentsList;
