import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Calculator,
  FileClock,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  User,
  Users,
  WalletCards,
} from 'lucide-react';

const ROLE_TABS: Record<string, string[]> = {
  EMP: ['profile', 'peers', 'salary'],
  MAN: ['profile', 'department', 'salary'],
  FIN: ['profile', 'peers', 'salary'],
  HR: ['profile', 'hr-management'],
  HRM: ['profile', 'hr-management', 'accounts', 'audit-logs', 'salary'],
};

const MENU_ITEMS = [
  { path: 'profile', label: 'Hồ sơ cá nhân', icon: User },
  { path: 'peers', label: 'Nhân sự cùng phòng', icon: Users },
  { path: 'department', label: 'Quản lý phòng ban', icon: LayoutDashboard },
  { path: 'salary', label: 'Bảng lương', icon: Calculator },
  { path: 'hr-management', label: 'Quản lý nhân sự', icon: WalletCards },
  { path: 'accounts', label: 'Quản lý tài khoản', icon: ShieldAlert },
  { path: 'audit-logs', label: 'Nhật ký hệ thống', icon: FileClock },
];

const ROLE_LABELS: Record<string, string> = {
  EMP: 'Nhân viên',
  MAN: 'Quản lý',
  FIN: 'Tài chính',
  HR: 'Nhân sự',
  HRM: 'Trưởng phòng nhân sự',
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const allowedTabs = ROLE_TABS[user.MaVaiTro] || [];
  const visibleMenus = MENU_ITEMS.filter((item) => allowedTabs.includes(item.path));
  const currentPath = location.pathname.split('/').pop() || 'profile';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 md:flex">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <div>
          <p className="text-xl font-black tracking-tight text-white">
            HR<span className="text-blue-500">PRO</span>
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Employee System</p>
        </div>
      </div>

      <div className="border-b border-slate-800 p-4">
        <div className="rounded-3xl bg-slate-900 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Đăng nhập với quyền</p>
          <p className="mt-1 font-black text-white">{ROLE_LABELS[user.MaVaiTro] || user.MaVaiTro}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{user.HoTen}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleMenus.map((menu) => {
          const Icon = menu.icon;
          const isActive = currentPath === menu.path;

          return (
            <Link
              key={menu.path}
              to={`/dashboard/${menu.path}`}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon size={19} />
              {menu.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={19} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}