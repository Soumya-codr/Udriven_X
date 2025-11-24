'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useSession, signIn } from 'next-auth/react';

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function ChatRoom() {
  const { data: session } = useSession();
  const { data: messages, mutate } = useSWR('/api/messages', fetcher, { refreshInterval: 2000 });
  const [inputText, setInputText] = useState('');
  const [inVoice, setInVoice] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !session) return;

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText }),
      });
      mutate(); // Refresh messages immediately
      setInputText('');
    } catch (error) {
      console.error('Failed to send message', error);
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
            padding: 40px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
          }
          button {
            margin-top: 16px;
            background: var(--primary);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="voice-sidebar">
        <h3>Voice Channels</h3>
        <div className="channel">
          <div className="channel-header">
            <span>🔊 General</span>
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
                <div className="avatar">
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
          {messages?.map((msg) => (
            <div key={msg.id} className={`message ${msg.user?.name === session.user.name ? 'own' : ''}`}>
              <div className="message-header">
                <span className="username">{msg.user?.name || 'Unknown'}</span>
                <span className="time">{new Date(msg.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="input-area" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>

      <style jsx>{`
        .chat-container {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 24px;
          height: 600px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .chat-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            height: auto;
            min-height: 600px;
          }
        }
        .voice-sidebar {
          background: rgba(0,0,0,0.2);
          padding: 20px;
          border-right: 1px solid var(--card-border);
        }
        .voice-sidebar h3 {
          font-size: 0.9rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 16px;
          letter-spacing: 1px;
        }
        .channel {
          margin-bottom: 20px;
        }
        .channel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .join-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: var(--foreground);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .join-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .join-btn.leave {
          background: var(--error);
          color: white;
        }
        .participants {
          margin-left: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .participant {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .participant.me {
          color: var(--primary);
          font-weight: 500;
        }
        .avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: white;
          overflow: hidden;
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mic-icon {
          font-size: 0.8rem;
          margin-left: auto;
        }
        .text-chat {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .messages-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .message {
          display: flex;
          flex-direction: column;
          max-width: 70%;
        }
        .message.own {
          align-self: flex-end;
          align-items: flex-end;
        }
        .message-header {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 0.8rem;
        }
        .username {
          font-weight: bold;
          color: var(--primary);
        }
        .time {
          color: var(--text-muted);
        }
        .message-bubble {
          background: var(--card-hover);
          padding: 10px 16px;
          border-radius: 12px;
          border-top-left-radius: 2px;
          line-height: 1.4;
        }
        .message.own .message-bubble {
          background: var(--primary);
          color: white;
          border-radius: 12px;
          border-top-right-radius: 2px;
        }
        .input-area {
          padding: 20px;
          border-top: 1px solid var(--card-border);
          display: flex;
          gap: 12px;
        }
        input {
          flex: 1;
          background: var(--background);
          border: 1px solid var(--card-border);
          padding: 12px;
          border-radius: 8px;
          color: var(--foreground);
          outline: none;
        }
        input:focus {
          border-color: var(--primary);
        }
        button[type="submit"] {
          background: var(--primary);
          border: none;
          color: white;
          padding: 0 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        button[type="submit"]:hover {
          background: #7c3aed;
        }
      `}</style>
    </div>
  );
}
