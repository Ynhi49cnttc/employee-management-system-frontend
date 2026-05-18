import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReactNode } from 'react'; 

import LoginPage from '@/pages/Auth/LoginPage';
import ProfilePage from '@/pages/Dashboard/ProfilePage';
import PeersPage from '@/pages/Dashboard/PeersPage';
import SalaryPage from '@/pages/Dashboard/SalaryPage';
import HRManagementPage from '@/pages/Dashboard/HRManagementPage';
import AccountsPage from '@/pages/Dashboard/AccountsPage';
import AuditLogPage from '@/pages/Dashboard/AuditLogPage';
import ManagerDepartmentPage from '@/pages/Dashboard/ManagerDepartmentPage';
import HRDepartmentsPage from '@/pages/Dashboard/HRDepartmentsPage';

interface ProtectedRouteProps {
  children: ReactNode; 
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.MaVaiTro)) {
    return <Navigate to="/dashboard/profile" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Navigate to="/dashboard/profile" replace />} />

          {/* Trang Hồ sơ */}
          <Route path="/dashboard/profile" element={
            <ProtectedRoute>
              <DashboardLayout><ProfilePage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Trang Đồng nghiệp */}
          <Route path="/dashboard/peers" element={
            <ProtectedRoute>
              <DashboardLayout><PeersPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Trang Lương */}
          <Route path="/dashboard/salary" element={
            <ProtectedRoute allowedRoles={['EMP', 'MAN', 'FIN', 'HRM']}>
              <DashboardLayout><SalaryPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Trang Quản lý nhân sự */}
          <Route path="/dashboard/hr-management" element={
            <ProtectedRoute allowedRoles={['HR', 'HRM']}>
              <DashboardLayout><HRManagementPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Trang Quản lý tài khoản */}
          <Route path="/dashboard/accounts" element={
            <ProtectedRoute allowedRoles={['HRM']}>
              <DashboardLayout><AccountsPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Trang Nhật ký */}
          <Route path="/dashboard/audit-logs" element={
            <ProtectedRoute allowedRoles={['HRM']}>
              <DashboardLayout><AuditLogPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/department" element={
            <ProtectedRoute allowedRoles={['MAN', 'HRM']}>
              <DashboardLayout>
                <ManagerDepartmentPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Trang Quản lý phòng ban  */}
          <Route path="/dashboard/hr-departments" element={
            <ProtectedRoute allowedRoles={['HRM']}>
              <DashboardLayout><HRDepartmentsPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;