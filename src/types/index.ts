export interface Employee {
  maNV: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  gioiTinh: "Nam" | "Nữ" | "Khác";
  ngaySinh: string;
  diaChi: string;
  avatarUrl?: string;
  cccd?: string;
  maSoThue?: string;
  phongBanId: string;
  phongBanTen: string;
  chucVuId: string;
  chucVuTen: string;
  role: "EMP" | "MAN" | "FIN" | "HR" | "HRM";
  managerId?: string;
  managerName?: string;
  ngayVaoLam: string;
  loaiNhanVien: "FULLTIME" | "PARTTIME" | "INTERN";
  trangThai: "ACTIVE" | "INACTIVE" | "LOCKED";
  luongCoBan?: number;
  heSoLuong?: number;
  phuCap?: number;
  tongLuong?: number;
}

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  activeEmployees: number;
  lockedAccounts: number;
  managers: number;
  hrStaffs: number;
  financeStaffs: number;
  newEmployeesThisMonth: number;
}
export interface AuthUser {
  MaNV: string;
  HoTen: string;
  MaVaiTro: string;
}
export interface LoginCredentials {
  tenDangNhap: string;
  matKhau: string;
}