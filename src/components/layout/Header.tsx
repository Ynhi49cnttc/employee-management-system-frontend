import { Bell, ShieldCheck, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  EMP: 'Nhân viên',
  MAN: 'Quản lý',
  FIN: 'Tài chính',
  HR: 'Nhân sự',
  HRM: 'Trưởng phòng nhân sự',
};

export function Header() {
  const { user } = useAuth();

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.MaVaiTro] || user.MaVaiTro;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm md:px-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-blue-600">Secure EMS</p>
        <h1 className="text-base font-black text-slate-900 md:text-lg">Hệ thống quản lý nhân sự</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 md:inline-flex">
          <Bell size={18} />
        </button>

        <div className="hidden items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700 md:flex">
          <ShieldCheck size={16} />
          <span className="text-xs font-black uppercase">{roleLabel}</span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-black leading-none text-slate-800">{user.HoTen}</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">{user.MaNV}</p>
          </div>
          <UserCircle className="h-9 w-9 rounded-full bg-blue-50 text-blue-600" />
        </div>
      </div>
    </header>
  );
}