'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useSession, signIn } from 'next-auth/react';

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function ChatRoom() {
  const { data: session } = useSession();
  const { data: messages, mutate } = useSWR('/api/messages', fetcher, { refreshInterval: 1000 });
  const [inputText, setInputText] = useState('');
  const [inVoice, setInVoice] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !session || sending) return;

    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      content: inputText,
      createdAt: new Date().toISOString(),
      user: {
        name: session.user.name,
        image: session.user.image
      }
    };

    // Optimistic Update: Add message immediately
    mutate([...(messages || []), tempMessage], false);
    setInputText('');

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tempMessage.content }),
      });
      mutate(); // Revalidate to get real ID
    } catch (error) {
      console.error('Failed to send message', error);
      // Rollback on error (optional, but good practice)
      mutate(messages, false);
    }
  };

  if (!session) {
    return (
      <div className="login-prompt">
        <h3>Join the Community</h3>
        <p>You need to sign in with GitHub to chat.</p>
        <button onClick={() => signIn('github')}>Sign in with GitHub</button>
        <style jsx>{`
          .login-prompt {
            text-align: center;
            padding: 60px;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            backdrop-filter: var(--backdrop-blur);
          }
          button {
            margin-top: 20px;
            background: linear-gradient(135deg, var(--primary), #8b5cf6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
          }
          button:hover {
            transform: scale(1.05);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="voice-sidebar">
        <h3>Channels</h3>
        <div className="channel active">
          <div className="channel-header">
            <span className="channel-name"># general</span>
          </div>
        </div>
        <div className="channel">
          <div className="channel-header">
            <span className="channel-name">🔊 Voice Lounge</span>
            <button
              className={`join-btn ${inVoice ? 'leave' : ''}`}
              onClick={() => setInVoice(!inVoice)}
            >
              {inVoice ? 'Leave' : 'Join'}
            </button>
          </div>
          <div className="participants">
            {inVoice && (
              <div className="participant me">
                <div className="avatar small">
                  {session.user.image ? <img src={session.user.image} alt="me" /> : session.user.name?.[0]}
                </div>
                <span>{session.user.name}</span>
                <span className="mic-icon">🎙️</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-chat">
        <div className="messages-area">
          {messages?.map((msg, index) => {
            const isOwn = msg.user?.name === session.user.name;
            const showAvatar = index === 0 || messages[index - 1].user?.name !== msg.user?.name;

            return (
              <div key={msg.id} className={`message ${isOwn ? 'own' : ''} ${showAvatar ? 'new-group' : ''}`}>
                {!isOwn && showAvatar && (
                  <div className="message-avatar">
                    {msg.user?.image ? <img src={msg.user.image} alt={msg.user.name} /> : <div className="fallback-avatar">{msg.user?.name?.[0]}</div>}
                  </div>
                )}
                <div className="message-content-wrapper">
                  {showAvatar && !isOwn && <span className="username">{msg.user?.name || 'Unknown'}</span>}
                  <div className="message-bubble">
                    {msg.content}
                  </div>
                  {showAvatar && <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="input-area" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" disabled={!inputText.trim()}>
            Send
          </button>
        </form>
      </div>

      <style jsx>{`
        .chat-container {
          display: grid;
          grid-template-columns: 260px 1fr;
          height: 650px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: var(--glass-shadow);
          backdrop-filter: var(--backdrop-blur);
        }
        @media (max-width: 768px) {
          .chat-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            height: 80vh;
          }
          .voice-sidebar {
            display: none;
          }
        }
        .voice-sidebar {
          background: rgba(0,0,0,0.2);
          padding: 24px;
          border-right: 1px solid var(--glass-border);
        }
        .voice-sidebar h3 {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 20px;
          letter-spacing: 1.5px;
          font-weight: 700;
        }
        .channel {
          margin-bottom: 8px;
          padding: 10px;
          border-radius: 8px;
          transition: background 0.2s;
          cursor: pointer;
        }
        .channel:hover {
          background: var(--card-hover);
        }
        .channel.active {
          background: var(--card-hover);
          border: 1px solid var(--glass-border);
        }
        .channel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--foreground);
          font-weight: 500;
          font-size: 0.95rem;
        }
        .join-btn {
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .join-btn:hover {
          background: var(--card-hover);
          border-color: var(--primary);
        }
        .join-btn.leave {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border-color: rgba(239, 68, 68, 0.3);
        }
        .participants {
          margin-top: 12px;
          padding-left: 8px;
        }
        .participant {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .avatar.small {
          width: 24px;
          height: 24px;
          font-size: 0.7rem;
        }
        
        .text-chat {
          display: flex;
          flex-direction: column;
          background: transparent;
          height: 100%; /* Ensure full height */
          overflow: hidden; /* Prevent parent scroll */
        }
        .messages-area {
          flex: 1;
          padding: 24px;
          overflow-y: auto; /* Enable scrolling */
          display: flex;
          flex-direction: column;
          gap: 4px;
          scroll-behavior: smooth;
        }
        .message {
          display: flex;
          gap: 12px;
          max-width: 75%;
          margin-bottom: 4px;
          animation: fadeIn 0.2s ease;
        }
        .message.new-group {
          margin-top: 12px;
        }
        .message.own {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: #333;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .message-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .fallback-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
        }
        .message-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .username {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-left: 4px;
        }
        .message.own .username {
          display: none;
        }
        .message-bubble {
          background: var(--card-bg);
          padding: 10px 16px;
          border-radius: 18px;
          border-top-left-radius: 4px;
          color: var(--foreground);
          line-height: 1.5;
          font-size: 0.95rem;
          border: 1px solid var(--glass-border);
        }
        .message.own .message-bubble {
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          color: white;
          border-radius: 18px;
          border-top-left-radius: 18px;
          border-top-right-radius: 4px;
          border: none;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .time {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-left: 4px;
          opacity: 0.7;
        }
        .message.own .time {
          text-align: right;
          margin-right: 4px;
        }
        
        .input-area {
          padding: 20px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          gap: 12px;
          background: rgba(0,0,0,0.1);
        }
        input {
          flex: 1;
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          padding: 14px 20px;
          border-radius: 14px;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        input:focus {
          background: var(--card-hover);
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        button[type="submit"] {
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          border: none;
          color: white;
          padding: 0 28px;
          border-radius: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        button[type="submit"]:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
        }
        button[type="submit"]:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          box-shadow: none;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
