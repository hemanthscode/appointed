import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const UserCard = ({ user }) => (
  <article className="flex items-center p-4 border border-black rounded mb-3 bg-white" role="region" aria-label={`User card for ${user.name}`}>
    <Avatar src={user.avatar} alt={user.name} size={48} className="mr-4 flex-shrink-0" />
    <div>
      <h3 className="text-black font-semibold text-lg leading-tight">{user.name}</h3>
      <p className="text-black text-sm truncate max-w-xs">{user.email}</p>
      <Badge className="mt-1" color="black">
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </Badge>
    </div>
  </article>
);

UserCard.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default React.memo(UserCard);
