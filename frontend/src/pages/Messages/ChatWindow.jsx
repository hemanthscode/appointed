import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import * as messageService from '../../api/messageService';
import * as userService from '../../api/userService';
import MessageCard from '../../components/cards/MessageCard';
import MessageForm from '../../components/forms/MessageForm';
import Loader from '../../components/common/Loader';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-toastify';

const ChatWindow = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isTempChat = location.state?.isTempChat || false;
  const tempUser = location.state?.tempUser || null;

  const [messages, setMessages] = useState([]);
  const [conversationParticipants, setConversationParticipants] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(!isTempChat);
  const [error, setError] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const socket = useSocket();
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get current user ID
  useEffect(() => {
    userService.getProfile()
      .then(({ data }) => setCurrentUserId(data.data._id || data.data.id))
      .catch(err => console.error('[ChatWindow] Failed to get user profile:', err));
  }, []);

  // Fetch messages for existing conversation
  const fetchMessages = useCallback(async () => {
    if (isTempChat) {
      console.log('[ChatWindow] Temporary chat - skipping message fetch.');
      setOtherUser(tempUser);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await messageService.fetchMessages(conversationId);
      setMessages(data.data.messages || []);
      
      // Get other user info
      const participants = data.data.conversation?.participants || [];
      const otherParticipantId = participants.find(p => p !== currentUserId);
      
      if (otherParticipantId && data.data.messages.length > 0) {
        const firstMsg = data.data.messages[0];
        const otherUserData = firstMsg.sender._id === currentUserId ? firstMsg.receiver : firstMsg.sender;
        setOtherUser(otherUserData);
      }
      
      setConversationParticipants(participants);
      console.log('[ChatWindow] Fetched messages:', data.data.messages.length);
    } catch (e) {
      setError('Failed to load messages');
      console.error('[ChatWindow] Fetch messages error:', e.response?.data || e);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, isTempChat, tempUser, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchMessages();
    }
  }, [fetchMessages, currentUserId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !currentUserId) return;

    // Join conversation room
    if (!isTempChat && conversationId) {
      socket.emit('join_conversation', conversationId);
      console.log('[ChatWindow] Joined conversation:', conversationId);
    }

    // Listen for new messages
    const onNewMessage = (message) => {
      console.log('[ChatWindow] New socket message received:', message);
      
      // For temp chats, ignore until conversation is created
      if (isTempChat) return;
      
      // Check if message belongs to this conversation
      if (message.conversation === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        
        // Scroll to bottom
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    // Listen for typing indicators
    const onUserTyping = (data) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setIsTyping(true);
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Auto-hide typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };

    const onUserStopTyping = (data) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_received', onNewMessage);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stop_typing', onUserStopTyping);

    return () => {
      if (!isTempChat && conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
      socket.off('new_message', onNewMessage);
      socket.off('message_received', onNewMessage);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stop_typing', onUserStopTyping);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, isTempChat, socket, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  const receiverId = isTempChat ? tempUser?.id : conversationParticipants.find(p => p !== currentUserId);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!socket || isTempChat || !conversationId) return;
    
    socket.emit('typing_start', { conversationId });
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId });
    }, 2000);
  }, [socket, isTempChat, conversationId]);

  // Send message
  const handleSend = async (msg) => {
    if (!receiverId) {
      toast.error('Unable to determine message recipient');
      console.error('[ChatWindow] Send message aborted: receiver unknown');
      return;
    }

    const payload = { ...msg, receiver: receiverId };
    console.log('[ChatWindow] Sending message payload:', payload);

    setSendLoading(true);
    try {
      const response = await messageService.sendMessage(payload);
      console.log('[ChatWindow] Message sent successfully:', response.data);
      
      if (isTempChat) {
        // For temp chats, navigate to conversation list and let it refresh
        toast.success('Message sent!');
        navigate('/messages', { replace: true });
      } else {
        // For existing chats, add message optimistically
        const sentMessage = response.data.data.message;
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m._id === sentMessage._id)) return prev;
          return [...prev, sentMessage];
        });
        
        // Stop typing indicator
        if (socket) {
          socket.emit('typing_stop', { conversationId });
        }
      }
    } catch (e) {
      const errorData = e.response?.data;
      console.error('[ChatWindow] Send message failed:', errorData || e);

      if (errorData?.message?.toLowerCase().includes('conflict')) {
        toast.error('Conversation conflict. Redirecting...');
        setTimeout(() => navigate('/messages', { replace: true }), 1500);
      } else {
        toast.error(errorData?.message || 'Failed to send message');
      }
    } finally {
      setSendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-6">
        <p className="text-red-600 text-center text-lg mb-4">{error}</p>
        <button
          onClick={() => navigate('/messages')}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/messages')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Back to conversations"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {otherUser && (
            <>
              <img
                src={otherUser.avatar || '/default-avatar.png'}
                alt={`${otherUser.name}'s avatar`}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="flex-grow">
                <h1 className="text-lg font-semibold text-gray-900">
                  {otherUser.name}
                  {isTempChat && <span className="text-sm text-gray-500 ml-2">(New Chat)</span>}
                </h1>
                {isTyping && (
                  <p className="text-xs text-gray-500 italic">typing...</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          {messages.length === 0 && !isTempChat && (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-center">No messages yet.</p>
              <p className="text-gray-400 text-sm text-center mt-1">Send the first message!</p>
            </div>
          )}
          
          {isTempChat && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-center">Start a new conversation with {tempUser?.name}</p>
              <p className="text-gray-400 text-sm text-center mt-1">Send a message to begin</p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageCard 
                key={msg._id} 
                message={msg} 
                isOwn={msg.sender._id === currentUserId || msg.sender.id === currentUserId} 
              />
            ))}
          </div>
          
          {isTyping && (
            <div className="flex items-center gap-2 mt-4 text-gray-500 text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <MessageForm 
            onSend={handleSend} 
            loading={sendLoading} 
            receiverId={receiverId} 
            showReceiver={false}
            onTyping={handleTyping}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;