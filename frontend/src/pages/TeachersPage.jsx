import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Layout } from '../components/common';
import { TeacherCard } from '../components/cards';
import { Input } from '../components/ui';
import { TEACHERS, DEPARTMENTS, ROUTES, ANIMATIONS } from '../data';
import { filterBySearch } from '../utils';

const TeachersPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const bookAppointment = (teacherId) => {
    navigate(`${ROUTES.APPOINTMENTS}/${teacherId}`);
  };

  const sendMessage = (teacherId) => {
    navigate(`${ROUTES.MESSAGES}?teacher=${teacherId}`);
  };

  // Filter teachers based on search and department
  let filteredTeachers = TEACHERS;
  
  if (searchTerm) {
    filteredTeachers = filterBySearch(filteredTeachers, searchTerm, ['name', 'subject', 'department']);
  }
  
  if (selectedDepartment !== 'all') {
    filteredTeachers = filteredTeachers.filter(teacher => teacher.department === selectedDepartment);
  }

  return (
    <Layout 
      headerTitle="Search Teachers"
      headerBackTo={ROUTES.DASHBOARD}
    >
      <div className="p-6">
        {/* Search and Filter */}
        <motion.div 
          className="mb-8 space-y-4"
          {...ANIMATIONS.fadeInUp}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-5 w-5" />}
              />
            </div>
            
            <div className="md:w-64">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Teachers Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="initial"
          animate="animate"
          variants={ANIMATIONS.staggerChildren}
        >
          {filteredTeachers.map((teacher, index) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onBook={bookAppointment}
              onMessage={sendMessage}
              index={index}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredTeachers.length === 0 && (
          <motion.div 
            className="text-center py-16"
            {...ANIMATIONS.fadeInUp}
          >
            <div className="text-center">
              <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No teachers found</h3>
              <p className="text-gray-400">
                Try adjusting your search criteria or department filter.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default TeachersPage;
