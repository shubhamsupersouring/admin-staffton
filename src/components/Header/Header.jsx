import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, ChevronRight, Menu } from 'lucide-react';
import styles from './Header.module.css';

const Header = ({ breadcrumbs, onToggleSidebar }) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={index}>
                {isLast ? (
                  <span className={styles.activeCrumb}>{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className={styles.crumb}>
                    {crumb.label}
                  </Link>
                )}
                {!isLast && (
                  <div className={styles.separator}>
                    <ChevronRight size={14} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.iconActions}>
          <button className={styles.iconBtn}>
            <Bell size={18} />
            <span className={styles.badge} />
          </button>
          <button className={styles.iconBtn}>
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

