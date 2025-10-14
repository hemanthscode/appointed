import { useState, useEffect } from 'react';
import messageService from '../services/messageService';

const useConversations = (params = {}) => {
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = async (queryParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await messageService.getConversations(queryParams);
      setConversations(data.conversations || []);
      setPagination(data.pagination || {});
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

export default useConversations;
