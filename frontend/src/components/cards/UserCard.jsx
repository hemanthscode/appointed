import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Tooltip from '../ui/Tooltip';

const UserCard = ({ 
  user, 
  onClick, 
  showBadge = true, 
  variant = 'default',
  actions 
}) => {
  const isClickable = !!onClick;

  return (
    <article 
      className={`
        flex items-center p-4 border-2 border-black rounded-xl mb-3 bg-white
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''}
        ${variant === 'compact' ? 'p-3' : ''}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : 'region'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`User card for ${user.name}`}
      onKeyDown={(e) => isClickable && (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <Avatar 
        src={user.avatar} 
        alt={user.name} 
        size={variant === 'compact' ? 'sm' : 'lg'} 
        className="mr-4 flex-shrink-0" 
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="text-black font-bold text-lg leading-tight truncate">
          {user.name}
        </h3>
        <p className="text-gray-600 text-sm truncate mt-0.5">
          {user.email}
        </p>
        {showBadge && (
          <Badge variant="primary" size="sm" className="mt-2">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        )}
        {user.department && (
          <p className="text-xs text-gray-500 mt-1">
            {user.department}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex gap-2 ml-3 flex-shrink-0">
          {actions.map((action, idx) => (
            <Tooltip key={idx} text={action.tooltip || action.label}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(user);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label={action.label}
              >
                {action.icon || action.label}
              </button>
            </Tooltip>
          ))}
        </div>
      )}
    </article>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    department: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  showBadge: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact']),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      tooltip: PropTypes.string,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
    })
  ),
};

export default React.memo(UserCard);