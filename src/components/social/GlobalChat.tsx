import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Message } from '../../types/game';
import { Send, Users } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export default function GlobalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { session, username, avatar } = useGameStore();
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setMessages(data.reverse());
    };
    fetchMessages();

    // Setup Realtime Subscription
    const channel = supabase.channel('global-chat');
    
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new as Message].slice(-50));
      }
    ).subscribe();

    // Setup Presence
    const presenceChannel = supabase.channel('online-users');
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user: username, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [username]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session?.user) return;

    const msg = input.trim();
    setInput('');

    await supabase.from('messages').insert({
      user_id: session.user.id,
      username: username || 'Player',
      avatar: avatar || '',
      message: msg
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent w-full">
      <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
          <Users className="w-3 h-3" /> Global Pulse
        </span>
        <span className="text-[10px] font-mono text-gray-500 shadow-inner">{onlineCount} Active</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 italic mt-4 opacity-50">Establishing connection...</div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2 items-baseline">
            <span className="text-cyan-400 font-bold flex-shrink-0">
              {msg.username}:
            </span>
            <span className="text-gray-200 break-words leading-relaxed">{msg.message}</span>
          </div>
        ))}
      </div>

      <div className="p-2 bg-white/5 border-t border-white/10">
        <form onSubmit={sendMessage} className="relative w-full bg-black/40 rounded border border-white/10 flex items-center px-3 py-1.5 focus-within:border-cyan-500/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={256}
            className="w-full bg-transparent text-[11px] font-mono text-gray-200 focus:outline-none placeholder:text-gray-600 placeholder:italic pr-6"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
