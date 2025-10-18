import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../ui/Badge';
import Button from '../common/Button';
import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { variant: 'warning', label: 'Pending' },
  confirmed: { variant: 'success', label: 'Confirmed' },
  completed: { variant: 'info', label: 'Completed' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
  rejected: { variant: 'danger', label: 'Rejected' },
};

const AppointmentCard = ({
  appointment,
  onClick,
  userRole,
  onApprove,
  onReject,
  onCancel,
  onComplete,
  onDelete,
  onEdit,
}) => {
  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

  return (
    <article
      tabIndex={0}
      role={onClick ? 'button' : 'region'}
      onClick={onClick}
      onKeyDown={(e) => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`Appointment: ${appointment.subject}, status ${status.label}`}
      className="border-2 border-black rounded-xl bg-white p-6 mb-5 cursor-pointer hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-black transition-shadow duration-300"
    >
      <header className="flex justify-between items-start mb-4">
        <h4
          title={appointment.subject}
          className="font-bold text-xl text-black truncate max-w-[65%]"
        >
          {appointment.subject}
        </h4>
        <Badge variant={status.variant} size="md" className="text-sm px-3 py-1">
          {status.label}
        </Badge>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700 text-sm leading-tight">
        <div className="flex items-center gap-2" title={`Student: ${appointment.student.name}`}>
          <User className="w-5 h-5 text-gray-500" aria-hidden="true" /> {appointment.student.name}
        </div>
        <div className="flex items-center gap-2" title={`Teacher: ${appointment.teacher.name}`}>
          <User className="w-5 h-5 text-gray-500" aria-hidden="true" /> {appointment.teacher.name}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" aria-hidden="true" />
          <time dateTime={appointment.date}>
            {new Date(appointment.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" aria-hidden="true" /> {appointment.time}
        </div>
        <div className="flex items-center gap-2" title={`Purpose: ${appointment.purpose}`}>
          <MessageSquare className="w-5 h-5 text-gray-500" aria-hidden="true" /> {appointment.purpose}
        </div>
      </div>

      {appointment.message && (
        <p className="mt-3 text-gray-700 text-sm whitespace-pre-wrap max-h-20 overflow-auto" title={appointment.message}>
          {appointment.message}
        </p>
      )}

      {/* Action buttons based on role and status */}
      <div className="mt-5 flex flex-wrap gap-3 justify-end">
        {userRole === 'teacher' && appointment.status === 'pending' && (
          <>
            <Button variant="success" size="sm" onClick={(e) => { e.stopPropagation(); onApprove(appointment); }} ariaLabel="Approve appointment">
              <CheckCircle className="inline w-4 h-4 mr-1" /> Approve
            </Button>
            <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); onReject(appointment); }} ariaLabel="Reject appointment">
              <XCircle className="inline w-4 h-4 mr-1" /> Reject
            </Button>
          </>
        )}
        {(userRole === 'student' || userRole === 'teacher') && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onCancel(appointment); }} ariaLabel="Cancel appointment">
            Cancel
          </Button>
        )}
        {userRole === 'teacher' && appointment.status === 'confirmed' && (
          <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onComplete(appointment); }} ariaLabel="Mark as complete">
            <CheckCircle className="inline w-4 h-4 mr-1" /> Complete
          </Button>
        )}
        {(userRole === 'admin' || userRole === 'student') && (
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(appointment); }} ariaLabel="Edit appointment">
            <Edit className="inline w-4 h-4 mr-1" /> Edit
          </Button>
        )}
        {userRole === 'admin' && (
          <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(appointment); }} ariaLabel="Delete appointment">
            <Trash2 className="inline w-4 h-4 mr-1" /> Delete
          </Button>
        )}
      </div>
    </article>
  );
};

AppointmentCard.propTypes = {
  appointment: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  userRole: PropTypes.oneOf(['student', 'teacher', 'admin']),
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onCancel: PropTypes.func,
  onComplete: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
};

export default React.memo(AppointmentCard);
