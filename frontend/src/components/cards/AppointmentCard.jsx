import React from 'react';
import { Button, Badge, Card } from '../ui';
import { formatDateTime, getStatusColor } from '../../utils/helpers';
import { APPOINTMENT_STATUS } from '../../utils/constants';

const AppointmentCard = ({ appointment, userRole, onApprove, onReject, onCancel, onComplete, onRate }) => {
  const { teacher, student, date, time, purpose, status, rating } = appointment;
  const dateTimeLabel = formatDateTime(date, time);
  const statusColorClass = getStatusColor(status);

  const canApprove = userRole === 'teacher' && status === APPOINTMENT_STATUS.PENDING;
  const canReject = canApprove;
  const canCancel = userRole === 'student' && [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(status);
  const canComplete = userRole === 'teacher' && status === APPOINTMENT_STATUS.CONFIRMED;
  const canRate = userRole === 'student' && status === APPOINTMENT_STATUS.COMPLETED && !rating;

  return (
    <Card hoverable className="p-6 flex flex-col md:flex-row justify-between gap-4">
      <div className="flex-grow space-y-1">
        <h3 className="text-xl font-semibold">{purpose}</h3>
        <p>
          <span className="font-semibold">Date & Time: </span>{dateTimeLabel}
        </p>
        <p>
          <span className="font-semibold">Teacher: </span>{teacher.name}
        </p>
        {userRole === 'teacher' && (
          <p>
            <span className="font-semibold">Student: </span>{student.name}
          </p>
        )}
      </div>
      <div className={`uppercase font-bold ${statusColorClass} px-3 py-1 rounded self-start`}>
        {status}
      </div>
      <div className="flex items-center space-x-2">
        {canApprove && <Button variant="success" size="small" onClick={() => onApprove(appointment._id)}>Approve</Button>}
        {canReject && <Button variant="danger" size="small" onClick={() => onReject(appointment._id)}>Reject</Button>}
        {canCancel && <Button variant="warning" size="small" onClick={() => onCancel(appointment._id)}>Cancel</Button>}
        {canComplete && <Button variant="info" size="small" onClick={() => onComplete(appointment._id)}>Complete</Button>}
        {canRate && <Button variant="primary" size="small" onClick={() => onRate(appointment._id)}>Rate</Button>}
        {rating && <Badge variant="success">Rated: {rating}★</Badge>}
      </div>
    </Card>
  );
};

export default AppointmentCard;
