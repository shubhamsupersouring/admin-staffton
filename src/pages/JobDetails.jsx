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
  FileText,
  ArrowUpRight,
  Workflow,
  Briefcase,
  Calendar,
  Award,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './JobDetails.module.css';
import { jobService } from '../services/job.service';
import { useBreadcrumbDetail } from '../contexts/BreadcrumbDetailContext';
import { AdminDashboardSkeleton } from '../components/Skeleton';
import { formatCompensation } from '../utils/formatCompensation';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setDetailLabel } = useBreadcrumbDetail();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const data = await jobService.getJobDetails(id);
        setJob(data.data);
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
    if (Array.isArray(text)) return text.filter(l => typeof l === 'string' && l.trim().length > 0);
    if (typeof text !== 'string') return [];
    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
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
    <div >
      {/* Top Navigation */}
      <header className={styles.topNav}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Jobs
        </button>
      </header>

      {/* Hero Header Section */}
      <section className={styles.profileHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.orgIconBox}>
            <Briefcase size={36} />
          </div>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <h1 className={`${styles.title} whitespace-pre-wrap wrap-break-word [word-break:break-word]`}>
                {displayValue(job.title)}
              </h1>
              <span className={`${styles.statusPill} ${(job.status === 'active' || job.status === 'posted') ? styles.approved : styles.pending}`}>
                {job.status || 'draft'}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaTag}>
                <Building size={14} /> {displayValue(job.organisation_name)}
              </span>
              <span className={styles.metaTag}>
                <MapPin size={14} /> {displayValue(job.org_city) || displayValue(job.city) || 'Remote'}
              </span>
              <span className={styles.metaTag}>
                <Clock size={14} /> Posted {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {job.status !== 'draft' && (
          <div className={styles.headerActions}>
            <button className={styles.pipelineBtn} onClick={() => navigate(`/pipeline?jobId=${job.id}`)}>
              <Workflow size={16} /> Go to Pipeline
            </button>
          </div>
        )}
      </section>

      {/* Two-Column Grid */}
      <div className={styles.detailGrid}>

        {/* Left Column: Core Job Details */}
        <div className={styles.mainContent}>
          {/* Tags Section */}
          <div className={styles.sectionCard} style={{ padding: '24px' }}>
            <span className={styles.sectionLabel}>Job Categorization</span>
            <div className={styles.tagsRow} style={{ marginTop: '12px', marginBottom: 0 }}>
              {displayValue(job.profession) ? <span className={styles.tag}>{displayValue(job.profession)}</span> : null}
              {displayValue(job.specialisation) ? <span className={styles.tag}>{displayValue(job.specialisation)}</span> : null}
              {displayValue(job.shift) ? <span className={styles.tag}>{displayValue(job.shift)}</span> : null}
              {Array.isArray(job.job_type) ? job.job_type.map((t, idx) => (
                displayValue(t) ? <span key={t?.id || idx} className={styles.tag}>{displayValue(t)}</span> : null
              )) : (displayValue(job.job_type) ? <span className={styles.tag}>{displayValue(job.job_type)}</span> : <span className={styles.tag}>Full-Time</span>)}
            </div>
          </div>

          {/* Description Section */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><FileText size={18} /></div>
              <h2 className={styles.sectionTitle}>Job Description</h2>
            </div>
            <div className={styles.sectionBody}>
              <p className={styles.aboutText}>
                {displayValue(job.description) || `${displayValue(job.organisation_name)} is seeking a qualified ${displayValue(job.title)} for its facility in ${displayValue(job.org_city)}.`}
              </p>
            </div>
          </section>

          {/* Responsibilities Section */}
          {job.responsibilities && cleanList(job.responsibilities).length > 0 && (
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}><CheckCircle2 size={18} /></div>
                <h2 className={styles.sectionTitle}>Key Responsibilities</h2>
              </div>
              <div className={styles.sectionBody}>
                <ul className={styles.bulletList}>
                  {cleanList(job.responsibilities).map((item, idx) => (
                    <li key={idx} className={styles.bulletItem}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Qualifications Section */}
          {job.qualifications && cleanList(job.qualifications).length > 0 && (
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}><Award size={18} /></div>
                <h2 className={styles.sectionTitle}>Required Qualifications</h2>
              </div>
              <div className={styles.sectionBody}>
                <ul className={styles.bulletList}>
                  {cleanList(job.qualifications).map((item, idx) => (
                    <li key={idx} className={styles.bulletItem}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Required Documents Section */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><ShieldCheck size={18} /></div>
              <h2 className={styles.sectionTitle}>Required Documents</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.docList}>
                {requirements.map((doc, idx) => (
                  <div key={idx} className={styles.docItemCard}>
                    <div className={styles.docIcon}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.docInfo}>
                      <span className={styles.docType}>{doc.title}</span>
                      <span className={styles.docName}>{doc.types}</span>
                    </div>
                    <button className={styles.docDownload} onClick={() => toast('Document download not available yet', { icon: '📄' })} title="Download template">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <aside className={styles.sideContent}>
          {/* Quick Metrics / Stats Widget */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Calendar size={18} /></div>
              <h2 className={styles.sectionTitle}>Job Overview</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.tagGrid}>
                <div className={styles.dataTag}>
                  <span className={styles.tagLabel}>Experience Required</span>
                  <span className={styles.tagValue}>
                    {job.experience_min_yrs || 0} - {job.experience_max_yrs || 5} Years
                  </span>
                </div>
                <div className={styles.dataTag}>
                  <span className={styles.tagLabel}>Compensation Budget</span>
                  <span className={`${styles.tagValue} ${styles.budgetValue}`}>
                    {formatCompensation(job.salary_min)} - {formatCompensation(job.salary_max, { withCurrencyPrefix: false })}/mo
                  </span>
                </div>
              </div>
            </div>
          </section>

        </aside>

      </div>
    </div>
  );
};

export default JobDetails;
