import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Building,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  Globe,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { logout } from '../../features/auth/authSlice';
import logoImg from '../../assets/images/inner-logo.png';
import miniLogo from '../../assets/svg/logo.svg';
import apiClient from '../../services/apiClient';
import {
  getSidebarItemsForRole,
  getSidebarSectionLabel,
  getUserRole,
} from '../../utils/permission';

const ICON_MAP = {
  dashboard: LayoutDashboard,
  organizations: Building,
  jobs: Briefcase,
  candidates: Users,
  'hospital-join-requests': Building2,
  'seo-pages': FileText,
  'seo-metadata': Globe,
  settings: Settings,
};

const Sidebar = ({ isOpen = false, onClose = () => { }, isCollapsed = false, onToggleCollapse = () => { } }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const role = getUserRole(user);
  const [organizationsCount, setOrganizationsCount] = useState(null);

  useEffect(() => {
    if (!role || role !== 'super_admin') return undefined;

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
  }, [role]);

  const userName = user?.full_name || user?.name || user?.email || 'User';
  const rawRole = user?.role || 'admin';

  const userRoleLabel = String(rawRole)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate('/auth/login');
  };

  const sidebarSections = useMemo(() => {
    const items = getSidebarItemsForRole(role).map((item) => ({
      ...item,
      icon: ICON_MAP[item.id] ?? LayoutDashboard,
      badge: item.id === 'organizations' ? organizationsCount : undefined,
    }));

    const sectionOrder = ['main', 'seo', 'system'];
    return sectionOrder
      .map((section) => ({
        section,
        label: getSidebarSectionLabel(section),
        items: items.filter((item) => item.section === section),
      }))
      .filter((group) => group.items.length > 0);
  }, [role, organizationsCount]);

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoText}>
            <div className={styles.logoIcon}>
              <img src={isCollapsed ? miniLogo : logoImg} alt="Staffton Logo" className={styles.logoImage} />
            </div>
          </div>
          <button
            className={styles.collapseToggle}
            style={{ marginLeft: "20px" }}
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {sidebarSections.map((group, groupIndex) => (
            <React.Fragment key={group.section}>
              <div
                className={styles.navLabel}
                style={groupIndex > 0 ? { marginTop: '12px' } : undefined}
              >
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => {
                      const isCustomActive = isActive || (item.path === '/jobs' && (location.pathname === '/pipeline' || location.pathname.startsWith('/pipeline/')));
                      return isCustomActive ? `${styles.navItem} ${styles.active}` : styles.navItem;
                    }}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon size={18} />
                    {!isCollapsed && item.name}
                    {typeof item.badge === 'number' && (
                      <span className={styles.navBadge}>{item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </React.Fragment>
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
