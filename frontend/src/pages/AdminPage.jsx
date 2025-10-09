import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Layout } from '../components/common';
import { Card, Button, Input, Badge } from '../components/ui';
import { useApi, useAuth } from '../hooks';
import { ROUTES, ANIMATIONS } from '../data';
import { apiService } from '../services/api';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('teachers');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch teachers, students, approvals from API
  const {
    data: teachers = [],
    refetch: refetchTeachers
  } = useApi(() => apiService.users.getTeachers(), [activeTab === 'teachers']);

  const {
    data: students = [],
    refetch: refetchStudents
  } = useApi(() => apiService.users.getStudents(), [activeTab === 'students']);

  const {
    data: approvals = [],
    refetch: refetchApprovals
  } = useApi(() => apiService.admin.getApprovals(), [activeTab === 'approvals']);

  // Approval action handler
  const handleApproval = async (id, action) => {
    try {
      if (action === 'approve') {
        await apiService.admin.approveUser(id);
      } else if (action === 'reject') {
        await apiService.admin.rejectUser(id);
      }
      // Refresh approvals list after action
      refetchApprovals();
    } catch (error) {
      console.error(`${action} approval error:`, error);
    }
  };

  // Filter helpers for searchTerm
  const filterItems = (items, fields) => {
    if (!searchTerm.trim()) return items;
    const lowerTerm = searchTerm.toLowerCase();
    return items.filter(item =>
      fields.some(field =>
        String(item[field] || '').toLowerCase().includes(lowerTerm)
      )
    );
  };

  const renderTeachers = () => (
    <div className="space-y-4">
      {filterItems(teachers, ['name', 'email', 'department', 'subject']).map((teacher, index) => (
        <motion.div
          key={teacher.id}
          initial={ANIMATIONS.fadeInUp.initial}
          animate={ANIMATIONS.fadeInUp.animate}
          transition={{ ...ANIMATIONS.fadeInUp.transition, delay: index * 0.1 }}
        >
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{teacher.name}</h3>
                  <p className="text-gray-400 text-sm">{teacher.email}</p>
                  <p className="text-gray-300 text-sm">{teacher.department} • {teacher.subject}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{teacher.appointments}</p>
                  <p className="text-xs text-gray-400">Appointments</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold">{teacher.rating || 'N/A'}</p>
                  <p className="text-xs text-gray-400">Rating</p>
                </div>

                <Badge
                  variant={teacher.status === 'active' ? 'success' : 'warning'}
                  size="small"
                >
                  {teacher.status}
                </Badge>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<Edit className="h-4 w-4" />}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<Trash2 className="h-4 w-4" />}
                    className="text-red-400 hover:text-red-300"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-4">
      {filterItems(students, ['name', 'email', 'department', 'year']).map((student, index) => (
        <motion.div
          key={student.id}
          initial={ANIMATIONS.fadeInUp.initial}
          animate={ANIMATIONS.fadeInUp.animate}
          transition={{ ...ANIMATIONS.fadeInUp.transition, delay: index * 0.1 }}
        >
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <p className="text-gray-400 text-sm">{student.email}</p>
                  <p className="text-gray-300 text-sm">{student.department} • {student.year}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{student.appointments}</p>
                  <p className="text-xs text-gray-400">Appointments</p>
                </div>

                <Badge
                  variant={student.status === 'active' ? 'success' : 'warning'}
                  size="small"
                >
                  {student.status}
                </Badge>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<Edit className="h-4 w-4" />}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<Trash2 className="h-4 w-4" />}
                    className="text-red-400 hover:text-red-300"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-4">
      {approvals.map((approval, index) => (
        <motion.div
          key={approval.id}
          initial={ANIMATIONS.fadeInUp.initial}
          animate={ANIMATIONS.fadeInUp.animate}
          transition={{ ...ANIMATIONS.fadeInUp.transition, delay: index * 0.1 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  {approval.type === 'teacher' ? <GraduationCap className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{approval.name}</h3>
                  <p className="text-gray-400 text-sm">{approval.email}</p>
                  <p className="text-gray-300 text-sm">{approval.department} • Requested on {new Date(approval.requestDate).toLocaleDateString()}</p>
                </div>
              </div>

              <Badge variant="info" size="small">
                {approval.type} registration
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">Documents:</p>
                <div className="flex space-x-2">
                  {approval.documents.map((doc, idx) => (
                    <span key={idx} className="text-xs bg-gray-800 px-2 py-1 rounded">{doc}</span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleApproval(approval.id, 'approve')}
                  variant="success"
                  size="small"
                  icon={<CheckCircle className="h-4 w-4" />}
                >
                  Approve
                </Button>

                <Button
                  onClick={() => handleApproval(approval.id, 'reject')}
                  variant="danger"
                  size="small"
                  icon={<XCircle className="h-4 w-4" />}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const headerActions = (
    <Button
      icon={<Plus className="h-4 w-4" />}
      onClick={() => navigate('/admin/add-user')} // or other route/action for adding user
    >
      Add User
    </Button>
  );

  return (
    <Layout
      headerTitle="Admin Panel"
      headerBackTo={ROUTES.DASHBOARD}
      headerActions={headerActions}
    >
      <div className="p-6">
        {/* Tabs */}
        <motion.div className="mb-6" {...ANIMATIONS.fadeInUp}>
          <div className="flex space-x-2 bg-gray-900/50 p-1 rounded-lg inline-flex">
            {['teachers', 'students', 'approvals'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search */}
        {activeTab !== 'approvals' && (
          <motion.div className="mb-6 max-w-md" {...ANIMATIONS.fadeInUp}>
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={<Search className="h-5 w-5" />}
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div initial="initial" animate="animate" variants={ANIMATIONS.staggerChildren}>
          {activeTab === 'teachers' && renderTeachers()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'approvals' && renderApprovals()}
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminPage;
