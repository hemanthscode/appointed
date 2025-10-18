import React from 'react';
import PropTypes from 'prop-types';

const MessageCard = ({ message, isOwn, showAvatar = true, showTimestamp = true }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    // If less than a minute ago
    if (diffMins < 1) return 'Just now';
    
    // If today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}
      aria-roledescription="message"
      aria-label={`${isOwn ? 'Your message' : `${message.sender?.name}'s message`}`}
    >
      {/* Left Avatar (for received messages) */}
      {!isOwn && showAvatar && message.sender && (
        <div className="flex-shrink-0 self-end mb-1">
          <img
            src={message.sender.avatar || '/default-avatar.png'}
            alt={message.sender.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            loading="lazy"
          />
        </div>
      )}

      {/* Message Bubble */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name (for received messages) */}
        {!isOwn && message.sender && (
          <span className="text-xs font-semibold text-gray-600 mb-1 px-2">
            {message.sender.name}
          </span>
        )}

        {/* Message Content */}
        <div
          className={`px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
            isOwn
              ? 'bg-black text-white rounded-br-md'
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
            {message.content}
          </p>
          
          {/* Attachment Preview (if exists) */}
          {message.attachment && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="truncate">{message.attachment.originalName || 'Attachment'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <time
              dateTime={message.createdAt}
              className="text-xs text-gray-400"
              aria-label={`Sent at ${new Date(message.createdAt).toLocaleString()}`}
            >
              {formatTime(message.createdAt)}
            </time>
            
            {/* Read Status (for sent messages) */}
            {isOwn && (
              <span className="text-xs text-gray-400">
                {message.isRead ? (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right Avatar (for sent messages) */}
      {isOwn && showAvatar && message.sender && (
        <div className="flex-shrink-0 self-end mb-1">
          <img
            src={message.sender.avatar || '/default-avatar.png'}
            alt={message.sender.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

MessageCard.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string,
    content: PropTypes.string.isRequired,
    sender: PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      avatar: PropTypes.string,
      name: PropTypes.string.isRequired,
    }),
    receiver: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string,
        id: PropTypes.string,
        name: PropTypes.string,
      })
    ]),
    createdAt: PropTypes.string.isRequired,
    isRead: PropTypes.bool,
    attachment: PropTypes.shape({
      filename: PropTypes.string,
      originalName: PropTypes.string,
      mimetype: PropTypes.string,
      size: PropTypes.number,
      path: PropTypes.string,
    }),
  }).isRequired,
  isOwn: PropTypes.bool,
  showAvatar: PropTypes.bool,
  showTimestamp: PropTypes.bool,
};

export default React.memo(MessageCard);