import React from 'react';
import { Globe } from 'lucide-react';
import styles from './SeoPages.module.css';

const SeoMetadata = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Site Metadata</h1>
          <p className={styles.subtitle}>
            Configure global meta titles, descriptions, Open Graph tags, and structured data.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Globe size={28} />
          </div>
          <h2 className={styles.emptyTitle}>Metadata settings</h2>
          <p className={styles.emptyText}>
            Site-wide SEO metadata will be managed here. Update default titles, descriptions,
            and social sharing previews for the platform.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SeoMetadata;
