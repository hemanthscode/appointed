import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings,
  Bell,
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  BookOpen
} from 'lucide-react';
import { Layout } from '../components/common';
import { StatsCard } from '../components/cards';
import { Button, Card } from '../components/ui';
import { useAuth } from '../hooks';
import { ROUTES, ANIMATIONS, USER_ROLES, DASHBOARD_STATS } from '../data';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState(user?.role || USER_ROLES.STUDENT);

  const menuItems = {
    [USER_ROLES.STUDENT]: [
      { icon: Calendar, label: 'My Appointments', path: ROUTES.APPOINTMENTS },
      { icon: Users, label: 'Search Teachers', path: ROUTES.TEACHERS },
      { icon: MessageSquare, label: 'Messages', path: ROUTES.MESSAGES },
      { icon: Settings, label: 'Profile', path: ROUTES.PROFILE }
    ],
    [USER_ROLES.TEACHER]: [
      { icon: Calendar, label: 'Schedule', path: ROUTES.SCHEDULE },
      { icon: Users, label: 'Students', path: '/students' },
      { icon: MessageSquare, label: 'Messages', path: ROUTES.MESSAGES },
      { icon: Bell, label: 'Requests', path: ROUTES.REQUESTS },
      { icon: Settings, label: 'Profile', path: ROUTES.PROFILE }
    ],
    [USER_ROLES.ADMIN]: [
      { icon: Users, label: 'Manage Teachers', path: '/admin/teachers' },
      { icon: Users, label: 'Manage Students', path: '/admin/students' },
      { icon: Calendar, label: 'All Appointments', path: '/admin/appointments' },
      { icon: Bell, label: 'Approvals', path: '/admin/approvals' },
      { icon: Settings, label: 'System Settings', path: '/admin/settings' }
    ]
  };

  const iconMap = {
    Calendar,
    CheckCircle,
    Clock,
    MessageSquare,
    Users,
    Bell
  };

  const stats = DASHBOARD_STATS[userRole]?.map(stat => ({
    ...stat,
    icon: iconMap[stat.icon]
  })) || [];

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const headerActions = (
    <>
      <Bell className="h-6 w-6 cursor-pointer hover:text-gray-300" />
      <Button
        onClick={handleLogout}
        size="small"
        icon={<LogOut className="h-4 w-4" />}
      >
        Logout
      </Button>
    </>
  );

  return (
    <Layout 
      headerTitle="Appointed Dashboard"
      headerBackTo={ROUTES.HOME}
      headerActions={headerActions}
    >
      <div className="flex">
        {/* Sidebar */}
        <motion.aside 
          className="w-64 bg-gray-900/30 backdrop-blur-sm border-r border-gray-800 min-h-screen p-6"
          {...ANIMATIONS.slideInFromLeft}
        >
          <nav className="space-y-2">
            {menuItems[userRole]?.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                whileHover={{ scale: 1.02 }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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

          {/* Quick Actions */}
          <motion.div 
            {...ANIMATIONS.fadeInUp}
            className="mb-8"
          >
            <Card>
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                {userRole === USER_ROLES.STUDENT && (
                  <>
                    <Button 
                      onClick={() => navigate(ROUTES.TEACHERS)}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Book Appointment
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => navigate(ROUTES.MESSAGES)}
                      icon={<MessageSquare className="h-4 w-4" />}
                    >
                      Send Message
                    </Button>
                  </>
                )}
                
                {userRole === USER_ROLES.TEACHER && (
                  <>
                    <Button 
                      onClick={() => navigate(ROUTES.SCHEDULE)}
                      icon={<Calendar className="h-4 w-4" />}
                    >
                      View Schedule
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => navigate(ROUTES.REQUESTS)}
                      icon={<Bell className="h-4 w-4" />}
                    >
                      Review Requests
                    </Button>
                  </>
                )}

                {userRole === USER_ROLES.ADMIN && (
                  <>
                    <Button 
                      onClick={() => navigate(ROUTES.ADMIN)}
                      icon={<Users className="h-4 w-4" />}
                    >
                      Manage Users
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => navigate('/admin/approvals')}
                      icon={<Bell className="h-4 w-4" />}
                    >
                      Pending Approvals
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            {...ANIMATIONS.fadeInUp}
            style={{ transitionDelay: '0.2s' }}
          >
            <Card>
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Sample activity item {index + 1}</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </Layout>
  );
};

export default Dashboard;
