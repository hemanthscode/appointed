import React from 'react';
import { Card, Badge, Button } from '../ui';

const AppointmentCard = ({
  appointment,
  onApprove,
  onReject,
  onCancel,
  onComplete,
  onRate,
  userRole,
}) => {
  const {
    purpose,
    formattedDate,
    time,
    status,
    teacher,
    student,
  } = appointment;

  return (
    <Card className="mb-4 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h3 className="font-semibold text-lg">{purpose.replace(/-/g, ' ').toUpperCase()}</h3>
          <div className="text-gray-400 text-sm">{formattedDate} &bull; {time}</div>
          <div className="text-gray-300 text-sm">Teacher: {teacher?.name || 'Unknown'}</div>
          <div className="text-gray-300 text-sm">Student: {student?.name || 'Unknown'}</div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 items-center">
          <Badge
            variant={
              status === 'confirmed'
                ? 'success'
                : status === 'completed'
                ? 'primary'
                : status === 'cancelled'
                ? 'danger'
                : status === 'rejected'
                ? 'warning'
                : 'secondary'
            }
            size="medium"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>

          {/* Role-based buttons */}
          {userRole === 'teacher' && status === 'pending' && (
            <>
              <Button size="small" variant="success" onClick={() => onApprove(appointment._id)}>Approve</Button>
              <Button size="small" variant="danger" onClick={() => onReject(appointment._id)}>Reject</Button>
            </>
          )}

          {(userRole === 'teacher' || userRole === 'student') && status === 'confirmed' && (
            <>
              <Button size="small" variant="warning" onClick={() => onCancel(appointment._id)}>Cancel</Button>
              {userRole === 'teacher' && <Button size="small" variant="info" onClick={() => onComplete(appointment._id)}>Complete</Button>}
              {userRole === 'student' && <Button size="small" variant="primary" onClick={() => onRate(appointment._id)}>Rate</Button>}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AppointmentCard;
