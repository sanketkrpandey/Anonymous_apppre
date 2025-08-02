import React, { useState, useEffect, createContext, useContext } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import io from 'socket.io-client';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

// Set token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      // Connect to Socket.IO backend
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('join-room', user.id); // Join a private room for the user
      });

      newSocket.on('newNotification', (notification) => {
        console.log('New notification received:', notification);
        toast.info(notification.message); // Display a toast notification
        // You might also want to update a notification count/list in your UI
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      return () => {
        // Clean up socket connection on component unmount or user change
        newSocket.disconnect();
      };
    }
  }, [user]); // Re-run effect when user object changes (e.g., after login/logout)

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null); // Ensure user is null on auth failure
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    if (socket) {
      socket.disconnect(); // Disconnect socket on logout
      setSocket(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };