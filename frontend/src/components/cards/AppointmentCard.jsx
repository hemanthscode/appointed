import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../ui/Badge';
import { formatDate, formatTime } from '../../utils/formatDate';

const STATUS_COLORS = {
  pending: 'bg-gray-700 text-white',
  confirmed: 'bg-black text-white',
  completed: 'bg-gray-900 text-white',
  cancelled: 'bg-red-700 text-white',
  rejected: 'bg-red-700 text-white',
};

const AppointmentCard = ({ appointment }) => {
  const statusClass = STATUS_COLORS[appointment.status] || 'bg-black text-white';

  return (
    <article className="border border-black p-4 rounded-lg mb-3 bg-white" role="region" aria-label={`Appointment: ${appointment.subject}`}>
      <header className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-black text-lg leading-tight">{appointment.subject}</h4>
        <Badge className={statusClass}>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</Badge>
      </header>
      <p className="text-black text-sm">{appointment.purpose}</p>
      <time dateTime={appointment.date} className="text-black text-sm mt-1 block" aria-label={`Appointment date and time: ${appointment.date} ${appointment.time}`}>
        {formatDate(appointment.date)} at {formatTime(appointment.time)}
      </time>
    </article>
  );
};

AppointmentCard.propTypes = {
  appointment: PropTypes.shape({
    subject: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    purpose: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
  }).isRequired,
};

export default React.memo(AppointmentCard);
