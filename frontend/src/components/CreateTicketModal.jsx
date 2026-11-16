import React, { useState, useEffect } from 'react';
import { X, Paperclip } from 'lucide-react';
import API from '../services/api';

const CreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      API.get('/categories')
        .then(res => {
          const categoryData = Array.isArray(res.data) 
            ? res.data 
            : (res.data.data || res.data.categories || []);
          setCategories(categoryData);
        })
        .catch(err => {
          console.error('Gagal memuat kategori', err);
          setCategories([]);
        });
    }
  }, [isOpen]);

  // Fungsi sanitasi ringan sisi klien (hapus spasi ujung, batasi karakter, hapus tag HTML)
  const sanitizeClientText = (text, maxLen) => {
    return text
      .replace(/<[^>]*>?/gm, '') // Hapus tag HTML jika ada
      .trim()
      .substring(0, maxLen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Sanitasi input di sisi frontend
    const cleanTitle = sanitizeClientText(title, 150);
    const cleanDescription = sanitizeClientText(description, 2000);

    // 2. Validasi input sisi klien
    if (!cleanTitle || !cleanDescription || !categoryId) {
      alert('Judul, kategori, dan deskripsi wajib diisi dengan benar (tidak boleh hanya spasi atau tag HTML).');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', cleanTitle);
    formData.append('category_id', categoryId);
    formData.append('priority', priority);
    formData.append('description', cleanDescription);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      await API.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess('Tiket berhasil dibuat dengan aman!');
      onClose();
      setTitle('');
      setCategoryId('');
      setPriority('medium');
      setDescription('');
      setAttachment(null);
    } catch (err) {
      // 3. Sinkronisasi pesan error dari backend ke frontend
      const errorMsg = err.response?.data?.message || 'Gagal membuat tiket';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-black text-slate-800 text-base">Buat Tiket Bantuan Baru</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">Judul Tiket *</label>
              <span className="text-[10px] text-slate-400">{title.length}/150</span>
            </div>
            <input
              type="text"
              required
              maxLength={150}
              placeholder="Contoh: Jaringan lemot"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0256B3]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-2xl bg-white font-semibold text-slate-700 focus:outline-none"
              >
                <option value="">Pilih Kategori</option>
                {Array.isArray(categories) && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Prioritas *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-2xl bg-white font-semibold text-slate-700 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">Deskripsi Masalah *</label>
              <span className="text-[10px] text-slate-400">{description.length}/2000</span>
            </div>
            <textarea
              required
              rows="3"
              maxLength={2000}
              placeholder="Jelaskan detail kendala..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0256B3]"
            />
          </div>

          {/* INPUT LAMPIRAN FOTO / BUKTI */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Lampiran Foto / Bukti (Opsional)</label>
            <div className="flex items-center gap-3 p-3 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
              <Paperclip className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAttachment(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0256B3] file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#0256B3] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Mengirim...' : 'Kirim Tiket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;