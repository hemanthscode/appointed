import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Search,
  User,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  MessageSquare
} from 'lucide-react';
import { Layout } from '../components/common';
import { Button, Input } from '../components/ui';
import { useApi } from '../hooks';
import { apiService } from '../services';
import { ROUTES, ANIMATIONS } from '../data';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: conversations = [] } = useApi(() => apiService.messages.getConversations(), []);

  const { data: messages = [] } = useApi(
    () => (selectedChat ? apiService.messages.getMessages(selectedChat) : Promise.resolve([])),
    [selectedChat]
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChat) {
      try {
        await apiService.messages.sendMessage({ conversationId: selectedChat, message: newMessage.trim() });
        setNewMessage('');
        // Optionally refetch messages or update state
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <Layout headerTitle="Messages" headerBackTo={ROUTES.DASHBOARD}>
      <div className="flex h-[calc(100vh-80px)]">
        {/* Conversations Sidebar */}
        <motion.div className="w-80 bg-gray-900/30 backdrop-blur-sm border-r border-gray-800 flex flex-col" {...ANIMATIONS.slideInFromLeft}>
          <div className="p-4 border-b border-gray-800">
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations
              .filter(conv => conv.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((conv) => (
                <motion.div
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                    selectedChat === conv.id ? 'bg-gray-800/50' : ''
                  }`}
                  whileHover={{ backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      {conv.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold truncate">{conv.name}</h3>
                        <span className="text-xs text-gray-400">{conv.time}</span>
                      </div>
                      <p className="text-xs text-gray-300">{conv.role}</p>
                      <p className="text-sm text-gray-400 truncate mt-1">{conv.lastMessage}</p>
                    </div>

                    {conv.unread > 0 && (
                      <div className="bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <motion.div className="p-4 border-b border-gray-800 flex items-center justify-between" {...ANIMATIONS.fadeInUp}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {conversations.find(c => c.id === selectedChat)?.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {conversations.find(c => c.id === selectedChat)?.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 cursor-pointer hover:text-gray-300" />
                  <Video className="h-5 w-5 cursor-pointer hover:text-gray-300" />
                  <MoreVertical className="h-5 w-5 cursor-pointer hover:text-gray-300" />
                </div>
              </motion.div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      msg.isOwn ? 'bg-white text-black' : 'bg-gray-800 text-white'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.isOwn ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message Input */}
              <motion.form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800" {...ANIMATIONS.fadeInUp}>
                <div className="flex items-center space-x-3">
                  <button type="button" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white"
                  />

                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    size="small"
                    icon={<Send className="h-5 w-5" />}
                  />
                </div>
              </motion.form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <motion.div className="text-center" {...ANIMATIONS.fadeInUp}>
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xl font-semibold mb-2">Select a conversation</p>
                <p className="text-gray-400">Choose a conversation to start messaging</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
