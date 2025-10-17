import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as messageService from '../../api/messageService';
import MessageCard from '../../components/cards/MessageCard';
import MessageForm from '../../components/forms/MessageForm';
import Loader from '../../components/common/Loader';
import { useSocket } from '../../contexts/SocketContext';

const ChatWindow = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    messageService
      .fetchMessages(conversationId)
      .then(({ data }) => setMessages(data.data.messages))
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));

    socket.emit('join_conversation', conversationId);

    socket.on('new_message', (message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message');
    };
  }, [conversationId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (msg) => {
    try {
      await messageService.sendMessage(msg);
      // Message received via socket on success
    } catch {
      alert('Failed to send message');
    }
  };

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <main className="flex flex-col max-w-3xl mx-auto h-screen p-4 text-black">
      <h1 className="text-3xl font-bold mb-4">Chat</h1>
      <div className="flex-1 overflow-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <MessageCard key={msg._id} message={msg} isOwn={msg.sender._id === socket.userId} />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageForm onSend={handleSend} loading={false} />
    </main>
  );
};

export default ChatWindow;
