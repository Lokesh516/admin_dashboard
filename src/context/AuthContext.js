import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth') === 'true';
    const storedUser = localStorage.getItem('user');
    if (storedAuth && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser))
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      const userObj = { name: 'admin' };
      setIsAuthenticated(true);
      setUser(userObj);
      localStorage.setItem('auth', 'true');
      localStorage.setItem('user', JSON.stringify(userObj));
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
