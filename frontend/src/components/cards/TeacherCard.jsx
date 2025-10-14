import React from 'react';
import { Card, Badge } from '../ui';

const TeacherCard = ({ teacher }) => {
  const { name, subject, department, availability, nextSlot } = teacher;
  const availVariant = availability === 'Available' ? 'success' : 'danger';

  return (
    <Card hoverable className="p-4">
      <h3 className="text-xl font-semibold">{name}</h3>
      <p><span className="font-semibold">Subject: </span>{subject}</p>
      <p><span className="font-semibold">Department: </span>{department}</p>
      <p>
        <span className="font-semibold">Availability: </span>
        <Badge variant={availVariant}>{availability}</Badge>
      </p>
      <p><span className="font-semibold">Next Slot: </span>{nextSlot || 'N/A'}</p>
    </Card>
  );
};

export default TeacherCard;
