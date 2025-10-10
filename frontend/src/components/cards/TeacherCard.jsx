import React from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, MessageSquare } from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { ANIMATIONS } from '../../utils';

const TeacherCard = ({ teacher, onBook, onMessage, index = 0 }) => (
  <motion.div
    initial={ANIMATIONS.fadeInUp.initial}
    animate={ANIMATIONS.fadeInUp.animate}
    transition={{ ...ANIMATIONS.fadeInUp.transition, delay: index * 0.1 }}
  >
    <Card hoverable className="h-80 flex flex-col justify-between">
      <div>
        {/* Avatar & Info */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-xl font-bold">{teacher.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <h3 className="text-xl font-bold">{teacher.name}</h3>
          <p className="text-gray-400">{teacher.department}</p>
          <p className="text-sm text-gray-300">{teacher.subject}</p>
        </div>
        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Rating:</span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{teacher.rating}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Status:</span>
            <Badge variant={teacher.availability === 'Available' ? 'success' : 'danger'} size="small">
              {teacher.availability}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Next Slot:</span>
            <span className="text-sm">{teacher.nextSlot}</span>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="primary" size="small" onClick={() => onBook(teacher.id)} icon={<Calendar className="h-4 w-4" />} className="flex-1">
          Book
        </Button>
        <Button variant="secondary" size="small" onClick={() => onMessage(teacher.id)} icon={<MessageSquare className="h-4 w-4" />} className="flex-1">
          Message
        </Button>
      </div>
    </Card>
  </motion.div>
);

export default TeacherCard;
