import React from 'react';
import { User, Clock, RefreshCcw, Paperclip, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { BASE_SERVER_URL } from '../services/api';

const TicketDetailHeader = ({
  ticket,
  user,
  newStatus,
  setNewStatus,
  statusComment,
  setStatusComment,
  statusAttachment,
  setStatusAttachment,
  handleStatusChange,
  updatingStatus
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-extrabold text-[#0256B3] text-base">#{ticket.id}</span>
            <span className="bg-blue-100 text-[#0256B3] px-3 py-1 rounded-full font-bold text-xs uppercase">{ticket.status}</span>
            <span className="text-slate-400 font-semibold">• {ticket.category_name || 'Kategori Umum'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800">{ticket.title}</h2>
        </div>

        {user?.role?.toLowerCase() === 'admin' && (
          <form onSubmit={handleStatusChange} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 w-full lg:w-96">
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={updatingStatus}
                className="bg-white px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none text-xs flex-1 disabled:opacity-50"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              
              <label className={`cursor-pointer bg-white hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold text-slate-600 transition shrink-0 ${updatingStatus ? 'opacity-50 pointer-events-none' : ''}`}>
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-22.5">{statusAttachment ? statusAttachment.name : 'Foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={updatingStatus}
                  onChange={(e) => setStatusAttachment(e.target.files[0])}
                />
              </label>
            </div>

            <input
              type="text"
              placeholder="Catatan penanganan ..."
              value={statusComment}
              disabled={updatingStatus}
              onChange={(e) => setStatusComment(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0256B3] disabled:opacity-50"
            />

            <button 
              type="submit" 
              disabled={updatingStatus}
              className="w-full bg-[#0256B3] hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <span>Simpan Perubahan Status</span>
              )}
            </button>
          </form>
        )}
      </div>

      <div>
        <h4 className="font-black text-slate-400 uppercase tracking-wider text-[10px] mb-2">Deskripsi Masalah</h4>
        <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed font-medium">
          {ticket.description}
        </p>
      </div>

      {ticket.admin_note && (
        <div>
          <h4 className="font-black text-slate-400 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0256B3]" /> Catatan Penanganan Admin
          </h4>
          <div className="text-slate-700 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 leading-relaxed font-medium">
            {ticket.admin_note}
          </div>
        </div>
      )}

      {ticket.attachment && (
        <div className="pt-2">
          <h4 className="font-black text-slate-400 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#0256B3]" /> Lampiran Foto Utama / Status
          </h4>
          <a 
            href={`${BASE_SERVER_URL}/uploads/${ticket.attachment}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img 
              src={`${BASE_SERVER_URL}/uploads/${ticket.attachment}`} 
              alt="Lampiran Tiket" 
              className="w-48 h-32 object-cover rounded-2xl border border-slate-200 shadow-sm hover:opacity-90 transition" 
            />
          </a>
        </div>
      )}

      <div className="flex flex-wrap gap-6 text-slate-400 text-xs pt-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Pembuat: <strong className="text-slate-700">{ticket.user_name || 'User'}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Tanggal Dibuat: <strong className="text-slate-700">{new Date(ticket.created_at).toLocaleString('id-ID')}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCcw className="w-4 h-4 text-amber-500" />
          <span>Terakhir Diupdate: <strong className="text-slate-700">{ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('id-ID') : '-'}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailHeader;