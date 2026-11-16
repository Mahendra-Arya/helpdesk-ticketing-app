import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, User, Menu, Check, LogOut, Shield, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API, { BASE_SERVER_URL } from '../services/api';

const Navbar = ({ onToggleSidebar, title = "Dashboard", subtitle = "Sistem Ticketing Helpdesk Internal" }) => {
  const { user, token, logoutSession } = useAuth();
  const navigate = useNavigate();

  const [isOpenBell, setIsOpenBell] = useState(false);
  const [isOpenMsg, setIsOpenMsg] = useState(false);
  const [isOpenProfile, setIsOpenProfile] = useState(false);

  const [bellNotifs, setBellNotifs] = useState([]);
  const [msgNotifs, setMsgNotifs] = useState([]);

  const bellRef = useRef(null);
  const msgRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const fetchAllNotifs = async () => {
      try {
        const activeToken = token || localStorage.getItem('token');
        if (!activeToken || !user?.id) return;

        const response = await API.get('/tickets/notifications/list');

        const savedBellRead = JSON.parse(localStorage.getItem(`read_bell_${user.id}`) || '[]');
        const savedMsgRead = JSON.parse(localStorage.getItem(`read_msg_${user.id}`) || '[]');

        const sysList = [];
        const msgList = [];

        response.data.forEach((item) => {
          const formattedItem = {
            id: item.id,
            ticket_id: item.ticket_id,
            user_name: item.user_name,
            title: item.ticket_title,
            message: item.message,
            time: `${new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.created_at).toLocaleDateString()}`
          };

          if (item.type === 'ticket_created' || item.type === 'ticket_updated') {
            sysList.push({ ...formattedItem, is_read: savedBellRead.includes(item.id) });
          } else if (item.type === 'comment_created') {
            msgList.push({ ...formattedItem, is_read: savedMsgRead.includes(item.id) });
          }
        });

        setBellNotifs(sysList);
        setMsgNotifs(msgList);
      } catch (err) {
        console.error('Gagal mengambil notifikasi:', err);
      }
    };

    fetchAllNotifs();
  }, [token, user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) setIsOpenBell(false);
      if (msgRef.current && !msgRef.current.contains(event.target)) setIsOpenMsg(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsOpenProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const activeToken = token || localStorage.getItem('token');
    if (!activeToken || !user?.id) return;

    const socket = io(BASE_SERVER_URL, { auth: { token: activeToken } });

    socket.on('ticket:created', (data) => {
      if (user?.role?.toLowerCase() === 'admin') {
        const newNotif = {
          id: `ticket-${data.id}`,
          ticket_id: data.id,
          user_name: data.user_name || 'Staff',
          title: data.title || `Tiket #${data.id}`,
          message: 'membuat tiket baru',
          time: 'Baru saja',
          is_read: false
        };
        setBellNotifs((prev) => [newNotif, ...prev]);
      }
    });

    socket.on('ticket:updated', (data) => {
      if (user?.role?.toLowerCase() === 'employee' && Number(data.user_id) === Number(user?.id)) {
        const timestamp = Math.floor(new Date(data.updated_at || Date.now()).getTime() / 1000);
        const newNotif = {
          id: `status-${data.id}-${timestamp}`,
          ticket_id: data.id,
          user_name: 'Admin IT',
          title: data.title || `Tiket #${data.id}`,
          message: `memperbarui status tiket menjadi "${data.status?.toUpperCase()}"`,
          time: 'Baru saja',
          is_read: false
        };
        setBellNotifs((prev) => [newNotif, ...prev]);
      }
    });

    socket.on('comment:created', (data) => {
      if (Number(data.user_id) !== Number(user?.id)) {
        const newNotif = {
          id: `comment-${data.id}`,
          ticket_id: data.ticket_id,
          user_name: data.user_name || 'Pengguna',
          title: data.ticket_title || `Tiket #${data.ticket_id}`,
          message: `mengirim pesan: "${data.comment || ''}"`,
          time: 'Baru saja',
          is_read: false
        };
        setMsgNotifs((prev) => [newNotif, ...prev]);
      }
    });

    return () => {
      socket.off('ticket:created');
      socket.off('ticket:updated');
      socket.off('comment:created');
      socket.disconnect();
    };
  }, [token, user?.id, user?.role]);

  const unreadBellCount = bellNotifs.filter((n) => !n.is_read).length;
  const unreadMsgCount = msgNotifs.filter((n) => !n.is_read).length;

  const handleSelectBell = (notif) => {
    const updated = bellNotifs.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n));
    setBellNotifs(updated);
    if (user?.id) {
      const readIds = updated.filter((n) => n.is_read).map((n) => n.id);
      localStorage.setItem(`read_bell_${user.id}`, JSON.stringify(readIds));
    }
    setIsOpenBell(false);
    navigate(`/tickets/${notif.ticket_id}`);
  };

  const handleSelectMsg = (notif) => {
    const updated = msgNotifs.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n));
    setMsgNotifs(updated);
    if (user?.id) {
      const readIds = updated.filter((n) => n.is_read).map((n) => n.id);
      localStorage.setItem(`read_msg_${user.id}`, JSON.stringify(readIds));
    }
    setIsOpenMsg(false);
    navigate(`/tickets/${notif.ticket_id}`);
  };

  const markAllBellAsRead = () => {
    const updated = bellNotifs.map((n) => ({ ...n, is_read: true }));
    setBellNotifs(updated);
    if (user?.id) {
      localStorage.setItem(`read_bell_${user.id}`, JSON.stringify(updated.map((n) => n.id)));
    }
  };

  const markAllMsgAsRead = () => {
    const updated = msgNotifs.map((n) => ({ ...n, is_read: true }));
    setMsgNotifs(updated);
    if (user?.id) {
      localStorage.setItem(`read_msg_${user.id}`, JSON.stringify(updated.map((n) => n.id)));
    }
  };

  const handleLogout = () => {
    if (logoutSession) logoutSession();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between top-0 z-40 shadow-xs relative">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-2 md:hidden text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-800 leading-tight">{title}</h1>
          <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-xs">
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => { setIsOpenBell(!isOpenBell); setIsOpenMsg(false); setIsOpenProfile(false); }}
            className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full relative transition active:scale-95 cursor-pointer"
            title="Notifikasi Tiket"
          >
            <Bell className="w-4 h-4" />
            {unreadBellCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#0256B3] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full min-w-4.5 text-center shadow-xs">
                {unreadBellCount}
              </span>
            )}
          </button>

          {isOpenBell && (
            <div className="fixed sm:absolute left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 top-16 sm:top-auto mt-0 sm:mt-3 w-[92vw] max-w-85 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-slate-700 text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#0256B3]" /> Notifikasi Tiket 
                </span>
                {unreadBellCount > 0 && (
                  <button onClick={markAllBellAsRead} className="text-[10px] text-[#0256B3] hover:underline font-bold flex items-center gap-1 cursor-pointer">
                    <Check className="w-3 h-3" /> Terbaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {bellNotifs.slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleSelectBell(item)} 
                    className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                      !item.is_read ? 'bg-blue-50/50 border-l-4 border-[#0256B3]' : 'hover:bg-slate-50 opacity-75'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0256B3] font-bold flex items-center justify-center shrink-0 text-xs">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 leading-snug">
                        <strong className="font-bold">{item.user_name}</strong> {item.message} pada <span className="font-bold text-[#0256B3]">"{item.title}"</span>
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                    </div>
                  </div>
                ))}
                {bellNotifs.length === 0 && <div className="p-8 text-center text-slate-400">Tidak ada notifikasi tiket.</div>}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={msgRef}>
          <button
            onClick={() => { setIsOpenMsg(!isOpenMsg); setIsOpenBell(false); setIsOpenProfile(false); }}
            className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full relative transition active:scale-95 cursor-pointer"
            title="Notifikasi Diskusi"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMsgCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#E52E42] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full min-w-4.5 text-center shadow-xs">
                {unreadMsgCount}
              </span>
            )}
          </button>

          {isOpenMsg && (
            <div className="fixed sm:absolute left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 top-16 sm:top-auto mt-0 sm:mt-3 w-[92vw] max-w-85 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-slate-700 text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#E52E42]" /> Diskusi
                </span>
                {unreadMsgCount > 0 && (
                  <button onClick={markAllMsgAsRead} className="text-[10px] text-[#0256B3] hover:underline font-bold flex items-center gap-1 cursor-pointer">
                    <Check className="w-3 h-3" /> Terbaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {msgNotifs.slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleSelectMsg(item)} 
                    className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                      !item.is_read ? 'bg-amber-50/40 border-l-4 border-[#E52E42]' : 'hover:bg-slate-50 opacity-75'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 text-[#E52E42] font-bold flex items-center justify-center shrink-0 text-xs">
                      {item.user_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 leading-snug">
                        <strong className="font-bold">{item.user_name}</strong> {item.message} pada <span className="font-bold text-slate-800">"{item.title}"</span>
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                    </div>
                  </div>
                ))}
                {msgNotifs.length === 0 && <div className="p-8 text-center text-slate-400">Tidak ada notifikasi diskusi.</div>}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setIsOpenProfile(!isOpenProfile); setIsOpenBell(false); setIsOpenMsg(false); }}
            className="flex items-center gap-2.5 hover:bg-slate-100 p-1.5 rounded-2xl transition cursor-pointer"
          >
            <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center text-[#0256B3] font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-bold text-slate-800 leading-none">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user?.role}</p>
            </div>
          </button>

          {isOpenProfile && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 p-2 text-xs">
              <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-xl mb-1">
                <p className="font-bold text-slate-800">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#0256B3]" /> {user?.role || 'Role'}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 p-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;