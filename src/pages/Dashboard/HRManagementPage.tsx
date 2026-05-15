import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  Shield,
  X,
  User,
  Calendar,
  MapPin,
  CreditCard,
  Briefcase,
  Hash,
  Wallet,
  Lock,
  Unlock,
  BadgeCheck,
  Eye,
  CheckCircle2, 
  UserMinus,
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

const formatDate = (value: any) => {
  if (!value) return 'Chưa cập nhật';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';

  return date.toLocaleDateString('vi-VN');
};

const formatMoney = (value: any) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Chưa cập nhật';
  }

  return `${amount.toLocaleString('vi-VN')} đ`;
};

const getInitials = (name?: string) => {
  if (!name) return '?';

  return name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    EMP: 'Nhân viên',
    MAN: 'Quản lý',
    FIN: 'Tài chính',
    HR: 'Nhân sự',
    HRM: 'Trưởng phòng nhân sự',
  };

  return labels[role] || role || 'Chưa cập nhật';
};

const getGenderLabel = (gender: string) => {
  const labels: Record<string, string> = {
    NAM: 'Nam',
    NU: 'Nữ',
    KHAC: 'Khác',
    Nam: 'Nam',
    Nữ: 'Nữ',
    Khác: 'Khác',
  };

  return labels[gender] || gender || 'Chưa cập nhật';
};

const getWorkStatusLabel = (status: string) => {
  if (status === 'ACTIVE') return 'Đang làm việc';
  if (status === 'INACTIVE') return 'Đã nghỉ việc';

  return status || 'Đang làm việc';
};

export default function HRManagementPage() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const isHRM = user?.MaVaiTro === 'HRM';

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const endpoint = isHRM ? '/hr/all' : '/hr-staff/others';
      const response = await api.get(endpoint);

      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [isHRM]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const name = String(getValue(emp, ['HoTen', 'hoTen'], '')).toLowerCase();
      const id = String(getValue(emp, ['MaNV', 'maNV'], '')).toLowerCase();
      const email = String(getValue(emp, ['Email', 'email'], '')).toLowerCase();
      const department = String(getValue(emp, ['TenPhongBan', 'phongBanTen', 'MaPhong'], '')).toLowerCase();
      const search = searchTerm.toLowerCase();

      return name.includes(search) || id.includes(search) || email.includes(search) || department.includes(search);
    });
  }, [employees, searchTerm]);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      MaNV: '',
      HoTen: '',
      Email: '',
      SoDienThoai: '',
      GioiTinh: 'NAM',
      NgaySinh: '',
      DiaChi: '',
      CCCD: '',
      MaSoThue: '',
      MaPhong: '',
      TenPhongBan: '',
      ChucVu: '',
      MaVaiTro: 'EMP',
      LoaiNhanVien: 'FULLTIME',
      TrangThai: 'ACTIVE',
      Luong: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({ ...employee });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const cleanData = { ...formData };
      
      if (cleanData.Luong) {
        cleanData.Luong = Number(cleanData.Luong);
      } else if (cleanData.luongCoBan) {
         cleanData.Luong = Number(cleanData.luongCoBan);
      } else {
        cleanData.Luong = null;
      }

      if (editingEmployee) {
        const maNV = getValue(editingEmployee, ['MaNV', 'maNV'], '');
        const name = getValue(cleanData, ['HoTen', 'hoTen'], 'nhân viên');
        const endpoint = isHRM ? `/hr/update/${maNV}` : `/hr-staff/update/${maNV}`;

        await api.put(endpoint, cleanData); 
        alert(`Cập nhật thông tin nhân viên ${name} thành công!`);
      } else {
        const endpoint = isHRM ? '/hr/add' : '/hr-staff/add';
        const name = getValue(cleanData, ['HoTen', 'hoTen'], 'nhân viên mới');
        
        await api.post(endpoint, cleanData);
        alert(`Đã thêm thành công nhân viên ${name} vào danh sách.`);
      }

      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert('Thao tác thất bại: Vui lòng kiểm tra lại dữ liệu nhập vào hoặc quyền truy cập.');
    }
  };

  const handleDelete = async (employee: Employee) => {
    const maNV = getValue(employee, ['MaNV', 'maNV'], '');
    const name = getValue(employee, ['HoTen', 'hoTen'], 'nhân viên này');

    const confirmMessage = `Bạn có chắc chắn muốn xóa nhân viên "${name}" (Mã: ${maNV}) khỏi hệ thống quản lý không?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const endpoint = isHRM ? `/hr/delete/${maNV}` : `/hr-staff/delete/${maNV}`;
      await api.delete(endpoint);

      alert(`Đã xóa thành công nhân viên ${name} khỏi hệ thống.`);
      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert('Lỗi hệ thống: Không thể xóa nhân viên này vào lúc này.');
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
          <h2 className="text-2xl font-black text-slate-900">Quản lý nhân sự</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản trị hồ sơ nhân viên, thông tin công việc và trạng thái tài khoản
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <UserPlus size={18} />
          Thêm nhân viên
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Tổng nhân sự" value={employees.length} icon={<User size={20} />} />
        <StatCard label="Đang hiển thị" value={filteredEmployees.length} icon={<BadgeCheck size={20} />} />
        <StatCard label="HR có quyền" value={isHRM ? 'HRM' : 'HR'} icon={<Shield size={20} />} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên, email, mã nhân viên, phòng ban..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Nhân viên</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Liên hệ</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Phòng ban</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Vai trò</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Trạng thái</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map((employee) => {
              const name = getValue(employee, ['HoTen', 'hoTen'], 'Chưa cập nhật');
              const email = getValue(employee, ['Email', 'email'], '---');
              const phone = getValue(employee, ['SoDienThoai', 'soDienThoai'], '---');
              const department = getValue(employee, ['TenPhongBan', 'phongBanTen', 'MaPhong'], '---');
              const role = getValue(employee, ['MaVaiTro', 'role'], 'EMP');
              const status = getValue(employee, ['TrangThai', 'trangThai'], 'ACTIVE');
              const isLocked = Boolean(getValue(employee, ['IsLocked', 'isLocked', 'KhoaTaiKhoan'], false));

              return (
                <tr key={getValue(employee, ['MaNV', 'maNV'])} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 font-black text-blue-700">
                        {getInitials(name)}
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">{name}</p>
                        <p className="text-xs font-bold text-blue-600">{getValue(employee, ['MaNV', 'maNV'], '---')}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail size={14} className="text-slate-400" />
                        {email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone size={14} className="text-slate-400" />
                        {phone}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-700">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-sm">
                      <Building2 size={14} />
                      {department}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">
                      {getRoleLabel(role)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      {status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                          <CheckCircle2 size={14} />
                          Đang làm việc
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
                          <UserMinus size={14} />
                          Đã nghỉ việc
                        </span>
                      )}

                      {isLocked && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500">
                          <Lock size={12} />
                          Tài khoản đang khóa
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => openEditModal(employee)}
                        className="rounded-xl border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(employee)}
                        className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="p-10 text-center text-sm font-semibold text-slate-400">
            Không tìm thấy nhân viên phù hợp.
          </div>
        )}
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}

      {isModalOpen && (
        <EmployeeFormModal
          isEditing={!!editingEmployee}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
          isHRM={isHRM}
          existingEmployees={employees} 
        />
      )}
    </div>
  );
}

function EmployeeDetailModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const name = getValue(employee, ['HoTen', 'hoTen'], 'Chưa cập nhật');
  const maNV = getValue(employee, ['MaNV', 'maNV'], '---');
  const role = getValue(employee, ['MaVaiTro', 'role'], 'EMP');
  const isLocked = Boolean(getValue(employee, ['IsLocked', 'isLocked', 'KhoaTaiKhoan'], false));
  const status = getValue(employee, ['TrangThai', 'trangThai'], 'ACTIVE');
  const salary = getValue(employee, ['Luong', 'luongCoBan', 'tongLuong'], 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
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
              <p className="text-xs font-black uppercase tracking-widest text-blue-300">Hồ sơ nhân viên</p>
              <h3 className="mt-1 text-3xl font-black text-white">{name}</h3>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-300">
                <span>Mã NV: {maNV}</span>
                <span>•</span>
                <span>{getValue(employee, ['ChucVu', 'chucVuTen', 'TenChucVu'], 'Nhân viên')}</span>
                <span>•</span>
                <span>{getValue(employee, ['TenPhongBan', 'phongBanTen', 'MaPhong'], 'Chưa cập nhật')}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <span className="rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-black uppercase text-blue-100 ring-1 ring-blue-400/30">
                {getRoleLabel(role)}
              </span>

              <span className={`rounded-full px-4 py-1.5 text-xs font-black uppercase ring-1 ${isLocked ? 'bg-red-500/20 text-red-100 ring-red-400/30' : 'bg-emerald-500/20 text-emerald-100 ring-emerald-400/30'}`}>
                {isLocked ? 'Tài khoản đã khóa' : 'Tài khoản bình thường'}
              </span>
            </div>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <InfoSection title="Thông tin cá nhân" icon={<User size={18} />}>
              <DetailItem label="Họ tên" value={name} icon={<User size={14} />} />
              <DetailItem label="Giới tính" value={getGenderLabel(getValue(employee, ['GioiTinh', 'gioiTinh'], ''))} icon={<User size={14} />} />
              <DetailItem label="Ngày sinh" value={formatDate(getValue(employee, ['NgaySinh', 'ngaySinh'], ''))} icon={<Calendar size={14} />} />
              <DetailItem label="Địa chỉ" value={getValue(employee, ['DiaChi', 'diaChi'], 'Chưa cập nhật')} icon={<MapPin size={14} />} />
            </InfoSection>

            <InfoSection title="Liên hệ & định danh" icon={<CreditCard size={18} />}>
              <DetailItem label="Email" value={getValue(employee, ['Email', 'email'], 'Chưa cập nhật')} icon={<Mail size={14} />} />
              <DetailItem label="Số điện thoại" value={getValue(employee, ['SoDienThoai', 'soDienThoai'], 'Chưa cập nhật')} icon={<Phone size={14} />} />
              <DetailItem label="CCCD" value={getValue(employee, ['CCCD', 'cccd'], 'Chưa cập nhật')} icon={<CreditCard size={14} />} />
              <DetailItem label="Mã số thuế" value={getValue(employee, ['MaSoThue', 'maSoThue'], 'Chưa cập nhật')} icon={<Hash size={14} />} />
            </InfoSection>

            <InfoSection title="Công việc & tài khoản" icon={<Briefcase size={18} />}>
              <DetailItem label="Phòng ban" value={getValue(employee, ['TenPhongBan', 'phongBanTen', 'MaPhong'], 'Chưa cập nhật')} icon={<Building2 size={14} />} />
              <DetailItem label="Chức vụ" value={getValue(employee, ['ChucVu', 'chucVuTen', 'TenChucVu'], 'Nhân viên')} icon={<Briefcase size={14} />} />
              <DetailItem label="Loại nhân viên" value={getValue(employee, ['LoaiNhanVien', 'loaiNhanVien'], 'FULLTIME')} icon={<BadgeCheck size={14} />} />
              <DetailItem label="Ngày vào làm" value={formatDate(getValue(employee, ['NgayVaoLam', 'ngayVaoLam'], ''))} icon={<Calendar size={14} />} />
              <DetailItem label="Trạng thái làm việc" value={getWorkStatusLabel(status)} icon={<BadgeCheck size={14} />} />
              <DetailItem label="Trạng thái tài khoản" value={isLocked ? 'Đã khóa' : 'Bình thường'} icon={isLocked ? <Lock size={14} /> : <Unlock size={14} />} />
            </InfoSection>
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-600 p-3 text-white">
                  <Wallet size={22} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Thông tin lương</p>
                  <p className="text-sm font-semibold text-emerald-800">Chỉ hiển thị theo quyền HR/HRM và dữ liệu backend hiện có</p>
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-700">{formatMoney(salary)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeFormModal({
  isEditing,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isHRM,
  existingEmployees, 
}: {
  isEditing: boolean;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isHRM: boolean;
  existingEmployees: Employee[];
}) {
  const [errorMsg, setErrorMsg] = useState('');

  // Danh sách phòng ban cứng (Có thể gọi từ API nếu sau này mở rộng)
  const departments = [
    { value: 'P001', label: 'Phòng Kỹ thuật / IT' },
    { value: 'P002', label: 'Phòng Nhân sự' },
    { value: 'P003', label: 'Phòng Hành chính' },
    { value: 'P004', label: 'Phòng Kinh doanh' },
    { value: 'P005', label: 'Phòng Tài chính' },
  ];

  useEffect(() => {
    if (!isEditing && existingEmployees.length > 0 && !formData.MaNV) {
      const employeeNumbers = existingEmployees
        .map((emp) => {
          const maNV = getValue(emp, ['MaNV', 'maNV'], '');
          const numMatch = maNV.match(/\d+/);
          return numMatch ? parseInt(numMatch[0], 10) : 0;
        })
        .filter((num) => !isNaN(num));

      const maxNumber = employeeNumbers.length > 0 ? Math.max(...employeeNumbers) : 0;
      const nextNumber = maxNumber + 1;
      const newMaNV = `NV${String(nextNumber).padStart(3, '0')}`; // Tạo định dạng NV0xx
      
      setFormData((prev) => ({ ...prev, MaNV: newMaNV }));
    }
  }, [isEditing, existingEmployees, formData.MaNV, setFormData]);


  const setField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrorMsg(''); 
  };

  const handleDepartmentChange = (maPhong: string) => {
    const selectedDept = departments.find((d) => d.value === maPhong);
    setFormData((prev) => ({
      ...prev,
      MaPhong: maPhong,
      TenPhongBan: selectedDept ? selectedDept.label : '',
    }));
    setErrorMsg('');
  };

  const validateForm = () => {
    const luong = Number(formData.Luong || formData.luongCoBan || 0);
    if (luong < 0) {
      setErrorMsg('Mức lương không được phép là số âm.');
      return false;
    }

    const ngaySinhStr = formData.NgaySinh || formData.ngaySinh;
    if (ngaySinhStr) {
      const dob = new Date(ngaySinhStr);
      const today = new Date();

      if (dob > today) {
        setErrorMsg('Ngày sinh không hợp lệ (Không thể chọn ngày ở tương lai).');
        return false;
      }
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        setErrorMsg('Nhân viên chưa đủ 18 tuổi để ký hợp đồng lao động chính thức.');
        return false;
      }
    }

    const emailStr = String(formData.Email || formData.email || '').trim();
    if (emailStr) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailStr)) {
        setErrorMsg('Email không đúng định dạng.');
        return false;
      }
      
      const isDuplicateEmail = existingEmployees.some((emp) => {
        const currentMaNV = getValue(formData, ['MaNV', 'maNV'], '');
        const empMaNV = getValue(emp, ['MaNV', 'maNV'], '');
        if (isEditing && currentMaNV === empMaNV) return false; 
        
        return String(getValue(emp, ['Email', 'email'], '')).toLowerCase() === emailStr.toLowerCase();
      });

      if (isDuplicateEmail) {
        setErrorMsg('Email này đã được sử dụng bởi một nhân viên khác trong hệ thống.');
        return false;
      }
    }

    const phoneStr = String(formData.SoDienThoai || formData.soDienThoai || '').trim();
    if (phoneStr) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(phoneStr)) {
        setErrorMsg('Số điện thoại không hợp lệ (Phải bao gồm 10 chữ số và bắt đầu bằng số 0).');
        return false;
      }

       const isDuplicatePhone = existingEmployees.some((emp) => {
        const currentMaNV = getValue(formData, ['MaNV', 'maNV'], '');
        const empMaNV = getValue(emp, ['MaNV', 'maNV'], '');
        if (isEditing && currentMaNV === empMaNV) return false; 
        
        return String(getValue(emp, ['SoDienThoai', 'soDienThoai'], '')) === phoneStr;
      });

      if (isDuplicatePhone) {
        setErrorMsg('Số điện thoại này đã được đăng ký cho một nhân viên khác.');
        return false;
      }
    }

    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-8 py-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">Quản lý hồ sơ nhân viên</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">
              {isEditing ? 'Cập nhật thông tin nhân viên' : 'Thêm nhân viên mới'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
            type="button"
          >
            <X size={22} />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-8 mt-6 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
            ⚠ Lỗi: {errorMsg}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="max-h-[75vh] overflow-y-auto p-8 pt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <FormSection title="Thông tin cơ bản" icon={<User size={18} />}>
              <InputField label="Mã nhân viên" value={formData.MaNV || formData.maNV || ''} onChange={(v) => setField('MaNV', v)} disabled={true} />
              <InputField label="Họ và tên" value={formData.HoTen || formData.hoTen || ''} onChange={(v) => setField('HoTen', v)} required />
              <SelectField label="Giới tính" value={formData.GioiTinh || formData.gioiTinh || 'NAM'} onChange={(v) => setField('GioiTinh', v)} options={[{ value: 'NAM', label: 'Nam' }, { value: 'NU', label: 'Nữ' }, { value: 'KHAC', label: 'Khác' }]} />
              <InputField label="Ngày sinh" type="date" value={(formData.NgaySinh || formData.ngaySinh || '').toString().split('T')[0]} onChange={(v) => setField('NgaySinh', v)} />
              <InputField label="Địa chỉ" value={formData.DiaChi || formData.diaChi || ''} onChange={(v) => setField('DiaChi', v)} />
            </FormSection>

            <FormSection title="Liên hệ & định danh" icon={<CreditCard size={18} />}>
              <InputField label="Email" type="email" value={formData.Email || formData.email || ''} onChange={(v) => setField('Email', v)} required/>
              <InputField label="Số điện thoại" value={formData.SoDienThoai || formData.soDienThoai || ''} onChange={(v) => setField('SoDienThoai', v)} required/>
              <InputField label="CCCD" value={formData.CCCD || formData.cccd || ''} onChange={(v) => setField('CCCD', v)} />
              <InputField label="Mã số thuế" value={formData.MaSoThue || formData.maSoThue || ''} onChange={(v) => setField('MaSoThue', v)} />
            </FormSection>

            <FormSection title="Công việc & tài khoản" icon={<Briefcase size={18} />}>
              <SelectField 
                label="Phòng ban" 
                value={formData.MaPhong || formData.phongBanId || 'P001'} 
                onChange={handleDepartmentChange} 
                options={departments} 
              />
              <InputField label="Vị trí công việc" value={formData.ChucVu || formData.chucVuTen || ''} onChange={(v) => setField('ChucVu', v)} />
              <SelectField label="Loại nhân viên" value={formData.LoaiNhanVien || formData.loaiNhanVien || 'FULLTIME'} onChange={(v) => setField('LoaiNhanVien', v)} options={[{ value: 'FULLTIME', label: 'Toàn thời gian' }, { value: 'PARTTIME', label: 'Bán thời gian' }, { value: 'INTERN', label: 'Thực tập' }]} />
              <SelectField label="Trạng thái làm việc" value={formData.TrangThai || formData.trangThai || 'ACTIVE'} onChange={(v) => setField('TrangThai', v)} options={[{ value: 'ACTIVE', label: 'Đang làm việc' }, { value: 'INACTIVE', label: 'Đã nghỉ việc' }]} />
              <SelectField label="Vai trò hệ thống" value={formData.MaVaiTro || formData.role || 'EMP'} onChange={(v) => setField('MaVaiTro', v)} disabled={!isHRM} options={[{ value: 'EMP', label: 'Nhân viên' }, { value: 'MAN', label: 'Quản lý' }, { value: 'FIN', label: 'Tài chính' }, { value: 'HR', label: 'Nhân sự' }, { value: 'HRM', label: 'Trưởng phòng nhân sự' }]} />
              <InputField label="Lương" type="number" value={formData.Luong || formData.luongCoBan || ''} onChange={(v) => setField('Luong', v)} />
            </FormSection>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50">
              Hủy
            </button>
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white transition hover:bg-blue-700">
              {isEditing ? 'Lưu thay đổi' : 'Tạo nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">{icon}</div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="text-blue-600">{icon}</div>
        <h4 className="font-black text-slate-800">{title}</h4>
      </div>
      <div className="space-y-3 p-5">{children}</div>
    </div>
  );
}

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">{icon}</div>
        <h4 className="font-black text-slate-800">{title}</h4>
      </div>
      <div className="space-y-4">{children}</div>
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

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
