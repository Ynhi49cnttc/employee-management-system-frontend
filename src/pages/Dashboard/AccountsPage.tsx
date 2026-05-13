import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/axios';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Lock,
  Unlock,
  RefreshCcw,
  X,
  KeyRound,
  User,
  Building2,
  BadgeCheck,
  History,
  AlertTriangle,
  Crown,
} from 'lucide-react';

type Account = Record<string, any>;

const ROLES = [
  { value: 'EMP', label: 'Nhân viên' },
  { value: 'MAN', label: 'Quản lý' },
  { value: 'FIN', label: 'Tài chính' },
  { value: 'HR', label: 'Nhân sự' },
  { value: 'HRM', label: 'Trưởng phòng nhân sự' },
];

const getValue = (obj: any, keys: string[], fallback: any = '') => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') {
      return obj[key];
    }
  }

  return fallback;
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

const getRoleLabel = (role: string) => {
  return ROLES.find((item) => item.value === role)?.label || role || 'Chưa phân quyền';
};

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    EMP: 'bg-blue-50 text-blue-700 ring-blue-100',
    MAN: 'bg-purple-50 text-purple-700 ring-purple-100',
    FIN: 'bg-amber-50 text-amber-700 ring-amber-100',
    HR: 'bg-orange-50 text-orange-700 ring-orange-100',
    HRM: 'bg-red-50 text-red-700 ring-red-100',
  };

  return classes[role] || 'bg-slate-50 text-slate-700 ring-slate-100';
};

const getAccountStatus = (account: Account) => {
  const rawStatus = getValue(account, ['TrangThai', 'trangThai', 'isActive'], true);
  const rawLocked = getValue(account, ['IsLocked', 'isLocked', 'KhoaTaiKhoan'], undefined);

  if (typeof rawLocked === 'boolean') {
    return {
      isActive: !rawLocked,
      isLocked: rawLocked,
      label: rawLocked ? 'Đã khóa' : 'Hoạt động',
    };
  }

  if (typeof rawStatus === 'boolean') {
    return {
      isActive: rawStatus,
      isLocked: !rawStatus,
      label: rawStatus ? 'Hoạt động' : 'Đã khóa',
    };
  }

  const normalized = String(rawStatus).toUpperCase();
  const locked = normalized === 'LOCKED' || normalized === 'INACTIVE' || normalized === 'FALSE';

  return {
    isActive: !locked,
    isLocked: locked,
    label: locked ? 'Đã khóa' : 'Hoạt động',
  };
};

const formatDateTime = (value: any) => {
  if (!value) return 'Chưa có dữ liệu';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Chưa có dữ liệu';

  return date.toLocaleString('vi-VN');
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [roleModalAccount, setRoleModalAccount] = useState<Account | null>(null);
  const [selectedRole, setSelectedRole] = useState('EMP');
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/accounts');
      setAccounts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Lỗi tải danh sách tài khoản:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return accounts.filter((account) => {
      const username = String(getValue(account, ['TenDangNhap', 'username'], '')).toLowerCase();
      const name = String(getValue(account, ['HoTen', 'employeeName', 'hoTen'], '')).toLowerCase();
      const maNV = String(getValue(account, ['MaNV', 'employeeId', 'maNV'], '')).toLowerCase();
      const role = String(getValue(account, ['MaVaiTro', 'role'], '')).toLowerCase();

      return username.includes(search) || name.includes(search) || maNV.includes(search) || role.includes(search);
    });
  }, [accounts, searchTerm]);

  const activeCount = accounts.filter((account) => getAccountStatus(account).isActive).length;
  const lockedCount = accounts.length - activeCount;
  const privilegedCount = accounts.filter((account) => {
    const role = getValue(account, ['MaVaiTro', 'role'], 'EMP');
    return role !== 'EMP';
  }).length;

  const handleToggleStatus = async (account: Account) => {
    const username = getValue(account, ['TenDangNhap', 'username'], '');
    const status = getAccountStatus(account);

    const confirmMessage = status.isActive
      ? `Khóa tài khoản ${username}? Người dùng sẽ không thể đăng nhập.`
      : `Mở khóa tài khoản ${username}? Người dùng có thể đăng nhập lại.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setSubmitting(true);

      await api.put('/hr/accounts/status', {
        tenDangNhap: username,
        trangThai: !status.isActive,
      });

      await fetchAccounts();
    } catch (error) {
      console.error(error);
      alert('Không thể cập nhật trạng thái tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const openRoleModal = (account: Account) => {
    const currentRole = getValue(account, ['MaVaiTro', 'role'], 'EMP');
    setSelectedRole(currentRole);
    setRoleModalAccount(account);
  };

  const handleChangeRole = async () => {
    if (!roleModalAccount) return;

    const username = getValue(roleModalAccount, ['TenDangNhap', 'username'], '');

    try {
      setSubmitting(true);

      await api.put('/hr/accounts/role', {
        tenDangNhap: username,
        maVaiTro: selectedRole,
      });

      setRoleModalAccount(null);
      await fetchAccounts();
    } catch (error) {
      console.error(error);
      alert('Không thể cập nhật vai trò');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokePermission = async (account: Account) => {
    const username = getValue(account, ['TenDangNhap', 'username'], '');
    const currentRole = getValue(account, ['MaVaiTro', 'role'], 'EMP');

    if (currentRole === 'EMP') {
      alert('Tài khoản này đã là quyền Nhân viên, không cần thu hồi thêm.');
      return;
    }

    if (!window.confirm(`Thu hồi quyền ${getRoleLabel(currentRole)} của tài khoản ${username} và đưa về quyền Nhân viên?`)) {
      return;
    }

    try {
      setSubmitting(true);

      await api.put('/hr/accounts/role', {
        tenDangNhap: username,
        maVaiTro: 'EMP',
      });

      await fetchAccounts();
    } catch (error) {
      console.error(error);
      alert('Không thể thu hồi quyền tài khoản');
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
          <h2 className="text-2xl font-black text-slate-900">Quản lý tài khoản hệ thống</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cấp quyền, thu hồi quyền và khóa/mở tài khoản đăng nhập cho nhân viên
          </p>
        </div>

        <button
          onClick={fetchAccounts}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCcw size={18} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Tổng tài khoản" value={accounts.length} icon={<UserCog size={20} />} tone="blue" />
        <StatCard label="Đang hoạt động" value={activeCount} icon={<ShieldCheck size={20} />} tone="emerald" />
        <StatCard label="Đã khóa" value={lockedCount} icon={<ShieldAlert size={20} />} tone="red" />
        <StatCard label="Có quyền quản trị" value={privilegedCount} icon={<Crown size={20} />} tone="amber" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên, tài khoản, mã nhân viên, vai trò..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Tài khoản</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Nhân viên</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Vai trò</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Trạng thái</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredAccounts.map((account) => {
              const username = getValue(account, ['TenDangNhap', 'username'], '---');
              const name = getValue(account, ['HoTen', 'employeeName', 'hoTen'], 'Chưa cập nhật');
              const maNV = getValue(account, ['MaNV', 'employeeId', 'maNV'], '---');
              const department = getValue(account, ['MaPhong', 'phongBanTen', 'TenPhongBan'], '---');
              const role = getValue(account, ['MaVaiTro', 'role'], 'EMP');
              const status = getAccountStatus(account);

              return (
                <tr key={username} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 font-black text-white shadow-sm">
                        <KeyRound size={19} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{username}</p>
                        <p className="text-xs font-semibold text-slate-400">Tên đăng nhập</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-blue-700">
                        {getInitials(name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{name}</p>
                        <p className="text-xs font-semibold text-slate-500">{maNV} • {department}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ring-1 ${getRoleBadgeClass(role)}`}>
                      {getRoleLabel(role)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {status.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                        <ShieldCheck size={14} />
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700 ring-1 ring-red-100">
                        <ShieldAlert size={14} />
                        Đã khóa
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedAccount(account)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                        title="Xem chi tiết"
                      >
                        <User size={18} />
                      </button>

                      <button
                        onClick={() => openRoleModal(account)}
                        className="rounded-xl border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                        title="Cấp/đổi quyền"
                      >
                        <UserCog size={18} />
                      </button>

                      <button
                        onClick={() => handleRevokePermission(account)}
                        className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100"
                        title="Thu hồi quyền"
                      >
                        <AlertTriangle size={18} />
                      </button>

                      <button
                        disabled={submitting}
                        onClick={() => handleToggleStatus(account)}
                        className={`rounded-xl border p-2 transition disabled:opacity-50 ${
                          status.isActive
                            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                        title={status.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {status.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAccounts.length === 0 && (
          <div className="p-10 text-center text-sm font-semibold text-slate-400">
            Không tìm thấy tài khoản phù hợp.
          </div>
        )}
      </div>

      {selectedAccount && (
        <AccountDetailModal account={selectedAccount} onClose={() => setSelectedAccount(null)} />
      )}

      {roleModalAccount && (
        <RoleModal
          account={roleModalAccount}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          onSubmit={handleChangeRole}
          onClose={() => setRoleModalAccount(null)}
          submitting={submitting}
        />
      )}
    </div>
  );
}

function AccountDetailModal({ account, onClose }: { account: Account; onClose: () => void }) {
  const username = getValue(account, ['TenDangNhap', 'username'], '---');
  const name = getValue(account, ['HoTen', 'employeeName', 'hoTen'], 'Chưa cập nhật');
  const maNV = getValue(account, ['MaNV', 'employeeId', 'maNV'], '---');
  const role = getValue(account, ['MaVaiTro', 'role'], 'EMP');
  const department = getValue(account, ['MaPhong', 'phongBanTen', 'TenPhongBan'], '---');
  const email = getValue(account, ['Email', 'email'], 'Chưa cập nhật');
  const lastLogin = getValue(account, ['LastLogin', 'lastLogin'], '');
  const createdAt = getValue(account, ['CreatedAt', 'createdAt'], '');
  const status = getAccountStatus(account);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="relative bg-slate-900 px-8 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-slate-700 bg-blue-600 text-3xl font-black shadow-xl">
              {getInitials(name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-blue-300">Hồ sơ tài khoản</p>
              <h3 className="mt-1 text-3xl font-black text-white">{name}</h3>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-300">
                <span>{username}</span>
                <span>•</span>
                <span>{maNV}</span>
                <span>•</span>
                <span>{department}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <span className="rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-black uppercase text-blue-100 ring-1 ring-blue-400/30">
                {getRoleLabel(role)}
              </span>
              <span className={`rounded-full px-4 py-1.5 text-xs font-black uppercase ring-1 ${status.isActive ? 'bg-emerald-500/20 text-emerald-100 ring-emerald-400/30' : 'bg-red-500/20 text-red-100 ring-red-400/30'}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <DetailItem label="Tên đăng nhập" value={username} icon={<KeyRound size={14} />} />
          <DetailItem label="Mã nhân viên" value={maNV} icon={<BadgeCheck size={14} />} />
          <DetailItem label="Họ tên" value={name} icon={<User size={14} />} />
          <DetailItem label="Email" value={email} icon={<User size={14} />} />
          <DetailItem label="Phòng ban" value={department} icon={<Building2 size={14} />} />
          <DetailItem label="Vai trò hiện tại" value={getRoleLabel(role)} icon={<UserCog size={14} />} />
          <DetailItem label="Trạng thái tài khoản" value={status.label} icon={status.isActive ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />} />
          <DetailItem label="Lần đăng nhập gần nhất" value={formatDateTime(lastLogin)} icon={<History size={14} />} />
          <DetailItem label="Ngày tạo tài khoản" value={formatDateTime(createdAt)} icon={<History size={14} />} />
        </div>
      </div>
    </div>
  );
}

function RoleModal({
  account,
  selectedRole,
  setSelectedRole,
  onSubmit,
  onClose,
  submitting,
}: {
  account: Account;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const username = getValue(account, ['TenDangNhap', 'username'], '---');
  const name = getValue(account, ['HoTen', 'employeeName', 'hoTen'], 'Chưa cập nhật');
  const currentRole = getValue(account, ['MaVaiTro', 'role'], 'EMP');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-7 py-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">Cấp phát quyền hệ thống</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">Đổi vai trò tài khoản</h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
            type="button"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5 p-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-lg font-black text-blue-700">
                {getInitials(name)}
              </div>
              <div>
                <p className="font-black text-slate-900">{name}</p>
                <p className="text-sm font-semibold text-slate-500">{username}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-black text-amber-800">Lưu ý phân quyền</p>
                <p className="mt-1 text-sm font-medium leading-6 text-amber-700">
                  Vai trò hiện tại là <b>{getRoleLabel(currentRole)}</b>. Khi đổi vai trò, người dùng sẽ có quyền truy cập menu và API tương ứng với vai trò mới.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Vai trò mới</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={onSubmit}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Lưu quyền mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: any; icon: React.ReactNode; tone: 'blue' | 'emerald' | 'red' | 'amber' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>{icon}</div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
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
