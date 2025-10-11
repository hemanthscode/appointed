import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Modal } from '../components/ui';
import { useConversations, useMessages } from '../hooks';
import {messageService} from '../services';
import {MessageForm} from '../components/forms';
import { Layout } from '../components/common'

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { conversations, loading: convLoading, error: convError, refresh: refreshConversations } = useConversations();
  const { messages, loading: msgLoading, error: msgError, refresh: refreshMessages } = useMessages(conversationId);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const openModal = (conv) => {
    setSelectedConversation(conv);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedConversation(null);
    setModalOpen(false);
    setError(null);
  };

  const sendMessage = async ({ content, files }) => {
    setActionLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('receiver', selectedConversation.otherUser._id);
      files.forEach(file => formData.append('files', file));
      await messageService.sendMessage(formData);
      refreshMessages();
      refreshConversations();
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConversation = async (id) => {
    setActionLoading(true);
    setError(null);
    try {
      await messageService.deleteConversation(id);
      refreshConversations();
      if (conversationId === id) {
        navigate('/messages');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete conversation');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 overflow-auto max-h-[80vh] border-r border-gray-700 pr-4">
          <Button onClick={() => navigate('/messages')} className="mb-4" variant="secondary" fullWidth>All Conversations</Button>
          {convLoading && <p>Loading conversations...</p>}
          {convError && <p className="text-red-500">{convError}</p>}
          {conversations.map(conv => {
            const otherUser = conv.participants.find(p => p._id !== selectedConversation?.otherUser?._id);
            return (
              <Card key={conv._id} className={`cursor-pointer mb-3 ${conv._id === conversationId ? 'bg-gray-800' : ''}`}>
                <div onClick={() => navigate(`/messages/${conv._id}`)}>
                  <div className="flex justify-between items-center">
                    <div>{otherUser?.name || 'Unknown User'}</div>
                    {conv.unreadCount > 0 && <Badge variant="danger">{conv.unreadCount}</Badge>}
                  </div>
                  <div className="text-sm text-gray-300 truncate">{conv.lastMessage?.content || 'No messages yet'}</div>
                </div>
                <Button size="small" variant="danger" onClick={() => handleDeleteConversation(conv._id)} disabled={actionLoading}>Delete</Button>
              </Card>
            );
          })}
        </div>

        <div className="md:w-2/3 flex flex-col">
          {!conversationId ? (
            <p className="text-center text-gray-500">Select a conversation to view messages.</p>
          ) : (
            <>
              <div className="overflow-auto max-h-[70vh] mb-4">
                {msgLoading && <p>Loading messages...</p>}
                {msgError && <p className="text-red-500">{msgError}</p>}
                {messages.map(msg => (
                  <div key={msg._id} className={`p-2 rounded mb-2 max-w-[70%] ${msg.sender._id === selectedConversation?.otherUser?._id ? 'bg-gray-700 self-start' : 'bg-blue-600 self-end text-white'}`}>
                    <p>{msg.content}</p>
                  </div>
                ))}
              </div>
              <MessageForm onSubmit={sendMessage} loading={actionLoading} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
