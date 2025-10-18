import React, { useState, useEffect, useCallback } from 'react';
import * as messageService from '../../api/messageService';
import * as userService from '../../api/userService';
import Loader from '../../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSocket } from '../../contexts/SocketContext';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const socket = useSocket();

  const debouncedSearch = useDebounce(searchQuery.trim().toLowerCase(), 350);

  useEffect(() => {
    userService.getProfile()
      .then(({ data }) => setUserRole(data.data.role))
      .catch(() => setUserRole('guest'));
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoadingConvos(true);
    setError('');
    try {
      const res = await messageService.fetchConversations();
      setConversations(res.data.data.conversations);
    } catch (e) {
      setError('Failed to load conversations');
      toast.error('Failed to load conversations');
      console.error('[Conversations] fetchConversations error:', e.response?.data || e);
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => {
    if (userRole) fetchConversations();
  }, [fetchConversations, userRole]);

  // Listen for new messages to update conversation list in real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log('[Conversations] New message received via socket:', message);
      
      // Refresh conversations to update last message and unread count
      fetchConversations();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_received', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_received', handleNewMessage);
    };
  }, [socket, fetchConversations]);

  const fetchUsers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }
    setLoadingUsers(true);
    setError('');
    try {
      let res;
      if (userRole === 'teacher') {
        res = await userService.getStudents({ search: query });
      } else if (userRole === 'student') {
        res = await userService.getTeachers({ search: query });
      } else if (userRole === 'admin') {
        res = await userService.getUsers({ search: query });
      } else {
        res = { data: { data: [] } };
      }
      setUsers(res.data.data);
    } catch (e) {
      setError('Failed to fetch users');
      toast.error('Failed to fetch users');
      console.error('[Conversations] fetchUsers error:', e.response?.data || e);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setUsers([]);
      return;
    }
    const filteredConvos = conversations.filter(c =>
      c.name?.toLowerCase().includes(debouncedSearch) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(debouncedSearch))
    );
    if (filteredConvos.length === 0) {
      fetchUsers(debouncedSearch);
    } else {
      setUsers([]);
    }
  }, [debouncedSearch, conversations, fetchUsers]);

  const filteredConversations = React.useMemo(() => {
    if (!debouncedSearch) return conversations;
    return conversations.filter(c =>
      c.name?.toLowerCase().includes(debouncedSearch) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(debouncedSearch))
    );
  }, [debouncedSearch, conversations]);

  const openConversation = (convId, isTemp = false, user = null) => {
    if (isTemp && user) {
      navigate(`/messages/${user.id}`, { 
        state: { isTempChat: true, tempUser: user },
        replace: false 
      });
    } else {
      navigate(`/messages/${convId}`);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread || 0), 0);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {totalUnread > 0 && (
              <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-semibold">
                {totalUnread} unread
              </span>
            )}
          </div>
          <input
            type="search"
            aria-label="Search conversations and users"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Search conversations or find users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full">
          {(loadingConvos || loadingUsers) && (
            <div className="flex justify-center items-center py-20">
              <Loader size="xl" />
            </div>
          )}

          {error && <p className="text-red-600 text-center my-6 px-6">{error}</p>}

          {!loadingConvos && !loadingUsers && filteredConversations.length === 0 && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-center text-gray-500 text-lg">
                {searchQuery ? 'No conversations or users found' : 'No conversations yet'}
              </p>
              <p className="text-center text-gray-400 text-sm mt-2">
                {searchQuery ? 'Try a different search term' : 'Search for users to start chatting'}
              </p>
            </div>
          )}

          <div className="overflow-y-auto h-full px-6 py-4">
            {/* Conversations List */}
            {filteredConversations.length > 0 && (
              <div className="space-y-2 mb-4">
                {filteredConversations.map(({ id, name, unread, lastMessage, lastMessageTime, avatar, role }) => (
                  <div
                    key={id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => openConversation(id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && openConversation(id)}
                    aria-label={`${name} conversation, ${unread || 0} unread messages`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={avatar || '/default-avatar.png'}
                          alt={`${name}'s avatar`}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                          loading="lazy"
                        />
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 bg-black text-white text-xs px-2 py-0.5 rounded-full font-semibold min-w-[20px] text-center">
                            {unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h2 className={`font-semibold truncate text-base ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                            {name}
                            {role && <span className="text-xs text-gray-400 ml-2 font-normal">({role})</span>}
                          </h2>
                          <time className="text-xs text-gray-400 whitespace-nowrap ml-2" dateTime={lastMessageTime}>
                            {formatTime(lastMessageTime)}
                          </time>
                        </div>
                        <p className={`text-sm truncate ${unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Users Search Results */}
            {users.length > 0 && (
              <div className="space-y-2">
                <div className="text-gray-500 text-sm font-semibold mb-3 px-2">
                  People
                </div>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => openConversation(null, true, user)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && openConversation(null, true, user)}
                    aria-label={`Start chat with ${user.name} (${user.role})`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={`${user.name}'s avatar`}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                        loading="lazy"
                      />
                      <div className="flex-grow min-w-0">
                        <h2 className="font-semibold truncate text-base text-gray-900">
                          {user.name}
                          <span className="text-xs text-gray-400 ml-2 font-normal">({user.role})</span>
                        </h2>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversations;