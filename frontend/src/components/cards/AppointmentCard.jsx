import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { ANIMATIONS, APPOINTMENT_STATUS } from '../../data';

const AppointmentCard = ({ 
  appointment, 
  onAction,
  userRole = 'student',
  index = 0 
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.CONFIRMED: return CheckCircle;
      case APPOINTMENT_STATUS.PENDING: return AlertCircle;
      case APPOINTMENT_STATUS.COMPLETED: return CheckCircle;
      case APPOINTMENT_STATUS.REJECTED: return XCircle;
      default: return Clock;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.CONFIRMED: return 'success';
      case APPOINTMENT_STATUS.PENDING: return 'warning';
      case APPOINTMENT_STATUS.COMPLETED: return 'info';
      case APPOINTMENT_STATUS.REJECTED: return 'danger';
      default: return 'info';
    }
  };

  const StatusIcon = getStatusIcon(appointment.status);

  return (
    <motion.div
      initial={ANIMATIONS.fadeInUp.initial}
      animate={ANIMATIONS.fadeInUp.animate}
      transition={{ ...ANIMATIONS.fadeInUp.transition, delay: index * 0.1 }}
    >
      <Card hoverable className="h-80 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">{userRole === 'student' ? appointment.teacher : appointment.student}</h3>
              <p className="text-sm text-gray-400">{appointment.subject}</p>
            </div>
          </div>
          
          <Badge 
            variant={getStatusVariant(appointment.status)}
            icon={<StatusIcon className="h-3 w-3" />}
            size="small"
          >
            {appointment.status}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{appointment.time}</span>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-400">Purpose: </span>
            <span>{appointment.purpose}</span>
          </div>
        </div>

        {/* Message */}
        {appointment.message && (
          <div className="mb-4">
            <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg line-clamp-2">
              "{appointment.message}"
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {appointment.status === APPOINTMENT_STATUS.PENDING && (
            <>
              <Button
                variant="danger"
                size="small"
                onClick={() => onAction('cancel', appointment.id)}
                className="flex-1 text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => onAction('reschedule', appointment.id)}
                className="flex-1 text-sm"
              >
                Reschedule
              </Button>
            </>
          )}
          
          {appointment.status === APPOINTMENT_STATUS.CONFIRMED && (
            <Button
              variant="primary"
              size="small"
              onClick={() => onAction('join', appointment.id)}
              className="w-full text-sm"
            >
              Join Meeting
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default AppointmentCard;
