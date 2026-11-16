import React from 'react';
import { Paperclip, Send } from 'lucide-react';

const TicketCommentInput = ({
  newComment,
  setNewComment,
  commentAttachment,
  setCommentAttachment,
  handleAddComment
}) => {
  return (
    <form onSubmit={handleAddComment} className="flex items-center gap-3 pt-2">
      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-600 transition shrink-0" title="Lampirkan Foto">
        <Paperclip className="w-4 h-4" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setCommentAttachment(e.target.files[0])}
        />
      </label>

      {commentAttachment && (
        <span className="text-[11px] bg-blue-50 text-[#0256B3] px-3 py-1.5 rounded-xl font-bold truncate max-w-35">
          {commentAttachment.name}
        </span>
      )}

      <input
        type="text"
        placeholder="Ketik balasan atau lampirkan foto..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="flex-1 p-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0256B3] bg-slate-50/50 text-xs md:text-sm"
      />
      <button type="submit" className="bg-[#0256B3] hover:bg-blue-700 text-white font-bold p-3.5 rounded-2xl shadow-md flex items-center justify-center transition shrink-0 active:scale-95">
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default TicketCommentInput;