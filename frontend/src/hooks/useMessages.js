import { useState, useEffect } from 'react';
import messageService from '../services/messageService';

export default function useMessages(conversationId, filters = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const loadMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await messageService.getMessages(conversationId, filters);
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId, JSON.stringify(filters)]);

  return { messages, loading, error, pagination, reload: loadMessages };
}
