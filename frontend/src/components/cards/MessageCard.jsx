import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../ui/Avatar';

const MessageCard = ({ message, isOwn }) => (
  <div className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
    {!isOwn && (
      <Avatar
        src={message.sender.avatar}
        alt={message.sender.name}
        size={32}
        className="mr-2 flex-shrink-0"
      />
    )}
    <div
      className={`max-w-xs px-4 py-2 rounded-lg break-words ${
        isOwn ? 'bg-black text-white' : 'bg-white text-black border border-black'
      }`}
      role="article"
      aria-label={`Message from ${message.sender.name}`}
    >
      <p className="whitespace-pre-wrap">{message.content}</p>
      <time
        dateTime={message.createdAt}
        className="text-xs mt-1 block text-gray-600"
        aria-label={`Sent on ${new Date(message.createdAt).toLocaleString()}`}
      >
        {new Date(message.createdAt).toLocaleString()}
      </time>
    </div>
  </div>
);

MessageCard.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string.isRequired,
    sender: PropTypes.shape({
      avatar: PropTypes.string,
      name: PropTypes.string.isRequired,
    }).isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  isOwn: PropTypes.bool,
};

MessageCard.defaultProps = {
  isOwn: false,
};

export default React.memo(MessageCard);
