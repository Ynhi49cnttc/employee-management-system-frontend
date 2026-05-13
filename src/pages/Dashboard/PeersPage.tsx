import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/axios';
import { Employee } from '@/types';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';

const departments: Record<string, string> = {
  P01: 'Phòng Kỹ thuật / IT',
  P02: 'Phòng Nhân sự',
  P03: 'Phòng Hành chính',
  P04: 'Phòng Kinh doanh',
  P05: 'Phòng Tài chính',
};

const getField = (obj: any, keys: string[], fallback = 'Chưa cập nhật') => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
};

const getDepartmentName = (employee: any) => {
  const name = getField(employee, ['phongBanTen', 'TenPhongBan'], '');
  if (name) return name;

  const code = getField(employee, ['MaPhong', 'maPhong', 'phongBanId', 'maPB'], '');
  return code ? departments[code] || code : 'Chưa cập nhật';
};

const formatDate = (value: any) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return date.toLocaleDateString('vi-VN');
};

const getInitial = (name: string) => name?.trim()?.charAt(0)?.toUpperCase() || '?';

export default function PeersPage() {
  const [peers, setPeers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeer, setSelectedPeer] = useState<Employee | null>(null);

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/employee/peers');
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setPeers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Không thể tải danh sách nhân viên cùng phòng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchPeers();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return peers;

    return peers.filter((peer: any) => {
      const searchableText = [
        getField(peer, ['HoTen', 'hoTen'], ''),
        getField(peer, ['MaNV', 'maNV'], ''),
        getField(peer, ['Email', 'email'], ''),
        getField(peer, ['SoDienThoai', 'soDienThoai'], ''),
        getField(peer, ['MaPhong', 'maPhong', 'phongBanId'], ''),
        getDepartmentName(peer),
        getField(peer, ['ChucVu', 'chucVuTen', 'TenChucVu'], ''),
      ].join(' ').toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [peers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            <Users size={14} /> Danh bạ nội bộ
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Nhân viên cùng phòng</h2>
          <p className="mt-1 text-sm text-slate-500">
            Xem thông tin liên hệ cơ bản của đồng nghiệp trong cùng phòng ban. Thông tin lương được ẩn theo đúng phân quyền.
          </p>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NV, email, phòng ban..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={<Users size={22} />} label="Tổng đồng nghiệp" value={peers.length.toString()} tone="blue" />
        <StatCard icon={<Building2 size={22} />} label="Phòng ban" value={peers[0] ? getDepartmentName(peers[0]) : '---'} tone="slate" />
        <StatCard icon={<Search size={22} />} label="Kết quả tìm kiếm" value={filteredData.length.toString()} tone="emerald" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-black text-slate-900">Danh sách nhân viên</h3>
              <p className="text-xs font-medium text-slate-500">
                Hiển thị {currentItems.length} / {filteredData.length} nhân viên phù hợp
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
              Không hiển thị thông tin lương
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-slate-100 bg-white">
              <tr>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead className="text-right">Chi tiết</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.map((peer: any) => {
                const maNV = getField(peer, ['MaNV', 'maNV'], '---');
                const hoTen = getField(peer, ['HoTen', 'hoTen'], 'Chưa cập nhật');
                const email = getField(peer, ['Email', 'email'], 'Chưa cập nhật');
                const phone = getField(peer, ['SoDienThoai', 'soDienThoai'], 'Chưa cập nhật');
                const position = getField(peer, ['ChucVu', 'chucVuTen', 'TenChucVu'], 'Nhân viên');
                const departmentCode = getField(peer, ['MaPhong', 'maPhong', 'phongBanId'], '---');

                return (
                  <tr key={maNV} className="transition hover:bg-blue-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={hoTen} />
                        <div>
                          <p className="font-black text-slate-900">{hoTen}</p>
                          <p className="text-xs font-bold text-blue-600">Mã NV: {maNV}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-slate-700">
                        <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-bold">{getDepartmentName(peer)}</p>
                          <p className="text-xs font-medium text-slate-400">{departmentCode}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                        <Briefcase size={13} /> {position}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span className={email === 'Chưa cập nhật' ? 'italic text-slate-400' : 'font-medium'}>{email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span className={phone === 'Chưa cập nhật' ? 'italic text-slate-400' : 'font-medium'}>{phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPeer(peer)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                      >
                        <Eye size={14} /> Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
              <Users size={34} />
            </div>
            <h3 className="text-lg font-black text-slate-800">Không tìm thấy nhân sự phù hợp</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Thử nhập tên, mã nhân viên, email hoặc mã phòng ban khác.
            </p>
          </div>
        )}

        {filteredData.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-bold text-slate-700">{startIndex + 1}</span> -{' '}
              <span className="font-bold text-slate-700">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> trên{' '}
              <span className="font-bold text-slate-700">{filteredData.length}</span> nhân viên
            </p>
            <div className="flex items-center gap-2">
              <PaginationButton disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                <ChevronLeft size={16} />
              </PaginationButton>
              <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700">
                Trang {currentPage} / {totalPages}
              </span>
              <PaginationButton disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                <ChevronRight size={16} />
              </PaginationButton>
            </div>
          </div>
        )}
      </div>

      {selectedPeer && <PeerDetailModal peer={selectedPeer} onClose={() => setSelectedPeer(null)} />}
    </div>
  );
}

function PeerDetailModal({ peer, onClose }: { peer: Employee; onClose: () => void }) {
  const data = peer as any;
  const hoTen = getField(data, ['HoTen', 'hoTen'], 'Chưa cập nhật');
  const maNV = getField(data, ['MaNV', 'maNV'], '---');
  const chucVu = getField(data, ['ChucVu', 'chucVuTen', 'TenChucVu'], 'Nhân viên');
  const gioiTinh = getField(data, ['GioiTinh', 'gioiTinh'], 'Chưa cập nhật');
  const email = getField(data, ['Email', 'email'], 'Chưa cập nhật');
  const phone = getField(data, ['SoDienThoai', 'soDienThoai'], 'Chưa cập nhật');
  const diaChi = getField(data, ['DiaChi', 'diaChi'], 'Chưa cập nhật');
  const ngaySinh = getField(data, ['NgaySinh', 'ngaySinh'], undefined);
  const ngayVaoLam = getField(data, ['NgayVaoLam', 'ngayVaoLam'], undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="relative border-b border-slate-100 bg-slate-900 px-8 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white/10 bg-blue-600 text-4xl font-black text-white shadow-xl">
              {getInitial(hoTen)}
            </div>
            <div>
              <p className="mb-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">{maNV}</p>
              <h3 className="text-3xl font-black leading-tight">{hoTen}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-300">
                <Briefcase size={15} /> {chucVu} • {getDepartmentName(data)}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailItem icon={<User size={15} />} label="Mã nhân viên" value={maNV} />
            <DetailItem icon={<Building2 size={15} />} label="Phòng ban" value={getDepartmentName(data)} />
            <DetailItem icon={<Briefcase size={15} />} label="Chức vụ" value={chucVu} />
            <DetailItem icon={<User size={15} />} label="Giới tính" value={gioiTinh} />
            <DetailItem icon={<Calendar size={15} />} label="Ngày sinh" value={formatDate(ngaySinh)} />
            <DetailItem icon={<Calendar size={15} />} label="Ngày vào làm" value={formatDate(ngayVaoLam)} />
            <DetailItem icon={<Mail size={15} />} label="Email" value={email} />
            <DetailItem icon={<Phone size={15} />} label="Số điện thoại" value={phone} />
            <DetailItem icon={<MapPin size={15} />} label="Địa chỉ" value={diaChi} className="md:col-span-2" />
          </div>

          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-bold">Lưu ý phân quyền</p>
            <p className="mt-1 text-amber-700">
              Trang này chỉ hiển thị thông tin liên hệ và hồ sơ cơ bản của đồng nghiệp. Thông tin lương không được render ở vai trò nhân viên.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'blue' | 'slate' | 'emerald' }) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl border p-3 ${toneClass}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="truncate text-2xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-sm">
      {getInitial(name)}
    </div>
  );
}

function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 ${className}`}>{children}</th>;
}

function PaginationButton({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function DetailItem({ icon, label, value, className = '' }: { icon: React.ReactNode; label: string; value: React.ReactNode; className?: string }) {
  const isEmpty = value === 'Chưa cập nhật' || value === '---';

  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50 p-4 ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
        {icon} {label}
      </div>
      <p className={`text-sm font-bold ${isEmpty ? 'italic text-slate-400' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="h-9 w-72 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
      </div>
      <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200 lg:w-96" />
    </div>
  );
}
