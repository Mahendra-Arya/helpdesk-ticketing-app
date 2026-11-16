import React, { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { CheckCircle2, User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketFilterBar from '../components/TicketFilterBar';
import TicketTable from '../components/TicketTable';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const TicketList = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toastMsg, setToastMsg] = useState('');
  
  const [sorting, setSorting] = useState([]);

  const fetchTickets = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.get('/tickets', {
        params: { q: search, status: statusFilter, page, limit: 10 }
      });
      
      // Mendukung berbagai format respons backend (array langsung, res.data.data, atau res.data.tickets)
      const ticketData = Array.isArray(res.data) 
        ? res.data 
        : (res.data.data || res.data.tickets || []);
      
      setTickets(ticketData);

      // Mengambil total halaman dari pagination backend
      const totalP = res.data.pagination?.total_pages || res.data.totalPages || 1;
      setTotalPages(totalP);
    } catch (err) {
      console.error('Gagal mengambil data tiket:', err);
      setErrorMsg('Gagal memuat daftar tiket dari server. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, page]);

  const showToast = (msg) => {
    setToastMsg(msg);
    fetchTickets();
    setTimeout(() => setToastMsg(''), 4000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <span className="text-[#0256B3] px-2.5 py-1 rounded-full font-bold">Open</span>;
      case 'in_progress': return <span className="text-amber-700 px-2.5 py-1 rounded-full font-bold">In Progress</span>;
      case 'resolved': return <span className="text-emerald-700 px-2.5 py-1 rounded-full font-bold">Resolved</span>;
      case 'closed': return <span className="text-slate-700 px-2.5 py-1 rounded-full font-bold">Closed</span>;
      default: return status;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return <span className="text-[#E52E42] font-extrabold uppercase">High</span>;
      case 'medium': return <span className="text-amber-600 font-bold uppercase">Medium</span>;
      case 'low': return <span className="text-slate-500 font-semibold uppercase">Low</span>;
      default: return priority;
    }
  };

  const columns = useMemo(() => [
    { accessorKey: 'id', header: '#', cell: (info) => <span className="font-bold text-[#0256B3]">#{info.getValue()}</span> },
    {
      accessorKey: 'title',
      header: 'Judul Tiket',
      cell: (info) => (
        <Link to={`/tickets/${info.row.original.id}`} className="font-bold text-slate-800 hover:text-[#0256B3] hover:underline">
          {info.getValue()}
        </Link>
      )
    },
    {
      accessorKey: 'user_name',
      header: 'Pembuat',
      cell: (info) => (
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{info.getValue() || 'User'}</span>
        </div>
      )
    },
    { accessorKey: 'category_name', header: 'Kategori', cell: (info) => <span className="text-slate-600 font-medium">{info.getValue() || '-'}</span> },
    { accessorKey: 'status', header: 'Status', cell: (info) => getStatusBadge(info.getValue()) },
    { accessorKey: 'priority', header: 'Prioritas', cell: (info) => getPriorityBadge(info.getValue()) },
    {
      accessorKey: 'created_at',
      header: 'Tanggal Dibuat',
      cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
    },
    {
      accessorKey: 'updated_at',
      header: 'Terakhir Diupdate',
      cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: (info) => (
        <Link
          to={`/tickets/${info.row.original.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#0256B3] hover:bg-[#0256B3] hover:text-white rounded-xl font-bold transition text-xs shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5" /> Detail
        </Link>
      )
    }
  ], []);

  const table = useReactTable({
    data: tickets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} title="Daftar Tiket" subtitle="Kelola dan pantau status tiket bantuan" />
        <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {toastMsg && (
            <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-xs">{toastMsg}</span>
            </div>
          )}

          <TicketFilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => { setStatusFilter(val); setPage(1); }}
            userRole={user?.role}
            onCreateClick={() => setIsModalOpen(true)}
          />

          <TicketTable
            table={table}
            columns={columns}
            errorMsg={errorMsg}
            loading={loading}
            fetchTickets={fetchTickets}
            search={search}
            statusFilter={statusFilter}
            userRole={user?.role}
            onCreateClick={() => setIsModalOpen(true)}
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </main>
      </div>
      <CreateTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={showToast} />
    </div>
  );
};

export default TicketList;