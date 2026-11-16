import React from 'react';
import { flexRender } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, AlertCircle, RefreshCcw, FolderOpen } from 'lucide-react';

const TicketTable = ({ 
  table, 
  columns, 
  errorMsg, 
  loading, 
  fetchTickets, 
  search, 
  statusFilter, 
  userRole, 
  onCreateClick, 
  page, 
  totalPages, 
  onPageChange 
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="p-4 cursor-pointer select-none hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className="text-slate-400">
                          {isSorted === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-[#0256B3]" />
                          ) : isSorted === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5 text-[#0256B3]" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {errorMsg ? (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-[#E52E42]" />
                    <p className="font-bold text-slate-700 text-sm">{errorMsg}</p>
                    <button 
                      onClick={fetchTickets}
                      className="px-4 py-2 bg-[#0256B3] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                      <RefreshCcw className="w-4 h-4" /> Coba Lagi
                    </button>
                  </div>
                </td>
              </tr>
            ) : loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded w-6"></div></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="p-4"><div className="h-8 bg-slate-200 rounded-xl w-16"></div></td>
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 bg-blue-50 text-[#0256B3] rounded-3xl flex items-center justify-center shadow-xs">
                      <FolderOpen className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-slate-800 text-base">Belum Ada Tiket</h4>
                    <p className="text-slate-500 max-w-sm text-xs font-medium">
                      {search || statusFilter ? 'Tidak ada tiket yang cocok dengan filter pencarian Anda.' : 'Anda belum pernah membuat tiket bantuan. Buat tiket pertama Anda sekarang!'}
                    </p>
                    {userRole?.toLowerCase() === 'employee' && !search && !statusFilter && (
                      <button
                        onClick={onCreateClick}
                        className="mt-2 bg-[#E52E42] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md hover:bg-red-600 transition"
                      >
                        Buat Tiket Pertamamu
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/40 transition">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Halaman {page} dari {totalPages || 1}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-40 transition"><ChevronLeft className="w-4 h-4" /></button>
          <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-40 transition"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

export default TicketTable;