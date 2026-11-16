import React from 'react';
import { BASE_SERVER_URL } from '../services/api';

const TicketChatBox = ({ comments, user, chatContainerRef, formatWhatsAppTime }) => {
  return (
    <div 
      ref={chatContainerRef}
      className="bg-slate-950 p-4 md:p-6 rounded-3xl border border-slate-800 space-y-4 h-105 overflow-y-auto shadow-inner"
    >
      {comments.length === 0 ? (
        <div className="text-center py-24 text-slate-400 font-medium">
          <p>Belum ada percakapan pada tiket ini.</p>
          <p className="text-[11px] text-slate-500 mt-1">Kirim pesan atau lampiran foto di bawah untuk memulai diskusi.</p>
        </div>
      ) : (
        comments.map((c) => {
          const isMe = Number(c.user_id) === Number(user?.id);
          return (
            <div key={c.id || Math.random()} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-400">{c.user_name || 'Pengguna'}</span>
              </div>
              <div className={`p-3.5 rounded-2xl max-w-[85%] md:max-w-[70%] text-xs md:text-sm shadow-sm relative space-y-2 ${
                isMe 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
              }`}>
                {c.attachment && (
                  <a href={`${BASE_SERVER_URL}/uploads/${c.attachment}`} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={`${BASE_SERVER_URL}/uploads/${c.attachment}`} 
                      alt="Lampiran Komentar" 
                      className="w-full max-h-48 object-cover rounded-xl border border-white/20 hover:opacity-95 transition"
                    />
                  </a>
                )}
                {c.comment && <p className="font-medium leading-relaxed whitespace-pre-wrap pr-12">{c.comment}</p>}
                <span className={`block text-right text-[9px] ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {formatWhatsAppTime(c.created_at)}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TicketChatBox;