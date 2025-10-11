import { useState, useEffect } from 'react';
import messageService from '../services/messageService';

export const useConversations = (params = {}) => {
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = async (queryParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await messageService.getConversations(queryParams);
      setConversations(data.conversations);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(params);
  }, [JSON.stringify(params)]);

  return { conversations, pagination, loading, error, refresh: () => fetchConversations(params) };
};

export const useMessages = (conversationId, params = {}) => {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await messageService.getMessages(conversationId, params);
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, JSON.stringify(params)]);

  return { messages, pagination, loading, error, refresh: fetchMessages };
};
