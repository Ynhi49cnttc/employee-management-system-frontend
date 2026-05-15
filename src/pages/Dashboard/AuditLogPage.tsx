import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/axios';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Filter,
  History,
  LogIn,
  PlusCircle,
  Search,
  ShieldCheck,
  Trash2,
  User,
  X,
  Pencil,
} from 'lucide-react';

type AuditLog = Record<string, any>;

const getValue = (obj: any, keys: string[], fallback: any = '') => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') {
      return obj[key];
    }
  }

  return fallback;
};

const normalizeAction = (action: any) => String(action || '').toUpperCase();

const formatDateTime = (value: any) => {
  if (!value) return 'Chưa có dữ liệu';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Chưa có dữ liệu';

  return date.toLocaleString('vi-VN');
};

const getActionMeta = (action: any) => {
  const value = normalizeAction(action);

  if (value.includes('ADD') || value.includes('CREATE') || value.includes('INSERT') || value.includes('THÊM')) {
    return {
      label: 'Thêm mới',
      icon: <PlusCircle size={15} />,
      badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      dot: 'bg-emerald-500',
    };
  }

  if (value.includes('UPDATE') || value.includes('EDIT') || value.includes('SỬA') || value.includes('CAP_NHAT')) {
    return {
      label: 'Cập nhật',
      icon: <Pencil size={15} />,
      badge: 'bg-blue-50 text-blue-700 ring-blue-100',
      dot: 'bg-blue-500',
    };
  }

  if (value.includes('DELETE') || value.includes('REMOVE') || value.includes('XÓA') || value.includes('XOA')) {
    return {
      label: 'Xóa dữ liệu',
      icon: <Trash2 size={15} />,
      badge: 'bg-red-50 text-red-700 ring-red-100',
      dot: 'bg-red-500',
    };
  }

  if (value.includes('LOGIN') || value.includes('ĐĂNG NHẬP') || value.includes('DANG_NHAP')) {
    return {
      label: 'Đăng nhập',
      icon: <LogIn size={15} />,
      badge: 'bg-purple-50 text-purple-700 ring-purple-100',
      dot: 'bg-purple-500',
    };
  }

  if (value.includes('ROLE') || value.includes('QUYỀN') || value.includes('QUYEN')) {
    return {
      label: 'Phân quyền',
      icon: <ShieldCheck size={15} />,
      badge: 'bg-amber-50 text-amber-700 ring-amber-100',
      dot: 'bg-amber-500',
    };
  }

  return {
    label: value || 'Hoạt động',
    icon: <Activity size={15} />,
    badge: 'bg-slate-50 text-slate-700 ring-slate-100',
    dot: 'bg-slate-400',
  };
};

const getLogId = (log: AuditLog, index: number) => {
  return getValue(log, ['MaLog', 'id', 'LogId', 'logId'], index);
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/logs');
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Lỗi tải nhật ký hệ thống:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return logs.filter((log) => {
      const actor = String(getValue(log, ['TenDangNhap', 'actorName', 'NguoiThucHien', 'username'], '')).toLowerCase();
      const action = String(getValue(log, ['HanhDong', 'action', 'Action'], '')).toLowerCase();
      const content = String(getValue(log, ['NoiDung', 'description', 'ChiTiet', 'content'], '')).toLowerCase();
      const target = String(getValue(log, ['TargetName', 'TargetId', 'DoiTuongAnhHuong', 'targetName', 'targetId'], '')).toLowerCase();

      const matchSearch = actor.includes(search) || action.includes(search) || content.includes(search) || target.includes(search);

      if (actionFilter === 'ALL') return matchSearch;

      return matchSearch && normalizeAction(action).includes(actionFilter);
    });
  }, [logs, searchTerm, actionFilter]);

  const addCount = logs.filter((log) => {
    const action = normalizeAction(getValue(log, ['HanhDong', 'action', 'Action'], ''));
    return action.includes('ADD') || action.includes('CREATE') || action.includes('INSERT') || action.includes('THÊM');
  }).length;

  const updateCount = logs.filter((log) => {
    const action = normalizeAction(getValue(log, ['HanhDong', 'action', 'Action'], ''));
    return action.includes('UPDATE') || action.includes('EDIT') || action.includes('SỬA') || action.includes('CAP_NHAT');
  }).length;

  const deleteCount = logs.filter((log) => {
    const action = normalizeAction(getValue(log, ['HanhDong', 'action', 'Action'], ''));
    return action.includes('DELETE') || action.includes('REMOVE') || action.includes('XÓA') || action.includes('XOA');
  }).length;

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
          <h2 className="text-2xl font-black text-slate-900">Nhật ký hệ thống</h2>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi lịch sử thao tác, truy vết người thực hiện và đối tượng bị ảnh hưởng
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <History size={18} />
          Làm mới nhật ký
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Tổng nhật ký" value={logs.length} icon={<Database size={20} />} tone="blue" />
        <StatCard label="Thêm mới" value={addCount} icon={<PlusCircle size={20} />} tone="emerald" />
        <StatCard label="Cập nhật" value={updateCount} icon={<Pencil size={20} />} tone="amber" />
        <StatCard label="Xóa dữ liệu" value={deleteCount} icon={<Trash2 size={20} />} tone="red" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm người thực hiện, hành động, nội dung, đối tượng..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả hành động</option>
              <option value="ADD">Thêm mới</option>
              <option value="UPDATE">Cập nhật</option>
              <option value="DELETE">Xóa dữ liệu</option>
              <option value="LOGIN">Đăng nhập</option>
              <option value="ROLE">Phân quyền</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Thời gian</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Người thực hiện</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Hành động</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Nội dung</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">Chi tiết</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log, index) => {
              const action = getValue(log, ['HanhDong', 'action', 'Action'], 'Hoạt động');
              const meta = getActionMeta(action);
              const actor = getValue(log, ['TenDangNhap', 'actorName', 'NguoiThucHien', 'username'], 'Không xác định');
              const content = getValue(log, ['NoiDung', 'description', 'ChiTiet', 'content'], 'Không có mô tả');
              const time = getValue(log, ['ThoiGian', 'createdAt', 'CreatedAt', 'timestamp'], '');
              const target = getValue(log, ['TargetName', 'TargetId', 'DoiTuongAnhHuong', 'targetName', 'targetId'], '');

              return (
                <tr key={getLogId(log, index)} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <Clock size={15} className="text-slate-400" />
                      {formatDateTime(time)}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{actor}</p>
                        <p className="text-xs font-semibold text-slate-400">Người thực hiện</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase ring-1 ${meta.badge}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="line-clamp-2 max-w-xl text-sm font-medium leading-6 text-slate-700">
                      {content}
                    </p>
                    {target && (
                      <p className="mt-1 text-xs font-bold text-blue-600">Đối tượng: {target}</p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                      title="Xem chi tiết"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="p-10 text-center">
            <History className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm font-semibold text-slate-400">Không tìm thấy nhật ký phù hợp.</p>
          </div>
        )}
      </div>

      {selectedLog && (
        <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

function AuditDetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const action = getValue(log, ['HanhDong', 'action', 'Action'], 'Hoạt động');
  const meta = getActionMeta(action);
  const actor = getValue(log, ['TenDangNhap', 'actorName', 'NguoiThucHien', 'username'], 'Không xác định');
  const content = getValue(log, ['NoiDung', 'description', 'ChiTiet', 'content'], 'Không có mô tả');
  const time = getValue(log, ['ThoiGian', 'createdAt', 'CreatedAt', 'timestamp'], '');
  const target = getValue(log, ['TargetName', 'TargetId', 'DoiTuongAnhHuong', 'targetName', 'targetId'], 'Chưa cập nhật');
  const tableName = getValue(log, ['TableName', 'tableName', 'BangDuLieu'], 'Chưa cập nhật');
  const logId = getValue(log, ['MaLog', 'id', 'LogId', 'logId'], '---');

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
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-slate-700 bg-blue-600 text-white shadow-xl">
              <History size={38} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-blue-300">Chi tiết nhật ký hệ thống</p>
              <h3 className="mt-1 text-3xl font-black text-white">Log #{logId}</h3>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-300">
                <span>{actor}</span>
                <span>•</span>
                <span>{formatDateTime(time)}</span>
              </p>
            </div>

            <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase ring-1 ${meta.badge}`}>
              {meta.icon}
              {meta.label}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">Nội dung thao tác</p>
            <p className="text-base font-semibold leading-7 text-slate-800">{content}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DetailItem label="Người thực hiện" value={actor} icon={<User size={14} />} />
            <DetailItem label="Hành động gốc" value={action} icon={<Activity size={14} />} />
            <DetailItem label="Đối tượng ảnh hưởng" value={target} icon={<AlertTriangle size={14} />} />
            <DetailItem label="Thời gian" value={formatDateTime(time)} icon={<CalendarClock size={14} />} />
            <DetailItem label="Bảng dữ liệu" value={tableName} icon={<Database size={14} />} />
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-black text-emerald-800">Audit trail đã được ghi nhận</p>
                <p className="mt-1 text-sm font-medium leading-6 text-emerald-700">
                  Thông tin này dùng để truy vết thao tác trong hệ thống và hỗ trợ kiểm tra trách nhiệm người dùng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
  tone: 'blue' | 'emerald' | 'red' | 'amber';
}) {
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
