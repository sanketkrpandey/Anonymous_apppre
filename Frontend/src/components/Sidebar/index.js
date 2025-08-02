import React, { useState, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Search,
  ShieldOff,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Sidebar Context
const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, open, setOpen, animate }) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  const navigate = useNavigate();

  const links = [
    {
      label: 'Home',
      href: '/',
      icon: <Home className="h-5 w-5 text-gray-700 dark:text-gray-200" />,
    },
    {
      label: 'My Profile',
      href: '/profile',
      icon: <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />,
    },
    {
      label: 'Search Users',
      href: '/search',
      icon: <Search className="h-5 w-5 text-gray-700 dark:text-gray-200" />,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5 text-gray-700 dark:text-gray-200" />,
    },
    {
      label: 'Blocked Users',
      href: '/blocked',
      icon: <ShieldOff className="h-5 w-5 text-gray-700 dark:text-gray-200" />,
    },
    {
      label: 'Logout',
      href: '#',
      icon: <LogOut className="h-5 w-5 text-gray-700 dark:text-gray-200" />,
      onClick: () => {
        localStorage.removeItem('token'); // or use your own token clear logic
        navigate('/login');
      },
    },
  ];

  return (
    <>
      <DesktopSidebar {...props}>
        <Logo />
        <div className="flex flex-col space-y-1 mt-6">
          {links.map((link) => (
            <SidebarLink key={link.label} link={link} onClick={link.onClick} />
          ))}
        </div>
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </DesktopSidebar>

      <MobileSidebar {...props}>
        <Logo />
        <div className="flex flex-col space-y-1 mt-6">
          {links.map((link) => (
            <SidebarLink key={link.label} link={link} onClick={link.onClick} />
          ))}
        </div>
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        'h-full px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-[300px] flex-shrink-0',
        className
      )}
      animate={{
        width: animate ? (open ? '300px' : '60px') : '300px',
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          'h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 w-full'
        )}
        {...props}
      >
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Social Feed
        </h1>
        <div className="flex justify-end z-20">
          <Menu
            className="text-gray-800 dark:text-white cursor-pointer w-6 h-6"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
              className={cn(
                'fixed h-full w-full inset-0 bg-white dark:bg-gray-900 p-10 z-[100] flex flex-col justify-between',
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-gray-800 dark:text-white cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({ link, className, onClick, ...props }) => {
  const { open, animate } = useSidebar();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (link.href === '#') e.preventDefault(); // prevent default for logout
    if (onClick) onClick();
    else if (link.href) navigate(link.href);
  };

  return (
    <a
      href={link.href}
      onClick={handleClick}
      className={cn(
        'flex items-center justify-start gap-2 group/sidebar py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer',
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-gray-700 dark:text-gray-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

// Logo Components
export const Logo = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20">
      <div className="h-5 w-6 bg-blue-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Social Hub
      </motion.span>
    </div>
  );
};

export const LogoIcon = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20">
      <div className="h-5 w-6 bg-blue-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </div>
  );
};

// Theme Toggle Component
export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const { open } = useSidebar();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-start gap-2 group/sidebar py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors w-full"
    >
      {isDark ? (
        <Sun className="text-gray-700 dark:text-gray-200 h-5 w-5 flex-shrink-0" />
      ) : (
        <Moon className="text-gray-700 dark:text-gray-200 h-5 w-5 flex-shrink-0" />
      )}
      <motion.span
        animate={{
          display: open ? 'inline-block' : 'none',
          opacity: open ? 1 : 0,
        }}
        className="text-gray-700 dark:text-gray-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </motion.span>
    </button>
  );
};
