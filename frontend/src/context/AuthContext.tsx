import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { AuthService } from "../services/AuthService";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  birthday: string;
  phone_number: string;
  is_admin: boolean;
  joined_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = AuthService.getToken();
      const savedUser = AuthService.getUser();

      if (token && savedUser) {
        try {
          // Verify session with backend
          const user = await AuthService.getUserInfoApi();
          setUser(user);
          AuthService.setUser(user); // Sync latest data
        } catch (error) {
          console.error('Session verification failed:', error);
          // If 401, HttpService already triggers logout event via interceptor
          // but we clear local state here just in case of other errors
          setUser(null);
          AuthService.logout();
        }
      } else if (localStorage.getItem('spear_fresh_fish_guest') === 'true') {
        setIsGuest(true);
      }
      
      setIsLoading(false);
    };

    initAuth();

    const handleLogout = () => logout();
    window.addEventListener('spear_fresh_fish_logout', handleLogout);

    return () => {
      window.removeEventListener('spear_fresh_fish_logout', handleLogout);
    };
  }, []);

  const login = (accessToken: string, refreshToken: string, user: User) => {
    AuthService.setToken(accessToken);
    if (refreshToken) AuthService.setRefreshToken(refreshToken);
    AuthService.setUser(user);
    setUser(user);
    setIsGuest(false);
    localStorage.removeItem("spear_fresh_fish_guest");
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("spear_fresh_fish_guest");
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem("spear_fresh_fish_guest", "true");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        login,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
