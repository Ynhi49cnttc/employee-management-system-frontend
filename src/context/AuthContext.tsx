import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/axios';
import { AuthUser, LoginCredentials } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getFullProfile = async () => {
    try {
      const res = await api.get('/employee/profile');
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      
      if (data) {
        const fullUser: AuthUser = {
          MaNV: data.MaNV,
          MaVaiTro: localStorage.getItem('role') || 'EMP', 
          HoTen: data.HoTen 
        };
        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
      }
    } catch (error) {
      console.error("Không lấy được profile:", error);
      logout(); // Nếu token lỏ thì đuổi ra ngoài luôn
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getFullProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const payload = {
        TenDangNhap: (credentials as any).tenDangNhap,
        MatKhau: (credentials as any).matKhau
      };

      const response = await api.post('/auth/login', payload);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.MaVaiTro);

        await getFullProfile();
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi kết nối');
    }
  };

  const logout = () => {
    localStorage.clear(); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};