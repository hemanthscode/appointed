import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/common';
import { Card, Button, Badge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import messageService from '../services/messageService';
import MessageForm from '../components/forms/MessageForm';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [convError, setConvError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [msgError, setMsgError] = useState(null);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    setConvError(null);
    try {
      const res = await messageService.getConversations({ page: 1, limit: 50 });
      // API returns data.conversations array
      setConversations(res.conversations || []);
    } catch (e) {
      setConvError(e.message || 'Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Load messages for conversationId
  const loadMessages = useCallback(async (convId) => {
    if (!convId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    setMsgError(null);
    try {
      const res = await messageService.getMessages(convId, { page: 1, limit: 50 });
      // API returns data.messages array
      setMessages(res.messages || []);
      // Mark conversation as read once loaded
      if (res.messages?.length > 0) {
        await messageService.markAsRead(convId);
        await loadConversations(); // update read counts
      }
    } catch (e) {
      setMsgError(e.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  // Find selected conversation object by ID string (convo.conversationId or convo.id)
  const selectedConversation = conversations.find(
    (c) => c.conversationId === conversationId || c.id === conversationId
  );

  // Send new message handler
  const sendMessage = async ({ content, files }) => {
    if (!selectedConversation) {
      setSendError('No conversation selected');
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      const formData = new FormData();
      formData.append('content', content || '');
      // Pass receiver as the other user's conversationId or id
      formData.append('receiver', selectedConversation.conversationId || selectedConversation.id);
      if (files?.length) {
        files.forEach((file) => formData.append('files', file));
      }
      await messageService.sendMessage(formData);
      // Refresh messages and conversations
      await loadMessages(selectedConversation.conversationId || selectedConversation.id);
      await loadConversations();
    } catch (error) {
      setSendError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Delete conversation handler
  const deleteConversation = async (convId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    try {
      await messageService.deleteConversation(convId);
      await loadConversations();
      if (conversationId === convId) navigate('/messages');
    } catch {
      alert('Failed to delete conversation');
    }
  };

  return (
    <Layout headerTitle="Messages">
      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
        {/* Conversations List Panel */}
        <div className="md:w-1/3 overflow-auto border-r border-gray-700 pr-4">
          {loadingConversations ? (
            <p>Loading conversations...</p>
          ) : convError ? (
            <p className="text-red-500">{convError}</p>
          ) : conversations.length === 0 ? (
            <p className="text-gray-400 italic">No conversations found.</p>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.conversationId === selectedConversation?.conversationId;
              const unreadCount = conv.unread || conv.unreadCount || 0;

              return (
                <Card
                  key={conv.conversationId || conv.id}
                  className={`cursor-pointer mb-3 p-4 rounded-lg ${
                    isActive ? 'bg-gray-800' : 'bg-gray-900 hover:bg-gray-800'
                  } transition-colors duration-200`}
                  onClick={() => navigate(`/messages/${conv.conversationId || conv.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div className="truncate flex-1 mr-3">
                      <h3 className="font-semibold text-white truncate">{conv.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{conv.lastMessage || '(No messages yet)'}</p>
                    </div>
                    {unreadCount > 0 && <Badge variant="danger">{unreadCount}</Badge>}
                    <Button
                      size="small"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.conversationId || conv.id);
                      }}
                      className="ml-2 whitespace-nowrap"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Messages & Compose Panel */}
        <div className="md:w-2/3 flex flex-col bg-gray-900 rounded-lg p-4 shadow-lg">
          {!selectedConversation ? (
            <p className="text-center text-gray-400 mt-16">Select a conversation to view messages</p>
          ) : (
            <>
              <div className="overflow-auto max-h-[70vh] mb-4 flex flex-col space-y-3 p-2 bg-gray-800 rounded">
                {loadingMessages ? (
                  <p>Loading messages...</p>
                ) : msgError ? (
                  <p className="text-red-500">{msgError}</p>
                ) : messages.length === 0 ? (
                  <p className="text-gray-400 italic">No messages yet. Say hello!</p>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender._id === user._id;
                    return (
                      <div
                        key={msg._id}
                        className={`max-w-[70%] px-4 py-2 rounded-lg break-words ${
                          isOwn ? 'bg-blue-600 self-end text-white' : 'bg-gray-700 self-start text-gray-200'
                        }`}
                      >
                        <p>{msg.content}</p>
                        {msg.files && msg.files.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {msg.files.map((file) => (
                              <a
                                key={file._id}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-sm"
                              >
                                {file.name}
                              </a>
                            ))}
                          </div>
                        )}
                        <small className="block mt-1 text-xs text-gray-400 text-right">
                          {new Date(msg.createdAt).toLocaleString()}
                        </small>
                      </div>
                    );
                  })
                )}
              </div>
              <MessageForm onSubmit={sendMessage} loading={sending} />
              {sendError && <p className="text-red-500 mt-2">{sendError}</p>}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
