import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { Building2, PlusCircle, Pencil, Search, X, User } from 'lucide-react';

interface Department {
  MaPhong: string;
  TenPhong: string;
  MaTruongPhong: string | null;
  TenTruongPhong: string | null;
}

export default function HRDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ MaPhong: '', TenPhong: '', MaTruongPhong: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/departments');
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Lỗi tải danh sách phòng ban:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.TenPhong?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.MaPhong?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.TenTruongPhong?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ MaPhong: '', TenPhong: '', MaTruongPhong: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setIsEditing(true);
    setFormData({ 
      MaPhong: dept.MaPhong, 
      TenPhong: dept.TenPhong, 
      MaTruongPhong: dept.MaTruongPhong || '' 
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isEditing) {
        await api.put(`/hr/departments/${formData.MaPhong}`, {
          TenPhong: formData.TenPhong,
          MaTruongPhong: formData.MaTruongPhong || null,
        });
      } else {
        await api.post('/hr/departments', {
          MaPhong: formData.MaPhong,
          TenPhong: formData.TenPhong,
        });
      }
      await fetchDepartments();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quản lý Phòng ban</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cơ cấu tổ chức và bổ nhiệm trưởng phòng
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <PlusCircle size={18} /> Thêm phòng ban
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã phòng, tên phòng hoặc tên quản lý..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Mã Phòng</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Tên Phòng Ban</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Trưởng Phòng</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDepartments.map((dept) => (
              <tr key={dept.MaPhong} className="transition hover:bg-slate-50/70">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-sm font-bold text-slate-700">
                    {dept.MaPhong}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{dept.TenPhong}</p>
                </td>
                <td className="px-6 py-4">
                  {dept.MaTruongPhong ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{dept.TenTruongPhong}</p>
                        <p className="text-xs font-semibold text-slate-500">{dept.MaTruongPhong}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                      Chưa bổ nhiệm
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {isEditing ? 'Cập nhật phòng ban' : 'Thêm phòng ban mới'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-slate-500">Mã phòng ban *</label>
                  <input
                    required
                    disabled={isEditing}
                    value={formData.MaPhong}
                    onChange={(e) => setFormData({ ...formData, MaPhong: e.target.value.toUpperCase() })}
                    placeholder="Ví dụ: P005"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-slate-500">Tên phòng ban *</label>
                  <input
                    required
                    value={formData.TenPhong}
                    onChange={(e) => setFormData({ ...formData, TenPhong: e.target.value })}
                    placeholder="Ví dụ: Phòng Marketing"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="mb-1 block text-xs font-black uppercase text-slate-500">Mã Trưởng phòng</label>
                    <input
                      value={formData.MaTruongPhong}
                      onChange={(e) => setFormData({ ...formData, MaTruongPhong: e.target.value.toUpperCase() })}
                      placeholder="Mã NV (VD: NV001) - Để trống nếu tháo nhiệm"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs font-semibold text-slate-400">Nhân sự phải thuộc phòng ban này mới được bổ nhiệm.</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}