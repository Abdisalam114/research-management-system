import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { conversationsAPI, usersAPI } from '../api/services';
import { 
  Send, Search, Plus, User, Users, MoreVertical, 
  MessageSquare, Clock, Check, CheckCheck, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Conversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await conversationsAPI.getAll();
      setConversations(res.data);
      if (res.data.length > 0 && !activeConv) {
        // setActiveConv(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    usersAPI.getAll({ status: 'active' }).then(res => setAllUsers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeConv) {
      setMessages(activeConv.messages || []);
      scrollToBottom();
      // Mark as read
      conversationsAPI.markRead(activeConv._id).catch(() => {});
    }
  }, [activeConv]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    try {
      const res = await conversationsAPI.sendMessage(activeConv._id, { content: newMessage });
      const sentMsg = {
        ...res.data,
        sender: { _id: user._id, name: user.name }
      };
      setMessages([...messages, sentMsg]);
      setNewMessage('');
      fetchConversations(); // Update list to show last message
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleStartConversation = async (otherUser) => {
    try {
      const res = await conversationsAPI.create({ 
        participants: [otherUser._id],
        type: 'direct',
        title: `Chat with ${otherUser.name}`
      });
      setShowNewModal(false);
      fetchConversations();
      setActiveConv(res.data);
    } catch (err) {
      toast.error('Error starting conversation');
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u._id !== user._id && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: '20px' }}>
      <Toaster position="top-right" />
      
      {/* Sidebar: Conversations List */}
      <div className="card" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Messages</h3>
            <button className="btn btn-icon btn-primary" style={{ width: '32px', height: '32px' }} onClick={() => setShowNewModal(true)}>
              <Plus size={18} />
            </button>
          </div>
          <div className="search-input">
            <Search className="search-icon" />
            <input type="text" className="form-input" placeholder="Search chats..." />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}><div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }} /></div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <MessageSquare size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>No conversations yet.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const otherParticipant = conv.participants.find(p => p._id !== user._id);
              const isActive = activeConv?._id === conv._id;
              
              return (
                <div 
                  key={conv._id} 
                  onClick={() => setActiveConv(conv)}
                  style={{ 
                    padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    background: isActive ? 'var(--bg-secondary)' : 'transparent',
                    borderLeft: isActive ? '4px solid var(--accent)' : '4px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="sidebar-avatar" style={{ background: 'var(--accent)', flexShrink: 0 }}>
                      {conv.type === 'group' ? <Users size={16} /> : (otherParticipant?.name?.charAt(0) || 'U')}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.type === 'group' ? conv.title : otherParticipant?.name}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                          {conv.lastMessage?.sentAt ? new Date(conv.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="sidebar-avatar" style={{ background: 'var(--accent)' }}>
                  {activeConv.type === 'group' ? <Users size={18} /> : (activeConv.participants.find(p => p._id !== user._id)?.name?.charAt(0) || 'U')}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>
                    {activeConv.type === 'group' ? activeConv.title : activeConv.participants.find(p => p._id !== user._id)?.name}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Online</span>
                </div>
              </div>
              <button className="btn btn-icon btn-secondary"><MoreVertical size={18} /></button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.02)' }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                  <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p>Start the conversation by sending a message.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = (msg.sender?._id || msg.sender) === user._id;
                  return (
                    <div key={idx} style={{ 
                      alignSelf: isMe ? 'flex-end' : 'flex-start', 
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{ 
                        padding: '10px 16px', 
                        borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        background: isMe ? 'var(--accent)' : 'var(--bg-card)',
                        color: isMe ? 'white' : 'var(--text-primary)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && <CheckCheck size={12} color="var(--accent)" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  className="form-input" 
                  placeholder="Type your message here..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  style={{ borderRadius: '24px', paddingLeft: '20px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '48px', height: '48px', borderRadius: '24px', padding: 0, justifyContent: 'center' }}>
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', padding: '40px' }}>
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '60px', background: 'var(--bg-secondary)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
            }}>
              <MessageSquare size={48} style={{ opacity: 0.2 }} />
            </div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Select a Conversation</h2>
            <p style={{ textAlign: 'center', maxWidth: '300px' }}>Select a chat from the sidebar or start a new one to begin collaborating with your research team.</p>
            <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => setShowNewModal(true)}>Start New Chat</button>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', height: '500px', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>New Conversation</h3>
              <button className="btn btn-icon" onClick={() => setShowNewModal(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '16px' }}>
              <div className="search-input">
                <Search className="search-icon" />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search researchers..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredUsers.map(u => (
                <div 
                  key={u._id} 
                  onClick={() => handleStartConversation(u)}
                  style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="sidebar-avatar" style={{ background: 'var(--accent)' }}>{u.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.role.toUpperCase()} • {u.department || 'No Dept'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
