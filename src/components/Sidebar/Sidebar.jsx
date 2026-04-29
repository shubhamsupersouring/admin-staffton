import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  Building,
  Layers,
  Briefcase,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { logout } from '../../features/auth/authSlice';
import logoImg from '../../assets/images/inner-logo.png';
import apiClient from '../../services/apiClient';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [organizationsCount, setOrganizationsCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get('/admin/dashboard-stats')
      .then((res) => {
        const n = Number(res.data?.data?.organisations ?? 0);
        if (!cancelled) setOrganizationsCount(Number.isFinite(n) ? n : 0);
      })
      .catch(() => {
        if (!cancelled) setOrganizationsCount(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const userName = user?.full_name || user?.name || user?.email || 'User';
  const rawRole = user?.role || localStorage.getItem('userType') || 'admin';
  
  const userRoleLabel = String(rawRole)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate('/auth/login');
  };

  const menuItems = useMemo(
    () => [
      {
        name: 'Dashboard',
        icon: <LayoutDashboard size={18} />,
        path: '/',
      },
      {
        name: 'Organizations',
        icon: <Building size={18} />,
        path: '/organizations',
        badge: organizationsCount,
      },
      {
        name: 'Jobs',
        icon: <Briefcase size={18} />,
        path: '/jobs',
      },
      {
        name: 'Entities',
        icon: <Layers size={18} />,
        path: '/entities',
      },
      {
        name: 'Users',
        icon: <Users size={18} />,
        path: '/users',
      },
      {
        name: 'Candidates',
        icon: <Users size={18} />,
        path: '/candidates',
      },
    ],
    [organizationsCount]
  );

  const systemItems = [
    { 
      name: 'Settings & Profile', 
      icon: <Settings size={18} />, 
      path: '/settings' 
    },
  ];

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoText}>
            <div className={styles.logoIcon}>
              <img src={logoImg} alt="Staffton Logo" className={styles.logoImage} />
            </div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navLabel}>Main</div>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              {item.icon}
              {item.name}
              {typeof item.badge === 'number' && (
                <span className={styles.navBadge}>{item.badge}</span>
              )}
            </NavLink>
          ))}

          <div className={styles.navLabel} style={{ marginTop: '12px' }}>System</div>
          {systemItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>{userRoleLabel}</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

