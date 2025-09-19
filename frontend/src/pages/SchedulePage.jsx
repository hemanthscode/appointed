import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Plus, 
  User,
  CheckCircle,
  Edit
} from 'lucide-react';
import { Layout } from '../components/common';
import { StatsCard } from '../components/cards';
import { Card, Button, Badge } from '../components/ui';
import { TIME_SLOTS, SCHEDULE_SLOTS, ROUTES, ANIMATIONS } from '../data';

const SchedulePage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewType, setViewType] = useState('week');

  const scheduleSlots = SCHEDULE_SLOTS;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'booked': return 'info';
      case 'blocked': return 'danger';
      default: return 'info';
    }
  };

  const stats = [
    { label: 'Available Slots', value: '6', icon: CheckCircle, color: 'text-green-300' },
    { label: 'Booked Slots', value: '2', icon: Calendar, color: 'text-blue-300' },
    { label: 'Pending Approval', value: '3', icon: Clock, color: 'text-yellow-300' },
    { label: 'Blocked Slots', value: '1', icon: Edit, color: 'text-red-300' }
  ];

  const headerActions = (
    <Button
      icon={<Plus className="h-4 w-4" />}
    >
      Add Time Slot
    </Button>
  );

  return (
    <Layout 
      headerTitle="My Schedule"
      headerBackTo={ROUTES.DASHBOARD}
      headerActions={headerActions}
    >
      <div className="p-6">
        {/* Controls */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0"
          {...ANIMATIONS.fadeInUp}
        >
          <div className="flex space-x-2">
            <Button
              variant={viewType === 'week' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setViewType('week')}
            >
              Week View
            </Button>
            <Button
              variant={viewType === 'month' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setViewType('month')}
            >
              Month View
            </Button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white"
          />
        </motion.div>

        {/* Schedule Grid */}
        <motion.div 
          {...ANIMATIONS.fadeInUp}
          style={{ transitionDelay: '0.2s' }}
        >
          <Card className="mb-8">
            <h3 className="text-xl font-bold mb-6">
              Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TIME_SLOTS.map((time) => {
                const slot = scheduleSlots.find(s => s.time === time && s.date === selectedDate);
                const status = slot?.status || 'empty';
                
                return (
                  <motion.div
                    key={time}
                    className="p-4 rounded-lg border-2 border-gray-700 transition-colors hover:border-gray-600"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-semibold">{time}</span>
                      </div>
                      <Badge 
                        variant={getStatusVariant(status)}
                        size="small"
                      >
                        {status}
                      </Badge>
                    </div>
                    
                    {slot?.student && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3" />
                          <span className="text-sm">{slot.student}</span>
                        </div>
                        <p className="text-xs text-gray-300">{slot.purpose}</p>
                        <div className="flex space-x-1">
                          <Button
                            size="small"
                            className="flex-1 text-xs py-1"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            className="flex-1 text-xs py-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {status === 'empty' && (
                      <Button
                        variant="secondary"
                        size="small"
                        className="w-full text-xs"
                      >
                        Set Available
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial="initial"
          animate="animate"
          variants={ANIMATIONS.staggerChildren}
        >
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default SchedulePage;
