import React from 'react';
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
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span className={index === breadcrumbs.length - 1 ? styles.activeCrumb : styles.crumb}>
                {crumb}
              </span>
              {index < breadcrumbs.length - 1 && (
                <div className={styles.separator}>
                  <ChevronRight size={14} />
                </div>
              )}
            </React.Fragment>
          ))}
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

