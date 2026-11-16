import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BarChart2, Clock, RefreshCw, FileCheck, Layers, Calendar, TrendingUp, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ open: 0, in_progress: 0, resolved: 0, closed: 0, total: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Tanggal Hari Ini Format Indonesia
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          API.get('/stats'),
          API.get('/tickets?limit=100')
        ]);

        const dataStats = statsRes.data || { open: 0, in_progress: 0, resolved: 0, closed: 0 };
        
        const openCount = Number(dataStats.open) || 0;
        const progressCount = Number(dataStats.in_progress) || 0;
        const resolvedCount = Number(dataStats.resolved) || 0;
        const closedCount = Number(dataStats.closed) || 0;
        
        const realTotal = openCount + progressCount + resolvedCount + closedCount;

        setStats({
          open: openCount,
          in_progress: progressCount,
          resolved: resolvedCount,
          closed: closedCount,
          total: realTotal
        });

        const allTickets = ticketsRes.data.data || [];
        
        // URUTKAN DAN AMBIL TIKET BERDASARKAN WAKTU PEMBUATAN TERBARU (created_at DESC)
        const sortedTickets = allTickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setRecentTickets(sortedTickets.slice(0, 5));
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Hitung tinggi relatif untuk grafik kolom vertikal
  const maxStatValue = Math.max(stats.open, stats.in_progress, stats.resolved, stats.closed, 1);
  const getColumnHeight = (val) => {
    const height = Math.round((val / maxStatValue) * 110);
    return height < 12 ? 12 : height;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} title="Dashboard" subtitle="Sistem Helpdesk Internal Pro App" />
        
        <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-xs md:text-sm">
          
          {/* HEADER ATAS: GABUNGAN TANGGAL & NAVIGASI CEPAT */}
          <div className="bg-linear-to-r from-[#0256B3] to-blue-700 text-white p-6 md:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">Ringkasan Sistem</span>
              <h2 className="text-xl md:text-2xl font-black">Dashboard Helpdesk Pro</h2>
              <p className="text-xs text-blue-100 font-medium">Pantau aktivitas penanganan tiket dan akses cepat menu dalam satu layar.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-2xl font-bold text-xs border border-white/20">
                <Calendar className="w-4 h-4 text-blue-200" />
                <span>{todayFormatted}</span>
              </div>
              <button 
                onClick={() => navigate('/tickets')}
                className="bg-white hover:bg-slate-100 text-[#0256B3] font-black px-5 py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <span>Kelola Daftar Tiket</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 5 KARTU STATISTIK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#E52E42] text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-[10px] opacity-80 uppercase font-bold tracking-wider">Total Open</p>
                <h3 className="text-xl font-black mt-1">{loading ? '...' : `${stats.open} Tiket`}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl"><BarChart2 className="w-5 h-5" /></div>
            </div>

            <div className="bg-[#0256B3] text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-[10px] opacity-80 uppercase font-bold tracking-wider">In Progress</p>
                <h3 className="text-xl font-black mt-1">{loading ? '...' : `${stats.in_progress} Tiket`}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl"><Clock className="w-5 h-5" /></div>
            </div>

            <div className="bg-[#0284C7] text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-[10px] opacity-80 uppercase font-bold tracking-wider">Resolved</p>
                <h3 className="text-xl font-black mt-1">{loading ? '...' : `${stats.resolved} Tiket`}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl"><RefreshCw className="w-5 h-5" /></div>
            </div>

            <div className="bg-slate-700 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-[10px] opacity-80 uppercase font-bold tracking-wider">Closed</p>
                <h3 className="text-xl font-black mt-1">{loading ? '...' : `${stats.closed} Tiket`}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl"><FileCheck className="w-5 h-5" /></div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-[10px] opacity-80 uppercase font-bold tracking-wider">Total Tiket</p>
                <h3 className="text-xl font-black mt-1">{loading ? '...' : `${stats.total} Tiket`}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl text-blue-300"><Layers className="w-5 h-5" /></div>
            </div>
          </div>

          {/* BAGIAN SAMPINGAN: GRAFIK & DAFTAR TIKET TERBARU */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GRAFIK BATANG VERTIKAL */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0256B3]" /> Grafik Statistik Status Tiket
                </h3>
                <span className="text-xs font-bold text-slate-400">Total: {stats.total} Tiket</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-end justify-around gap-2 h-48 pt-6">
                
                {/* Open */}
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-xs font-black text-slate-700">{stats.open}</span>
                  <div 
                    style={{ height: `${getColumnHeight(stats.open)}px` }} 
                    className="w-10 sm:w-14 bg-[#E52E42] rounded-t-xl shadow-sm transition-all duration-500"
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Open</span>
                </div>

                {/* Progress */}
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-xs font-black text-slate-700">{stats.in_progress}</span>
                  <div 
                    style={{ height: `${getColumnHeight(stats.in_progress)}px` }} 
                    className="w-10 sm:w-14 bg-[#0256B3] rounded-t-xl shadow-sm transition-all duration-500"
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Progress</span>
                </div>

                {/* Resolved */}
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-xs font-black text-slate-700">{stats.resolved}</span>
                  <div 
                    style={{ height: `${getColumnHeight(stats.resolved)}px` }} 
                    className="w-10 sm:w-14 bg-[#0284C7] rounded-t-xl shadow-sm transition-all duration-500"
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Resolved</span>
                </div>

                {/* Closed */}
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-xs font-black text-slate-700">{stats.closed}</span>
                  <div 
                    style={{ height: `${getColumnHeight(stats.closed)}px` }} 
                    className="w-10 sm:w-14 bg-slate-700 rounded-t-xl shadow-sm transition-all duration-500"
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Closed</span>
                </div>

              </div>
            </div>

            {/* DAFTAR TIKET TERBARU */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-sm">Daftar Tiket Terbaru</h3>
                <Link to="/tickets" className="text-xs font-bold text-[#0256B3] hover:underline flex items-center gap-1">
                  Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-48">
                {recentTickets.map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-100 transition cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#0256B3]">#{t.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          t.status === 'open' ? 'bg-red-100 text-red-600' :
                          t.status === 'in_progress' ? 'bg-blue-100 text-[#0256B3]' :
                          t.status === 'resolved' ? 'bg-sky-100 text-[#0284C7]' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 truncate">{t.title}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{new Date(t.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                ))}
                {recentTickets.length === 0 && !loading && (
                  <div className="p-8 text-center text-slate-400">Belum ada data tiket.</div>
                )}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;