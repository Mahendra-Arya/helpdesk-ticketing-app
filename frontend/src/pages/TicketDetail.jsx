import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TicketDetailHeader from '../components/TicketDetailHeader';
import TicketChatBox from '../components/TicketChatBox';
import TicketCommentInput from '../components/TicketCommentInput';

import API, { BASE_SERVER_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TicketDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentAttachment, setCommentAttachment] = useState(null);
  
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [statusAttachment, setStatusAttachment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const chatContainerRef = useRef(null);

  const scrollToBottomChat = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [ticketRes, commentRes] = await Promise.all([
        API.get(`/tickets/${id}`),
        API.get(`/tickets/${id}/comments`)
      ]);
      setTicket(ticketRes.data);
      setNewStatus(ticketRes.data.status);
      setComments(Array.isArray(commentRes.data) ? commentRes.data : []);
    } catch (err) {
      console.error('Gagal memuat detail tiket:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal memuat detail tiket dari database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (comments.length > 0) {
      scrollToBottomChat();
    }
  }, [comments]);

  useEffect(() => {
    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) return;

    const socket = io(BASE_SERVER_URL, {
      auth: { token: activeToken }
    });

    socket.on('comment:created', (data) => {
      if (Number(data.ticket_id) === Number(id)) {
        setComments((prevComments) => {
          const exists = prevComments.some(c => Number(c.id) === Number(data.id));
          if (exists) return prevComments;
          return [...prevComments, data];
        });
      }
    });

    socket.on('ticket:updated', (data) => {
      if (Number(data.id) === Number(id)) {
        setTicket(data);
        setNewStatus(data.status);
        showToast('Status tiket diperbarui secara real-time!', 'success');
      }
    });

    return () => {
      socket.off('comment:created');
      socket.off('ticket:updated');
      socket.disconnect();
    };
  }, [id, token]);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    const previousStatus = ticket.status;
    setUpdatingStatus(true);

    const formData = new FormData();
    formData.append('status', newStatus);
    formData.append('comment', statusComment);
    if (statusAttachment) {
      formData.append('attachment', statusAttachment);
    }

    setTicket((prev) => ({ ...prev, status: newStatus }));

    try {
      const res = await API.put(`/tickets/${id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatusAttachment(null);
      setStatusComment('');
      if (res.data?.data) setTicket(res.data.data);
      showToast('Status tiket berhasil diperbarui!', 'success');
    } catch (err) {
      setTicket((prev) => ({ ...prev, status: previousStatus }));
      setNewStatus(previousStatus);

      const errorMessage = err.code === 'ERR_NETWORK' || !err.response
        ? 'Gagal terhubung ke server (Backend mati).'
        : (err.response?.data?.message || 'Gagal mengubah status tiket.');
      
      showToast(errorMessage, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !commentAttachment) return;

    const formData = new FormData();
    formData.append('comment', newComment);
    if (commentAttachment) {
      formData.append('attachment', commentAttachment);
    }

    try {
      const res = await API.post(`/tickets/${id}/comments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewComment('');
      setCommentAttachment(null);
      if (res.data && res.data.comment) {
        setComments((prev) => {
          const exists = prev.some(c => Number(c.id) === Number(res.data.comment.id));
          if (exists) return prev;
          return [...prev, res.data.comment];
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengirim komentar', 'error');
    }
  };

  const formatWhatsAppTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    return `${date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(true)} 
          title={`Detail Tiket #${id}`} 
          subtitle="Informasi lengkap dan diskusi kendala" 
        />
        
        {toast.show && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-top-5 duration-300">
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-[#E52E42] text-white border-red-500'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="font-bold text-xs md:text-sm flex-1">{toast.message}</span>
            </div>
          </div>
        )}

        <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-xs md:text-sm">
          <Link to="/tickets" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0256B3] font-bold transition">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Tiket
          </Link>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-[#E52E42] rounded-2xl flex items-center gap-3 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white p-12 rounded-3xl text-center text-slate-400 font-medium border border-slate-200 shadow-xs">
              Memuat detail tiket dari database...
            </div>
          ) : !ticket ? (
            <div className="bg-white p-12 rounded-3xl text-center text-red-500 font-medium border border-slate-200 shadow-xs">
              Tiket tidak ditemukan atau Anda tidak memiliki hak akses.
            </div>
          ) : (
            <>
              <TicketDetailHeader
                ticket={ticket}
                user={user}
                newStatus={newStatus}
                setNewStatus={setNewStatus}
                statusComment={statusComment}
                setStatusComment={setStatusComment}
                statusAttachment={statusAttachment}
                setStatusAttachment={setStatusAttachment}
                handleStatusChange={handleStatusChange}
                updatingStatus={updatingStatus}
              />

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-base">Diskusi & Komentar ({comments.length})</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live
                  </span>
                </div>

                <TicketChatBox
                  comments={comments}
                  user={user}
                  chatContainerRef={chatContainerRef}
                  formatWhatsAppTime={formatWhatsAppTime}
                />

                <TicketCommentInput
                  newComment={newComment}
                  setNewComment={setNewComment}
                  commentAttachment={commentAttachment}
                  setCommentAttachment={setCommentAttachment}
                  handleAddComment={handleAddComment}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TicketDetail;