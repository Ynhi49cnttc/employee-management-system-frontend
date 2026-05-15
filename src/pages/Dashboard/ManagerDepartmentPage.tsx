import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/axios';
import type { Employee } from '@/types';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';

type EmployeeRecord = Employee & Record<string, any>;

const DEPARTMENT_LABELS: Record<string, string> = {
  P01: 'Phòng Kỹ thuật / IT',
  P02: 'Phòng Nhân sự',
  P03: 'Phòng Hành chính',
  P04: 'Phòng Kinh doanh',
  P05: 'Phòng Tài chính',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Đang làm việc',
  INACTIVE: 'Đã nghỉ việc',
};

const EMPLOYEE_TYPE_LABELS: Record<string, string> = {
  FULLTIME: 'Toàn thời gian',
  PARTTIME: 'Bán thời gian',
  INTERN: 'Thực tập',
};

const getValue = (
  obj: any,
  keys: string[],
  fallback: any = ''
) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }
  return fallback;
};

function getDepartmentName(emp?: EmployeeRecord | null) {
  const explicitName = getValue(emp, ['phongBanTen', 'TenPhongBan'], '');
  if (explicitName) return String(explicitName);
  const id = String(getValue(emp, ['MaPhong', 'phongBanId', 'maPhong', 'maPB'], ''));
  return DEPARTMENT_LABELS[id] || id || 'Chưa cập nhật';
}

function formatDate(value: unknown) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return date.toLocaleDateString('vi-VN');
}

function formatMoney(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return 'Chưa cập nhật';
  return `${numberValue.toLocaleString('vi-VN')} đ`;
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function ManagerDepartmentPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeRecord | null>(null);

  const itemsPerPage = 7;

  useEffect(() => {
    const fetchDepartmentEmployees = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/manager/department');
        const payload = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setEmployees(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error('Lỗi tải danh sách nhân viên phòng ban:', err);
        setError('Không thể tải danh sách nhân viên phòng ban. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentEmployees();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return employees;

    return employees.filter((emp) => {
      const fullName = String(getValue(emp, ['HoTen', 'hoTen'], '')).toLowerCase();
      const employeeId = String(getValue(emp, ['MaNV', 'maNV'], '')).toLowerCase();
      const email = String(getValue(emp, ['Email', 'email'], '')).toLowerCase();
      const phone = String(getValue(emp, ['SoDienThoai', 'soDienThoai'], '')).toLowerCase();
      return [fullName, employeeId, email, phone].some((field) => field.includes(keyword));
    });
  }, [employees, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const totalSalary = employees.reduce((sum, emp) => {
    const salary = Number(getValue(emp, ['Luong', 'luongCoBan', 'tongLuong'], 0));
    return sum + (Number.isFinite(salary) ? salary : 0);
  }, 0);

  const activeCount = employees.filter((emp) => String(getValue(emp, ['trangThai', 'TrangThai'], 'ACTIVE')) === 'ACTIVE').length;
  const departmentName = employees.length > 0 ? getDepartmentName(employees[0]) : 'Chưa cập nhật';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="relative space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Manager Workspace</p>
        <h2 className="text-3xl font-black tracking-tight text-slate-950">Quản lý phòng ban</h2>
        <p className="max-w-3xl text-sm text-slate-500">
          Theo dõi hồ sơ, thông tin liên hệ và mức lương của nhân viên thuộc phòng ban mình quản lý.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Tổng nhân sự"
          value={employees.length.toString()}
          description="Nhân viên trong phòng ban"
          icon={<Users size={22} />}
          tone="blue"
        />
        <StatCard
          title="Đang làm việc"
          value={activeCount.toString()}
          description="Hồ sơ còn hiệu lực"
          icon={<ShieldCheck size={22} />}
          tone="emerald"
        />
        <StatCard
          title="Quỹ lương"
          value={totalSalary > 0 ? formatMoney(totalSalary) : 'Chưa có dữ liệu'}
          description={departmentName}
          icon={<Wallet size={22} />}
          tone="slate"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Danh sách nhân viên</h3>
            <p className="text-sm text-slate-500">
              Hiển thị {currentItems.length} / {filteredData.length} nhân viên phù hợp.
            </p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên, email hoặc số điện thoại..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-5 py-4">Nhân viên</th>
                  <th className="px-5 py-4">Liên hệ</th>
                  <th className="px-5 py-4">Chức vụ</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Lương</th>
                  <th className="px-5 py-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentItems.map((emp) => {
                  const employeeId = String(getValue(emp, ['MaNV', 'maNV']));
                  const fullName = String(getValue(emp, ['HoTen', 'hoTen']));
                  const email = String(getValue(emp, ['Email', 'email']));
                  const phone = String(getValue(emp, ['SoDienThoai', 'soDienThoai']));
                  const position = String(getValue(emp, ['ChucVu', 'chucVuTen', 'TenChucVu'], 'Nhân viên'));
                  const status = String(getValue(emp, ['trangThai', 'TrangThai'], 'ACTIVE'));
                  const salary = getValue(emp, ['Luong', 'luongCoBan', 'tongLuong'], null);

                  return (
                    <tr key={employeeId} className="transition hover:bg-blue-50/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-base font-black text-white shadow-sm">
                            {getInitial(fullName)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{fullName}</p>
                            <p className="text-xs font-bold text-blue-600">{employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-slate-600">
                            <Mail size={14} className="text-slate-400" />
                            {email}
                          </p>
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone size={13} className="text-slate-400" />
                            {phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{position}</p>
                        <p className="text-xs text-slate-500">{getDepartmentName(emp)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-600">
                        {formatMoney(salary)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedEmp(emp)}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                        >
                          <Eye size={15} />
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <Users className="mb-3 h-12 w-12 text-slate-300" />
              <p className="font-black text-slate-800">Không tìm thấy nhân viên phù hợp</p>
              <p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa tìm kiếm.</p>
            </div>
          )}
        </div>

        {filteredData.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-black text-slate-800">{startIndex + 1}</span> -{' '}
              <span className="font-black text-slate-800">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> trên{' '}
              <span className="font-black text-slate-800">{filteredData.length}</span> nhân viên
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedEmp && <EmployeeDetailModal employee={selectedEmp} onClose={() => setSelectedEmp(null)} />}
    </div>
  );
}

function StatCard({ title, value, description, icon, tone }: { title: string; value: string; description: string; icon: React.ReactNode; tone: 'blue' | 'emerald' | 'slate' }) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  }[tone];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${toneClass}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</p>
          <p className="truncate text-2xl font-black text-slate-950">{value}</p>
          <p className="truncate text-xs font-medium text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'ACTIVE' || status === 'true';
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
      }`}
    >
      {STATUS_LABELS[status] || (isActive ? 'Đang làm việc' : 'Đã nghỉ việc')}
    </span>
  );
}

function EmployeeDetailModal({ employee, onClose }: { employee: EmployeeRecord; onClose: () => void }) {
  const fullName = String(getValue(employee, ['HoTen', 'hoTen']));
  const employeeId = String(getValue(employee, ['MaNV', 'maNV']));
  const position = String(getValue(employee, ['ChucVu', 'chucVuTen', 'TenChucVu'], 'Nhân viên'));
  const salary = getValue(employee, ['Luong', 'luongCoBan', 'tongLuong'], null);
  const employeeType = String(getValue(employee, ['loaiNhanVien', 'LoaiNhanVien'], 'Chưa cập nhật'));
  const status = String(getValue(employee, ['trangThai', 'TrangThai'], 'ACTIVE'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="relative bg-slate-950 px-8 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-blue-600 text-4xl font-black shadow-xl">
              {getInitial(fullName)}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">{employeeId}</p>
              <h3 className="mt-1 text-3xl font-black tracking-tight">{fullName}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-300">
                <Briefcase size={16} />
                {position} • {getDepartmentName(employee)}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailItem label="Email" value={getValue(employee, ['Email', 'email'])} icon={<Mail size={16} />} />
            <DetailItem label="Số điện thoại" value={getValue(employee, ['SoDienThoai', 'soDienThoai'])} icon={<Phone size={16} />} />
            <DetailItem label="Ngày sinh" value={formatDate(getValue(employee, ['NgaySinh', 'ngaySinh'], ''))} icon={<Calendar size={16} />} />
            <DetailItem label="Giới tính" value={getValue(employee, ['GioiTinh', 'gioiTinh'])} icon={<User size={16} />} />
            <DetailItem label="Địa chỉ" value={getValue(employee, ['DiaChi', 'diaChi'])} icon={<MapPin size={16} />} full />
            <DetailItem label="Mã số thuế" value={getValue(employee, ['MaSoThue', 'maSoThue'])} icon={<CreditCard size={16} />} />
            <DetailItem label="CCCD" value={getValue(employee, ['CCCD', 'cccd'])} icon={<CreditCard size={16} />} />
            <DetailItem label="Ngày vào làm" value={formatDate(getValue(employee, ['ngayVaoLam', 'NgayVaoLam'], ''))} icon={<Calendar size={16} />} />
            <DetailItem label="Loại nhân viên" value={EMPLOYEE_TYPE_LABELS[employeeType] || employeeType} icon={<Briefcase size={16} />} />
            <DetailItem label="Trạng thái" value={STATUS_LABELS[status] || status} icon={<ShieldCheck size={16} />} />
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Mức lương nhân viên</p>
            <p className="mt-1 text-3xl font-black text-emerald-700">{formatMoney(salary)}</p>
            <p className="mt-2 text-sm font-medium text-emerald-700/80">
              Chỉ quản lý phòng ban được xem thông tin lương của nhân viên trong phòng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon, full = false }: { label: string; value: React.ReactNode; icon: React.ReactNode; full?: boolean }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50 p-4 ${full ? 'md:col-span-2' : ''}`}>
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className="flex items-start gap-2 font-bold text-slate-800">
        <span className="mt-0.5 text-slate-400">{icon}</span>
        <span>{value || 'Chưa cập nhật'}</span>
      </div>
    </div>
  );
}
