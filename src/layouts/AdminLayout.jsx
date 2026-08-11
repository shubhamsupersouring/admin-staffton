import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import { BreadcrumbDetailContext } from '../contexts/BreadcrumbDetailContext';
import styles from './AdminLayout.module.css';
import { ROUTE_LABELS } from '../utils/permission';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const formatSegmentLabel = (segment) => {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [detailLabel, setDetailLabel] = useState(null);

  useEffect(() => {
    setDetailLabel(null);
  }, [location.pathname]);

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', path: '/' }];

    let currentPath = '';
    paths.forEach((p, i) => {
      currentPath += `/${p}`;
      const isLast = i === paths.length - 1;
      let label = formatSegmentLabel(p);

      if (isLast && UUID_RE.test(p)) {
        label = detailLabel || 'Organization';
      }

      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbContextValue = useMemo(() => ({ setDetailLabel }), []);

  return (
    <BreadcrumbDetailContext.Provider value={breadcrumbContextValue}>
    <div className={styles.layout}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className={`${styles.wrapper} ${isCollapsed ? styles.wrapperCollapsed : ''}`}>
        <Header
          breadcrumbs={getBreadcrumbs()}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
    </BreadcrumbDetailContext.Provider>
  );
};

export default AdminLayout;
