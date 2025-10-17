import React, { useEffect, useState } from 'react';
import * as messageService from '../../api/messageService';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    messageService
      .fetchConversations()
      .then(({ data }) => setConversations(data.data.conversations))
      .catch(() => setError('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;

  if (conversations.length === 0) return <p className="text-black p-4">No conversations found.</p>;

  return (
    <main className="p-4 text-black max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Conversations</h1>
      <ul className="space-y-3">
        {conversations.map((conv) => (
          <li key={conv.id} className="border border-black rounded p-3 hover:bg-gray-100">
            <Link to={`/messages/${conv.id}`} className="block text-black font-semibold">
              {conv.name}
              {conv.unread > 0 && (
                <span className="ml-2 bg-black text-white text-xs px-2 rounded">{conv.unread}</span>
              )}
            </Link>
            <p className="text-sm text-gray-600">{conv.lastMessage || 'No messages yet'}</p>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Conversations;
