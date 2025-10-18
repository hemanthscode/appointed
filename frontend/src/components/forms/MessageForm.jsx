import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const MessageForm = ({
  onSend,
  loading,
  serverError,
  receiverId = '',
  showReceiver = false,
  placeholder = 'Type a message...',
  buttonText = 'Send',
  onTyping,
}) => {
  const [form, setForm] = useState({ content: '', receiver: receiverId });
  const [errors, setErrors] = useState({});
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Update receiver if prop changes
  useEffect(() => {
    if (receiverId) {
      setForm((prev) => ({ ...prev, receiver: receiverId }));
    }
  }, [receiverId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Character limit
    if (name === 'content' && value.length > 1000) {
      return;
    }
    
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Handle typing indicator
    if (name === 'content' && onTyping) {
      onTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        // Typing stopped
      }, 2000);
    }

    // Auto-resize textarea
    if (name === 'content' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.content.trim()) {
      errs.content = 'Message cannot be empty';
    }
    if (form.content.length > 1000) {
      errs.content = 'Message cannot exceed 1000 characters';
    }
    if (showReceiver && !form.receiver) {
      errs.receiver = 'Receiver is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    console.log('[MessageForm] Submitting message:', form);
    onSend(form);
    
    // Reset form
    setForm((prev) => ({ ...prev, content: '' }));
    setErrors({});
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const charCount = form.content.length;
  const charLimit = 1000;
  const charPercentage = (charCount / charLimit) * 100;
  const isNearLimit = charPercentage > 80;
  const isOverLimit = charPercentage > 100;

  return (
    <div className="w-full" aria-label="Send a message form">
      {showReceiver && (
        <div className="mb-3">
          <label htmlFor="receiver" className="block text-sm font-medium text-gray-700 mb-1">
            Receiver ID
          </label>
          <input
            id="receiver"
            name="receiver"
            type="text"
            value={form.receiver}
            onChange={handleChange}
            placeholder="Enter receiver ID"
            disabled={loading || !!receiverId}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
              errors.receiver ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.receiver && (
            <p className="text-red-500 text-xs mt-1">{errors.receiver}</p>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            rows={1}
            className={`w-full px-4 py-3 pr-16 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black resize-none overflow-y-auto ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100' : 'bg-white'}`}
            style={{ minHeight: '48px', maxHeight: '150px' }}
            aria-label="Message content"
          />
          
          {/* Character Count */}
          {charCount > 0 && (
            <div className="absolute bottom-2 right-2 text-xs font-medium pointer-events-none">
              <span className={`${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-orange-500' : 'text-gray-400'}`}>
                {charCount}/{charLimit}
              </span>
            </div>
          )}
          
          {errors.content && (
            <p className="text-red-500 text-xs mt-1">{errors.content}</p>
          )}
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !form.content.trim() || isOverLimit}
          className={`flex-shrink-0 p-3 rounded-full transition-all duration-200 ${
            loading || !form.content.trim() || isOverLimit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg'
          }`}
          aria-label="Send message"
        >
          {loading ? (
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {serverError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
};

MessageForm.propTypes = {
  onSend: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  serverError: PropTypes.string,
  receiverId: PropTypes.string,
  showReceiver: PropTypes.bool,
  placeholder: PropTypes.string,
  buttonText: PropTypes.string,
  onTyping: PropTypes.func,
};

export default MessageForm;