import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import { BreadcrumbDetailContext } from '../contexts/BreadcrumbDetailContext';
import styles from './AdminLayout.module.css';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [detailLabel, setDetailLabel] = useState(null);

  useEffect(() => {
    setDetailLabel(null);
  }, [location.pathname]);

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return ['Dashboard'];

    const labels = paths.map((p, i) => {
      const isLast = i === paths.length - 1;
      if (isLast && UUID_RE.test(p)) {
        return detailLabel || 'Organization';
      }
      return p.charAt(0).toUpperCase() + p.slice(1);
    });

    return ['Dashboard', ...labels];
  };

  const breadcrumbContextValue = useMemo(() => ({ setDetailLabel }), []);

  return (
    <BreadcrumbDetailContext.Provider value={breadcrumbContextValue}>
    <div className={styles.layout}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className={styles.wrapper}>
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
