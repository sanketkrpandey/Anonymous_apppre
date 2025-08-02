import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context imports
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Page imports
import Login from './pages/Login';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';

// Component imports
import Navigation from './components/Navigation';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Layout component for pages with sidebar
const LayoutWithSidebar = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};

// Layout component for pages with traditional navigation
const LayoutWithNavigation = ({ children }) => {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />
              
              {/* Private routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <LayoutWithSidebar>
                      <Home />
                    </LayoutWithSidebar>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <LayoutWithNavigation>
                      <ProfilePage />
                    </LayoutWithNavigation>
                  </PrivateRoute>
                }
              />
              
              {/* You can add more private routes here as your application grows */}
            </Routes>
            
            <Toaster 
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
                className: 'dark:bg-gray-800 dark:text-white',
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;