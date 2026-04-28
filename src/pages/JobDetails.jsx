import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  Clock, 
  Download,
  CheckCircle2,
  ExternalLink,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './JobDetails.module.css';
import apiClient from '../services/apiClient';
import { useBreadcrumbDetail } from '../contexts/BreadcrumbDetailContext';
import { AdminDashboardSkeleton } from '../components/Skeleton';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setDetailLabel } = useBreadcrumbDetail();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await apiClient.get(`/admin/jobs/${id}`);
        setJob(res.data.data);
      } catch (error) {
        toast.error('Failed to load job details');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id, navigate]);

  useEffect(() => {
    if (job?.title) {
      setDetailLabel(`#${job.id.substring(0, 8).toUpperCase()}`);
    }
    return () => setDetailLabel(null);
  }, [job, setDetailLabel]);

  if (loading || !job) return <AdminDashboardSkeleton />;

  const displayValue = (val) => {
    if (!val) return '';
    if (typeof val === 'object') return val.name || val.title || val.label || val.value || '';
    return val;
  };

  const cleanList = (text) => {
    if (!text) return [];
    return text.split('\n').filter(l => l.trim().length > 0);
  };

  // Required documents from the job data or defaults
  const requirements = [
    { title: 'Identity Proof (Aadhaar/PAN)', types: '[PDF, JPG, PNG — max 5MB]' },
    { title: 'Medical Council Registration Certificate', types: '[PDF, JPG, PNG — max 5MB]' },
    { title: 'Identity Verification Document', types: '[PDF, JPG, PNG — max 5MB]' },
    { title: 'Professional License', types: '[PDF, JPG, PNG — max 5MB]' },
    { title: 'Resume or CV', types: '[PDF, DOC, DOCX — max 5MB]' },
  ];

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/jobs')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className={styles.pageTitle}>{displayValue(job.title)}</h1>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Building size={14} /> {displayValue(job.organisation_name)}
          </span>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {/* Main Hero Card */}
        <section className={`${styles.cardBlock} ${styles.heroCard}`}>
          <div className={styles.heroTop}>
            <span className={styles.postedTime}>
              <Clock size={14} /> Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
            <span className={`${styles.statusPill} ${job.status === 'active' ? styles.statusActive : styles.statusDraft}`}>
              {job.status || 'draft'}
            </span>
          </div>

          <h2 className={styles.jobTitle}>{displayValue(job.title)}</h2>
          
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <MapPin size={16} className={styles.metaIcon} /> {displayValue(job.org_city) || displayValue(job.city) || 'Remote'}
            </span>
            <span className={styles.metaItem}>
              <Building size={16} className={styles.metaIcon} /> {displayValue(job.organisation_name)}
            </span>
          </div>

          <div className={styles.tagsRow}>
            {displayValue(job.profession) ? <span className={styles.tag}>{displayValue(job.profession)}</span> : null}
            {displayValue(job.specialisation) ? <span className={styles.tag}>{displayValue(job.specialisation)}</span> : null}
            {displayValue(job.shift) ? <span className={styles.tag}>{displayValue(job.shift)}</span> : null}
            {Array.isArray(job.job_type) ? job.job_type.map((t, idx) => (
              displayValue(t) ? <span key={t?.id || idx} className={styles.tag}>{displayValue(t)}</span> : null
            )) : (displayValue(job.job_type) ? <span className={styles.tag}>{displayValue(job.job_type)}</span> : <span className={styles.tag}>Full-Time</span>)}
          </div>

          <div className={styles.heroFooter}>
            <div className={styles.footerDetails}>
              <div className={styles.footerGroup}>
                <span className={styles.footerLabel}>Experience</span>
                <span className={styles.footerValue}>{job.experience_min_yrs || 0} - {job.experience_max_yrs || 5} years</span>
              </div>
              <div className={styles.footerGroup}>
                <span className={styles.footerLabel}>Budget</span>
                <span className={`${styles.footerValue} ${styles.budgetValue}`}>
                  ₹{job.salary_min ? (job.salary_min/1000).toFixed(0) : '—'}k - ₹{job.salary_max ? (job.salary_max/1000).toFixed(0) : '—'}k /month
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className={`${styles.cardBlock} ${styles.infoSection}`}>
          <h3 className={styles.sectionTitle}>Description</h3>
          <p className={styles.sectionText}>
            {displayValue(job.description) || `${displayValue(job.organisation_name)} is seeking a qualified ${displayValue(job.title)} for its facility in ${displayValue(job.org_city)}.`}
          </p>
        </section>

        {/* Responsibilities */}
        {job.responsibilities && (
          <section className={`${styles.cardBlock} ${styles.infoSection}`}>
            <h3 className={styles.sectionTitle}>Responsibilities</h3>
            <ul className={styles.bulletList}>
              {cleanList(job.responsibilities).map((req, i) => (
                <li key={i}>{req.replace(/^[-\*•]\s*/, '')}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Qualifications */}
        {job.qualifications && (
          <section className={`${styles.cardBlock} ${styles.infoSection}`}>
            <h3 className={styles.sectionTitle}>Qualifications</h3>
            <ul className={styles.bulletList}>
              {cleanList(job.qualifications).map((qual, i) => (
                <li key={i}>{qual.replace(/^[-\*•]\s*/, '')}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Required Documents — Admin gets Download only */}
        <section className={`${styles.cardBlock} ${styles.infoSection}`}>
          <h3 className={styles.sectionTitle}>Required Documents</h3>
          <div className={styles.docList}>
            {requirements.map((doc, idx) => (
              <div key={idx} className={styles.docItem}>
                <div className={styles.docInfo}>
                  <FileText size={18} className={styles.docIcon} />
                  <div>
                    <span className={styles.docName}>{doc.title}</span>
                    <span className={styles.docMeta}>{doc.types}</span>
                  </div>
                </div>
                <button className={styles.docDownloadBtn} onClick={() => toast('Document download not available yet', { icon: '📄' })}>
                  <Download size={14} /> Download
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Hospital Widget */}
        <section className={styles.hospitalWidget}>
          <div className={styles.hospitalIcon}>
            <Building size={24} />
          </div>
          <div className={styles.hospitalInfo}>
            <a href="#" className={styles.hospitalLink}>
              About {displayValue(job.organisation_name)} <ExternalLink size={14} />
            </a>
            <p className={styles.hospitalDesc}>
              {displayValue(job.organisation_about) || 'A leading multi-specialty hospital with state-of-the-art facilities and a strong commitment to patient care.'}
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default JobDetails;
