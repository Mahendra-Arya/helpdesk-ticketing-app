import React from 'react';
import { LayoutDashboard, Ticket, LogOut, X, Headset } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutSession, user } = useAuth();

  const handleLogout = () => {
    if (logoutSession) logoutSession();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    { icon: Ticket, path: '/tickets', label: 'Daftar Tiket' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs transition-opacity" 
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#0256B3] text-white flex flex-col justify-between py-6 px-4 min-h-screen
        shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-tr from-indigo-600 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white/20 shrink-0">
                <Headset className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-wide leading-tight">Helpdesk Pro</h2>
                <p className="text-[10px] text-blue-200 uppercase font-semibold">Internal System</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="md:hidden p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider px-3 mb-1">Menu Utama</p>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = location.pathname === item.path || (item.path === '/tickets' && location.pathname.startsWith('/tickets/'));
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-200 ${
                    active 
                      ? 'bg-white text-[#0256B3] shadow-md translate-x-1' 
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-[#0256B3]' : 'text-blue-200'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-2">
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between shadow-sm">
            <div className="overflow-hidden">
              <p className="text-[10px] text-blue-200 font-semibold uppercase">Masuk Sebagai</p>
              <p className="text-xs font-bold truncate text-white">{user?.name || 'User'}</p>
              <span className="inline-block mt-1 text-[9px] uppercase font-extrabold text-[#E52E42] bg-white px-2 py-0.5 rounded-md">
                {user?.role || 'role'}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-md transition active:scale-95 cursor-pointer shrink-0"
              title="Keluar Aplikasi"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;