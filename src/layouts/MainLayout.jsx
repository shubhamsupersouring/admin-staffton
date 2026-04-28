import styles from './MainLayout.module.css';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>Staffton Admin Portal</div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        © 2026 Staffton
      </footer>
    </div>
  );
}

export default MainLayout;
