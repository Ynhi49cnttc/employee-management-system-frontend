import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthContext';
import {
  Calculator,
  CreditCard,
  Eye,
  Filter,
  Search,
  ShieldCheck,
  User,
  Wallet,
  X,
  Building2,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';

type Employee = Record<string, any>;

const getValue = (obj: any, keys: string[], fallback: any = '') => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') {
      return obj[key];
    }
  }

  return fallback;
};

const formatMoney = (value: any) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) return 'Chưa cập nhật';

  return `${amount.toLocaleString('vi-VN')} đ`;
};

const getInitials = (name?: string) => {
  if (!name) return '?';

  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export default function SalaryPage() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mySalary, setMySalary] = useState<Employee | null>(null);
  const [selectedSalary, setSelectedSalary] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const isFinance = user?.MaVaiTro === 'FIN' || user?.MaVaiTro === 'HRM';

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        setLoading(true);

        if (isFinance) {
          const response = await api.get('/finance/salary');
          setEmployees(Array.isArray(response.data) ? response.data : []);
        } else {
          const response = await api.get('/employee/profile');
          setMySalary(Array.isArray(response.data) ? response.data[0] : response.data);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu lương:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryData();
  }, [isFinance]);

  const filteredEmployees = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return employees.filter((employee) => {
      const name = String(getValue(employee, ['HoTen', 'hoTen'], '')).toLowerCase();
      const id = String(getValue(employee, ['MaNV', 'maNV'], '')).toLowerCase();
      const tax = String(getValue(employee, ['MaSoThue', 'maSoThue'], '')).toLowerCase();

      return name.includes(search) || id.includes(search) || tax.includes(search);
    });
  }, [employees, searchTerm]);

  const totalSalary = employees.reduce((sum, employee) => {
    const salary = Number(getValue(employee, ['Luong', 'luongCoBan', 'tongLuong'], 0));
    return sum + (Number.isFinite(salary) ? salary : 0);
  }, 0);

  const averageSalary = employees.length > 0 ? totalSalary / employees.length : 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (!isFinance) {
    const name = getValue(mySalary, ['HoTen', 'hoTen'], user?.HoTen || 'Nhân viên');
    const maNV = getValue(mySalary, ['MaNV', 'maNV'], user?.MaNV || '---');
    const salary = getValue(mySalary, ['Luong', 'luongCoBan', 'tongLuong'], 0);
    const taxCode = getValue(mySalary, ['MaSoThue', 'maSoThue'], 'Chưa cập nhật');
    const department = getValue(mySalary, ['TenPhongBan', 'phongBanTen', 'MaPhong'], 'Chưa cập nhật');

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Phiếu lương cá nhân</h2>
          <p className="mt-1 text-sm text-slate-500">Theo dõi thông tin lương và mã số thuế của bạn</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-8 py-8 text-white">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-2xl font-black shadow-xl">
                  {getInitials(name)}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-300">Nhân viên</p>
                  <h3 className="mt-1 text-2xl font-black">{name}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-300">{maNV} • {department}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Lương hiện tại</p>
                <p className="mt-2 text-4xl font-black text-emerald-700">{formatMoney(salary)}</p>
                <p className="mt-2 text-sm font-semibold text-emerald-700">Dữ liệu được lấy theo quyền truy cập hiện có.</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard label="Mã nhân viên" value={maNV} icon={<BadgeCheck size={16} />} />
                <InfoCard label="Mã số thuế" value={taxCode} icon={<CreditCard size={16} />} />
                <InfoCard label="Phòng ban" value={department} icon={<Building2 size={16} />} />
                <InfoCard label="Quyền xem" value="Lương cá nhân" icon={<ShieldCheck size={16} />} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
              <Calculator className="mb-5 h-10 w-10 text-blue-300" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Ghi chú</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
                Nhân viên chỉ xem được thông tin lương của chính mình. Các thông tin chi tiết khác phụ thuộc vào backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Bảng tính lương công ty</h2>
          <p className="mt-1 text-sm text-slate-500">Quản lý thông tin lương, mã số thuế và tổng quỹ lương</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Tổng nhân sự" value={employees.length} icon={<User size={20} />} tone="blue" />
        <StatCard label="Tổng quỹ lương" value={formatMoney(totalSalary)} icon={<Wallet size={20} />} tone="emerald" />
        <StatCard label="Lương trung bình" value={formatMoney(averageSalary)} icon={<TrendingUp size={20} />} tone="amber" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã nhân viên, họ tên, mã số thuế..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            <Filter size={16} />
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Nhân viên</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Mã số thuế</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Lương</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">Chi tiết</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map((employee) => {
              const name = getValue(employee, ['HoTen', 'hoTen'], 'Chưa cập nhật');
              const maNV = getValue(employee, ['MaNV', 'maNV'], '---');
              const tax = getValue(employee, ['MaSoThue', 'maSoThue'], '---');
              const salary = getValue(employee, ['Luong', 'luongCoBan', 'tongLuong'], 0);

              return (
                <tr key={maNV} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 font-black text-emerald-700">
                        {getInitials(name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{name}</p>
                        <p className="text-xs font-bold text-blue-600">{maNV}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                      <CreditCard size={14} />
                      {tax}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-base font-black text-emerald-700">{formatMoney(salary)}</td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedSalary(employee)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="p-10 text-center text-sm font-semibold text-slate-400">Không tìm thấy dữ liệu lương phù hợp.</div>
        )}
      </div>

      {selectedSalary && <SalaryDetailModal employee={selectedSalary} onClose={() => setSelectedSalary(null)} />}
    </div>
  );
}

function SalaryDetailModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const name = getValue(employee, ['HoTen', 'hoTen'], 'Chưa cập nhật');
  const maNV = getValue(employee, ['MaNV', 'maNV'], '---');
  const salary = getValue(employee, ['Luong', 'luongCoBan', 'tongLuong'], 0);
  const tax = getValue(employee, ['MaSoThue', 'maSoThue'], 'Chưa cập nhật');
  const department = getValue(employee, ['TenPhongBan', 'phongBanTen', 'MaPhong'], 'Chưa cập nhật');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="relative bg-emerald-600 px-8 py-8 text-white">
          <button onClick={onClose} className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white">
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-2xl font-black shadow-xl">
              {getInitials(name)}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-100">Chi tiết lương</p>
              <h3 className="mt-1 text-2xl font-black">{name}</h3>
              <p className="mt-1 text-sm font-semibold text-emerald-100">{maNV} • {department}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <InfoCard label="Lương" value={formatMoney(salary)} icon={<Wallet size={16} />} />
          <InfoCard label="Mã số thuế" value={tax} icon={<CreditCard size={16} />} />
          <InfoCard label="Phòng ban" value={department} icon={<Building2 size={16} />} />
          <InfoCard label="Quyền truy cập" value="Finance / HRM" icon={<ShieldCheck size={16} />} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: any; icon: React.ReactNode; tone: 'blue' | 'emerald' | 'amber' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>{icon}</div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <p className="break-words text-sm font-bold text-slate-800">{value || 'Chưa cập nhật'}</p>
    </div>
  );
}
