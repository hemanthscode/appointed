import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Clock, 
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Layout } from '../components/common';
import { Card, Button, Badge } from '../components/ui';
import { APPOINTMENT_REQUESTS, ROUTES, ANIMATIONS } from '../data';

const RequestsPage = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('pending');

  const appointmentRequests = APPOINTMENT_REQUESTS;

  const handleRequest = (id, action, reason = '') => {
    console.log(`${action} request ${id}`, reason ? `Reason: ${reason}` : '');
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  };

  const filteredRequests = appointmentRequests.filter(req => 
    filterStatus === 'all' || req.status === filterStatus
  );

  return (
    <Layout 
      headerTitle="Appointment Requests"
      headerBackTo={ROUTES.DASHBOARD}
    >
      <div className="p-6">
        {/* Filter Tabs */}
        <motion.div 
          className="mb-6"
          {...ANIMATIONS.fadeInUp}
        >
          <div className="flex space-x-2 bg-gray-900/50 p-1 rounded-lg inline-flex">
            {['pending', 'confirmed', 'rejected', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Requests List */}
        <motion.div 
          className="space-y-4"
          initial="initial"
          animate="animate"
          variants={ANIMATIONS.staggerChildren}
        >
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              variants={ANIMATIONS.fadeInUp}
            >
              <Card>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold">{request.student}</h3>
                      <p className="text-sm text-gray-400">{request.studentEmail}</p>
                      <p className="text-xs text-gray-500">
                        Requested: {request.requestedAt}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant={getStatusVariant(request.status)} size="small">
                    {request.status}
                  </Badge>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(request.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{request.time}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Purpose:</span>
                    <span className="text-sm">{request.purpose}</span>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Message:</span>
                  </div>
                  <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                    "{request.message}"
                  </p>
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleRequest(request.id, 'approve')}
                      variant="success"
                      icon={<CheckCircle className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Approve Appointment
                    </Button>
                    
                    <Button
                      onClick={() => {
                        const reason = prompt('Reason for rejection (optional):');
                        handleRequest(request.id, 'reject', reason);
                      }}
                      variant="danger"
                      icon={<XCircle className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Reject Request
                    </Button>
                    
                    <Button
                      onClick={() => navigate(`${ROUTES.MESSAGES}?student=${request.id}`)}
                      variant="secondary"
                      icon={<MessageSquare className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Message Student
                    </Button>
                  </div>
                )}

                {request.status === 'confirmed' && (
                  <div className="flex gap-3">
                    <Button
                      variant="info"
                      className="flex-1"
                    >
                      View in Schedule
                    </Button>
                    <Button
                      onClick={() => navigate(`${ROUTES.MESSAGES}?student=${request.id}`)}
                      variant="secondary"
                      icon={<MessageSquare className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Message Student
                    </Button>
                  </div>
                )}

                {request.status === 'rejected' && request.respondedAt && (
                  <div className="text-sm text-gray-500">
                    Rejected on: {request.respondedAt}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <motion.div 
            className="text-center py-16"
            {...ANIMATIONS.fadeInUp}
          >
            <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No requests found</h3>
            <p className="text-gray-400">
              {filterStatus === 'all' 
                ? "You don't have any appointment requests yet." 
                : `No ${filterStatus} requests found.`
              }
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default RequestsPage;
