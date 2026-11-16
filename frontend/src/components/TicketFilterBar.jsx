import React from 'react';
import { Search, Plus } from 'lucide-react';

const TicketFilterBar = ({ search, onSearchChange, statusFilter, onStatusFilterChange, userRole, onCreateClick }) => {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0256B3]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {userRole?.toLowerCase() === 'employee' && (
        <button
          onClick={onCreateClick}
          className="w-full sm:w-auto bg-[#E52E42] hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md flex items-center justify-center gap-2 text-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Buat Tiket Baru
        </button>
      )}
    </div>
  );
};

export default TicketFilterBar;