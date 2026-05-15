import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/axios';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  CreditCard,
  Hash,
  Building2,
  Wallet,
  Lock,
  CheckCircle2,
  X
} from 'lucide-react';

type AnyEmployee = Record<string, any>;

const DEPARTMENT_NAMES: Record<string, string> = {
  P01: 'Phòng Kỹ thuật / IT',
  P02: 'Phòng Nhân sự',
  P03: 'Phòng Hành chính',
  P04: 'Phòng Kinh doanh',
  P05: 'Phòng Tài chính',
};

const ROLE_LABELS: Record<string, string> = {
  EMP: 'Nhân viên',
  MAN: 'Quản lý',
  FIN: 'Tài chính',
  HR: 'Nhân sự',
  HRM: 'Trưởng phòng nhân sự',
};

const GENDER_LABELS: Record<string, string> = {
  NAM: 'Nam',
  NU: 'Nữ',
  KHAC: 'Khác',
  Nam: 'Nam',
  Nữ: 'Nữ',
  Khác: 'Khác',
};

const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Đang làm việc',
  INACTIVE: 'Đã nghỉ việc',
};

function pick<T = any>(obj: AnyEmployee | null, keys: string[], fallback: T): T {
  if (!obj) return fallback;
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== '') return value as T;
  }
  return fallback;
}

function formatDate(value?: string | null) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return date.toLocaleDateString('vi-VN');
}

function formatMoney(value?: number | null) {
  if (value === undefined || value === null) return 'Chưa cập nhật';
  return `${Number(value).toLocaleString('vi-VN')} đ`;
}

function getInitials(name: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export default function ProfilePage() {
  const [data, setData] = useState<AnyEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { logout } = useAuth(); 
  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPass !== passwordData.confirmPass) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    try {
    // 1. Gọi API đổi mật khẩu
    await api.post('/auth/change-password', {
      MatKhauCu: passwordData.oldPass,
      MatKhauMoi: passwordData.newPass
    });

    alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.");

    setIsPasswordModalOpen(false);

    logout(); 
    navigate('/login');

  } catch (err: any) {
    alert(err.response?.data?.message || "Lỗi khi đổi mật khẩu");
  }
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/employee/profile');
        setData(Array.isArray(res.data) ? res.data[0] : res.data);
      } catch (err) {
        console.error('Lỗi tải hồ sơ:', err);
        setError('Không thể tải hồ sơ nhân viên');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const employee = useMemo(() => {
    const maNV = pick<string>(data, ['maNV', 'MaNV'], '---');
    const hoTen = pick<string>(data, ['hoTen', 'HoTen'], 'Chưa cập nhật');
    const maPhong = pick<string>(data, ['phongBanId', 'MaPhong', 'maPhong'], '');
    const phongBanTen = pick<string>(data, ['phongBanTen', 'TenPhongBan'], DEPARTMENT_NAMES[maPhong] || maPhong || 'Chưa cập nhật');
    const chucVuTen = pick<string>(data, ['chucVuTen', 'ChucVu', 'TenChucVu'], 'Nhân viên');
    const role = pick<string>(data, ['role', 'MaVaiTro', 'maVaiTro'], 'EMP');
    const trangThai = pick<string>(data, ['trangThai', 'TrangThaiNhanVien'], 'ACTIVE');
    const isLocked = pick<boolean>(data, ['isLocked', 'IsLocked'], false);
    const avatarUrl = pick<string>(data, ['avatarUrl', 'AvatarUrl'], '');

    return {
      maNV,
      hoTen,
      email: pick<string>(data, ['email', 'Email'], 'Chưa cập nhật'),
      soDienThoai: pick<string>(data, ['soDienThoai', 'SoDienThoai', 'SDT'], 'Chưa cập nhật'),
      gioiTinh: GENDER_LABELS[pick<string>(data, ['gioiTinh', 'GioiTinh'], '')] || 'Chưa cập nhật',
      ngaySinh: pick<string>(data, ['ngaySinh', 'NgaySinh'], ''),
      diaChi: pick<string>(data, ['diaChi', 'DiaChi'], 'Chưa cập nhật'),
      avatarUrl,
      cccd: pick<string>(data, ['cccd', 'CCCD', 'CanCuocCongDan'], 'Chưa cập nhật'),
      maSoThue: pick<string>(data, ['maSoThue', 'MaSoThue'], 'Chưa cập nhật'),
      phongBanTen,
      chucVuTen,
      role,
      roleLabel: ROLE_LABELS[role] || role,
      managerName: pick<string>(data, ['managerName', 'TenQuanLy'], 'Chưa cập nhật'),
      ngayVaoLam: pick<string>(data, ['ngayVaoLam', 'NgayVaoLam'], ''),
      loaiNhanVien: pick<string>(data, ['loaiNhanVien', 'LoaiNhanVien'], 'Chưa cập nhật'),
      trangThai,
      trangThaiLabel: EMPLOYEE_STATUS_LABELS[trangThai] || 'Đang làm việc',
      isLocked,
      luongCoBan: pick<number | null>(data, ['luongCoBan', 'Luong'], null),
      lastLogin: pick<string>(data, ['lastLogin', 'LastLogin'], ''),
      createdAt: pick<string>(data, ['createdAt', 'CreatedAt'], ''),
      updatedAt: pick<string>(data, ['updatedAt', 'UpdatedAt'], ''),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-3xl bg-slate-200 lg:col-span-2" />
          <div className="h-80 rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
        <p className="font-bold text-red-700">{error || 'Không có dữ liệu hồ sơ'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-900 p-6 text-white md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {employee.avatarUrl ? (
                <img
                  src={employee.avatarUrl}
                  alt={employee.hoTen}
                  className="h-24 w-24 rounded-3xl border-4 border-white/10 object-cover shadow-xl"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white/10 bg-blue-600 text-3xl font-black text-white shadow-xl">
                  {getInitials(employee.hoTen)}
                </div>
              )}

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">
                    {employee.maNV}
                  </span>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-100">
                    {employee.roleLabel}
                  </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{employee.hoTen}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-300">
                  <Briefcase size={16} />
                  {employee.chucVuTen}
                  <span className="text-slate-500">•</span>
                  <Building2 size={16} />
                  {employee.phongBanTen}
                </p>
              </div>
            </div>



            <div className="flex flex-wrap gap-2 md:justify-end">
              <StatusBadge active={employee.trangThai === 'ACTIVE'} label={employee.trangThaiLabel} />
              <StatusBadge active={!employee.isLocked} label={employee.isLocked ? 'Tài khoản đã khóa' : 'Tài khoản bình thường'} account />

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition"
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <SectionHeader icon={<User size={20} />} title="Thông tin cá nhân" description="Thông tin định danh và liên hệ của nhân viên" />
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <InfoBox label="Mã nhân viên" value={employee.maNV} icon={<Hash size={15} />} />
            <InfoBox label="Giới tính" value={employee.gioiTinh} icon={<User size={15} />} />
            <InfoBox label="Ngày sinh" value={formatDate(employee.ngaySinh)} icon={<Calendar size={15} />} />
            <InfoBox label="Số CCCD" value={employee.cccd} icon={<CreditCard size={15} />} />
            <InfoBox label="Email" value={employee.email} icon={<Mail size={15} />} />
            <InfoBox label="Số điện thoại" value={employee.soDienThoai} icon={<Phone size={15} />} />
            <InfoBox label="Địa chỉ" value={employee.diaChi} icon={<MapPin size={15} />} fullWidth />
            <InfoBox label="Mã số thuế" value={employee.maSoThue} icon={<CreditCard size={15} />} />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader icon={<Shield size={20} />} title="Công việc & tài khoản" description="Vai trò, phòng ban và trạng thái hệ thống" />
          <div className="space-y-4 p-6">
            <InfoBox label="Phòng ban" value={employee.phongBanTen} icon={<Building2 size={15} />} />
            <InfoBox label="Chức vụ" value={employee.chucVuTen} icon={<Briefcase size={15} />} />
            <InfoBox label="Quản lý trực tiếp" value={employee.managerName} icon={<User size={15} />} />
            <InfoBox label="Ngày vào làm" value={formatDate(employee.ngayVaoLam)} icon={<Calendar size={15} />} />
            <InfoBox label="Loại nhân viên" value={employee.loaiNhanVien} icon={<Briefcase size={15} />} />
            <InfoBox label="Vai trò hệ thống" value={employee.roleLabel} icon={<Shield size={15} />} />
            <InfoBox label="Đăng nhập gần nhất" value={formatDate(employee.lastLogin)} icon={<Lock size={15} />} />
          </div>
        </section>
      </div>

      {employee.luongCoBan !== null && (
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-600 p-3 text-white">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Lương</p>
                <p className="mt-1 text-3xl font-black text-emerald-900">{formatMoney(employee.luongCoBan)}</p>
              </div>
            </div>
            <p className="max-w-md text-sm font-medium text-emerald-700">
              Thông tin lương chỉ hiển thị với các vai trò được cấp quyền theo cơ chế phân quyền của hệ thống.
            </p>
          </div>
        </section>
      )}
      {/* MODAL ĐỔI MẬT KHẨU */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Đổi mật khẩu</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mật khẩu cũ</label>
                <input
                  type="password" required
                  className="w-full mt-1.5 p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  onChange={e => setPasswordData({ ...passwordData, oldPass: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mật khẩu mới</label>
                <input
                  type="password" required
                  className="w-full mt-1.5 p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  onChange={e => setPasswordData({ ...passwordData, newPass: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                <input
                  type="password" required
                  className="w-full mt-1.5 p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  onChange={e => setPasswordData({ ...passwordData, confirmPass: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-2.5 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition">Hủy</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm ring-1 ring-slate-200">{icon}</div>
        <div>
          <h2 className="text-base font-black text-slate-900">{title}</h2>
          <p className="text-xs font-medium text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon, fullWidth = false }: { label: string; value: any; icon: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50/70 p-4 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
        {icon}
        {label}
      </div>
      <p className="break-words text-sm font-bold text-slate-900">{value || 'Chưa cập nhật'}</p>
    </div>
  );
}

function StatusBadge({ active, label, account = false }: { active: boolean; label: string; account?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black shadow-sm ${active
          ? account
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
          : 'bg-red-50 text-red-700 ring-1 ring-red-100'
        }`}
    >
      {active ? <CheckCircle2 size={15} /> : <Lock size={15} />}
      {label}
    </span>
  );
}
