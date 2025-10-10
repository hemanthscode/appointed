import React, { useState, useEffect } from 'react';
import { Layout } from '../components/common';
import { Card, Button, Input } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import messageService from '../services/messageService';

const MessagesPage = () => {
  const toast = useToast();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load conversations
  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const data = await messageService.getConversations({ page: 1, limit: 20 });
      setConversations(data.conversations);
      if (data.conversations.length > 0 && !selectedConversationId) setSelectedConversationId(data.conversations[0]._id);
    } catch {
      toast.addToast('Failed to load conversations.', 'error');
    }
    setLoadingConversations(false);
  };

  // Load selected conversation messages
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const data = await messageService.getMessages(conversationId, { page: 1, limit: 50 });
      setMessages(data.messages);
    } catch {
      toast.addToast('Failed to load messages.', 'error');
    }
    setLoadingMessages(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    fetchMessages(selectedConversationId);
  }, [selectedConversationId]);

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    try {
      const formData = new FormData();
      formData.append('conversationId', selectedConversationId);
      formData.append('text', messageInput.trim());
      await messageService.sendMessage(formData);
      setMessageInput('');
      fetchMessages(selectedConversationId);
    } catch {
      toast.addToast('Failed to send message.', 'error');
    }
  };

  // Search messages
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const data = await messageService.searchMessages({ query: value.trim(), page: 1, limit: 10 });
      setSearchResults(data.messages || []);
    } catch {
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  return (
    <Layout headerTitle="Messages">
      <section className="max-w-7xl mx-auto p-6 flex space-x-6 text-white">
        <aside className="w-1/3">
          <Input
            placeholder="Search Messages"
            value={searchTerm}
            onChange={handleSearch}
            className="mb-4"
            disabled={searchLoading}
          />
          {loadingConversations ? (
            <p>Loading conversations...</p>
          ) : (
            <ul className="space-y-2 overflow-auto max-h-[75vh]">
              {(searchTerm && searchResults.length > 0 ? searchResults : conversations).map((conv) => (
                <li
                  key={conv._id}
                  className={`p-3 rounded cursor-pointer ${
                    conv._id === selectedConversationId ? 'bg-gray-700' : 'hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedConversationId(conv._id)}
                  aria-label={`Conversation with ${conv.name || 'User'}`}
                >
                  <p className="font-semibold">{conv.name || conv.participants?.join(', ') || 'Conversation'}</p>
                  <p className="text-sm text-gray-400">{conv.lastMessageSnippet || 'No messages yet'}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="w-2/3 flex flex-col h-[75vh] bg-gray-900 rounded p-4">
          {loadingMessages ? (
            <p>Loading messages...</p>
          ) : !selectedConversationId ? (
            <p>Select a conversation</p>
          ) : (
            <>
              <ul className="flex-grow overflow-y-auto space-y-3 mb-4">
                {messages.map(({ _id, text, senderName, createdAt }) => (
                  <li key={_id} className="p-2 rounded bg-gray-800">
                    <p className="font-semibold">{senderName}</p>
                    <p>{text}</p>
                    <small className="text-gray-400">{new Date(createdAt).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-grow p-3 rounded bg-gray-700 text-white outline-none"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button variant="primary" onClick={handleSendMessage}>
                  Send
                </Button>
              </div>
            </>
          )}
        </main>
      </section>
    </Layout>
  );
};

export default MessagesPage;
