import React from 'react';
import { Card } from '../ui';

const StatsCard = ({ title, value }) => (
  <Card className="p-6 text-center">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value ?? '-'}</p>
  </Card>
);

export default StatsCard;
