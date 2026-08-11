import React from 'react';
import { FileText } from 'lucide-react';
import styles from './SeoPages.module.css';

const SeoPages = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Page Content</h1>
          <p className={styles.subtitle}>
            Manage landing pages, headings, and on-page SEO content for the public site.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FileText size={28} />
          </div>
          <h2 className={styles.emptyTitle}>No pages yet</h2>
          <p className={styles.emptyText}>
            Page content management will appear here once connected to the API.
            You can create, edit, and publish SEO-optimized pages from this section.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SeoPages;
