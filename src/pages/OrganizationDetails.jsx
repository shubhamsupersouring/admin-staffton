import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate 
} from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Circle,
  Calendar,
  Layers,
  Activity,
  Briefcase,
  Heart,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './OrganizationDetails.module.css';
import apiClient from '../services/apiClient';
import { OrganizationDetailsSkeleton } from '../components/Skeleton';
import { useBreadcrumbDetail } from '../contexts/BreadcrumbDetailContext';
import Modal from '../components/Modal/Modal';

const OrganizationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setDetailLabel } = useBreadcrumbDetail();
  const [data, setData] = useState(null);
  const [orgJobs, setOrgJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, jobs, users
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    type: null, // 'approve' or 'reject'
    reason: '' 
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [orgRes, jobsRes] = await Promise.all([
          apiClient.get(`/admin/organizations/${id}`),
          apiClient.get('/admin/jobs', { params: { organization_id: id } })
        ]);
        setData(orgRes.data.data);
        setOrgJobs(jobsRes.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch data');
        navigate('/organizations');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  useEffect(() => {
    if (data?.organisation?.name) {
      setDetailLabel(data.organisation.name);
    }
    return () => setDetailLabel(null);
  }, [data?.organisation?.name, setDetailLabel]);

  const handleUpdateStatus = async (status, reason = null) => {
    setUpdating(true);
    try {
      await apiClient.patch(`/admin/verifications/${id}`, { status, reason });
      toast.success(`Organization ${status} successfully`);
      setConfirmModal({ isOpen: false, type: null, reason: '' });
      // Refresh data
      const res = await apiClient.get(`/admin/organizations/${id}`);
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusPill = (status) => {
    if (!status) return <span className={styles.statusPill}>Unknown</span>;
    const s = status.toLowerCase();
    switch(s) {
      case 'active':
      case 'approved': 
        return <span className={`${styles.statusPill} ${styles.approved}`}>Approved</span>;
      case 'pending': 
        return <span className={`${styles.statusPill} ${styles.pending}`}>Pending</span>;
      case 'under_review': 
        return <span className={`${styles.statusPill} ${styles.under_review}`}>Reviewing</span>;
      case 'rejected': 
        return <span className={`${styles.statusPill} ${styles.rejected}`}>Rejected</span>;
      default: 
        return <span className={styles.statusPill}>{status}</span>;
    }
  };

  if (loading) return <OrganizationDetailsSkeleton />;
  if (!data) return null;

  const { organisation, documents, members, invitation, onboarding, onboardingSteps = [], verificationFlags = [], latestVerification } = data;

  const JobCard = ({ job }) => {
    const displayValue = (val) => {
      if (!val) return '';
      if (typeof val === 'object') return val.name || val.title || val.label || val.value || '';
      return val;
    };

    return (
      <div className={styles.jobCard} onClick={() => navigate(`/jobs/${job.id}`)} style={{ cursor: 'pointer' }}>
        <div className={styles.cardTop}>
          <span className={styles.postedTime}>
            <Clock size={14} /> Posted {new Date(job.created_at).toLocaleDateString()}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize', background: job.status === 'active' ? '#f0fff4' : '#fffaf0', color: job.status === 'active' ? '#16a34a' : '#d97706' }}>
            {job.status || 'draft'}
          </span>
        </div>
        <div className={styles.cardMain}>
          <h2 className={styles.jobTitle}>{displayValue(job.title)}</h2>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <MapPin size={16} className={styles.metaIcon} /> {displayValue(job.city) || 'Remote'}
            </span>
            <span className={styles.metaItem}>
              <Building size={16} className={styles.metaIcon} /> {organisation.name}
            </span>
            {job.isUrgent && <span className={styles.urgentBadge}>Urgent</span>}
          </div>
          <div className={styles.tagsRow}>
            {displayValue(job.profession) ? <span className={styles.tag}>{displayValue(job.profession)}</span> : null}
            {displayValue(job.specialisation) ? <span className={styles.tag}>{displayValue(job.specialisation)}</span> : null}
            {displayValue(job.job_type) ? <span className={styles.tag}>{displayValue(job.job_type)}</span> : <span className={styles.tag}>Full-Time</span>}
          </div>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.footerDetails}>
            <div className={styles.footerGroup}>
              <span className={styles.footerLabel}>Experience</span>
              <span className={styles.footerValue}>{job.experience_min_yrs || 0} - {job.experience_max_yrs || 5} years</span>
            </div>
            <div className={styles.footerGroup}>
              <span className={styles.footerLabel}>Budget</span>
              <span className={`${styles.footerValue} ${styles.budgetValue}`}>
                ₹{(job.salary_min/1000).toFixed(0)}k - ₹{(job.salary_max/1000).toFixed(0)}k /month
              </span>
            </div>
          </div>
          <button className={styles.applyBtn} onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }}>View Details</button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.topNav}>
        <button className={styles.backBtn} onClick={() => navigate('/organizations')}>
          <ArrowLeft size={16} /> Back to Organizations
        </button>
      </header>

      {/* Hero Header Section */}
      <section className={styles.profileHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.orgIconBox}>
            <Building size={36} />
          </div>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{organisation.name}</h1>
              {getStatusPill(organisation.verification_status)}
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaTag}><Layers size={14} /> Medical Facility</span>
              <span className={styles.metaTag}><MapPin size={14} /> {organisation.city}, {organisation.state}</span>
              <span className={styles.metaTag}><Calendar size={14} /> Joined {new Date(organisation.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.rejectBtn} 
            disabled={updating || organisation.verification_status === 'rejected'}
            onClick={() => setConfirmModal({ isOpen: true, type: 'rejected', reason: '' })}
          >
            <ShieldAlert size={18} /> Reject
          </button>
          <button 
            className={styles.approveBtn} 
            disabled={updating || organisation.verification_status === 'approved'}
            onClick={() => setConfirmModal({ isOpen: true, type: 'approved', reason: '' })}
          >
            <ShieldCheck size={18} /> Approve
          </button>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav className={styles.tabsContainer}>
        <button 
          className={`${styles.tabItem} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Organization Details
        </button>
        <button 
          className={`${styles.tabItem} ${activeTab === 'jobs' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Jobs <span className={styles.tabBadge}>{orgJobs.length}</span>
        </button>
        <button 
          className={`${styles.tabItem} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users <span className={styles.tabBadge}>{members.length}</span>
        </button>
      </nav>

      <div className={styles.detailGrid}>
        <div className={styles.mainContent}>
          {activeTab === 'overview' && (
            <>
          
          {/* Section 1: Identity */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Building size={18} /></div>
              <h2 className={styles.sectionTitle}>Identity & Bio</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.bioGroup}>
                <span className={styles.sectionLabel}>Facility overview</span>
                <p className={organisation.about ? styles.aboutText : styles.placeholderText}>
                  {organisation.about || 'No facility description provided yet.'}
                </p>
              </div>
              <div className={styles.tagGrid}>
                <div className={styles.dataTag}>
                  <span className={styles.tagLabel}>Org Type</span>
                  <span className={styles.tagValue}>{organisation.org_type || 'Facility'}</span>
                </div>
                <div className={styles.dataTag}>
                  <span className={styles.tagLabel}>Plan</span>
                  <span className={styles.tagValue}>{organisation.plan_type || 'Standard'}</span>
                </div>
                <div className={styles.dataTag}>
                  <span className={styles.tagLabel}>Status</span>
                  <span className={styles.tagValue} style={{color: organisation.is_active ? 'var(--active)' : 'var(--suspended)'}}>
                    {organisation.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Compliance */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><ShieldCheck size={18} /></div>
              <h2 className={styles.sectionTitle}>Compliance & Legal</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.fieldsGrid}>
                <div className={styles.fieldItem}>
                  <label>GST Number</label>
                  <span>{organisation.gst_number || 'Not Provided'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <label>License Number</label>
                  <span>{organisation.license_number || 'Not Provided'}</span>
                </div>
              </div>

              <div className={styles.documentArea}>
                <span className={styles.sectionLabel}>Verification documents</span>
                <div className={styles.docGrid}>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <div key={doc.id} className={styles.docItemCard}>
                        <div className={styles.docIcon}><FileText size={20} /></div>
                        <div className={styles.docInfo}>
                          <span className={styles.docType}>{doc.document_type.replace(/_/g, ' ')}</span>
                          <span className={styles.docName} title={doc.file_name}>{doc.file_name}</span>
                        </div>
                        {doc.status === 'needs_reupload' && (
                          <span className={`${styles.statusPill} ${styles.rejected}`} style={{fontSize: '9px', padding: '2px 6px'}}>Reupload</span>
                        )}
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className={styles.docDownload}>
                          <Download size={16} />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyNotice} style={{padding: '24px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--border)'}}>
                      <AlertCircle size={20} style={{color: 'var(--text-light)', marginBottom: '8px'}} />
                      <p style={{fontSize: '13px', color: 'var(--text-muted)'}}>Awaiting legal documentation</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Contact */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><MapPin size={18} /></div>
              <h2 className={styles.sectionTitle}>Contact & Location</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.fieldsGrid}>
                <div className={styles.fieldItem}>
                  <label>Website</label>
                  <a href={organisation.website_url} target="_blank" rel="noreferrer" className={styles.linkText}>
                    {organisation.website_url || 'N/A'} <ExternalLink size={12} />
                  </a>
                </div>
                <div className={styles.fieldItem}>
                  <label>Phone Number</label>
                  <span>{organisation.phone || 'N/A'}</span>
                </div>
              </div>
              <div className={styles.addressArea}>
                <span className={styles.sectionLabel}>Full Address</span>
                <p>
                  {organisation.address_line_1}
                  {organisation.address_line_2 ? `, ${organisation.address_line_2}` : ''}
                  <br />
                  {organisation.city}, {organisation.state} - {organisation.pincode}
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Onboarding (Vertical Stepper) */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Activity size={18} /></div>
              <h2 className={styles.sectionTitle}>Onboarding Tracker</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.tagGrid} style={{marginBottom: '32px'}}>
                <div className={styles.dataTag}>
                  <span className={styles.tagLabel}>Verification</span>
                  <span className={styles.tagValue}>{organisation.verification_status || 'pending'}</span>
                </div>
                <div className={styles.dataTag}>
                  <span className={styles.tagLabel}>Features</span>
                  <span className={styles.tagValue}>{onboarding?.features_locked ? 'Locked' : 'Unlocked'}</span>
                </div>
                <div className={styles.dataTag}>
                  <span className={styles.tagLabel}>Invitation</span>
                  <span className={styles.tagValue}>{onboarding?.invitation_status || 'N/A'}</span>
                </div>
              </div>

              {onboardingSteps.length > 0 && (
                <div className={styles.stepFlow}>
                  <span className={styles.sectionLabel}>Onboarding Progress</span>
                  <div className={styles.stepVerticalList}>
                    {onboardingSteps.map((step, idx) => (
                      <div key={step.key} className={`${styles.stepItem} ${step.completed ? styles.stepDone : ''}`}>
                        <div className={styles.stepIndicator}>
                          {step.completed ? <CheckCircle size={14} /> : <Circle size={14} />}
                        </div>
                        <div className={styles.stepContent}>
                          <p className={styles.stepTitle}>{step.title}</p>
                          <p className={styles.stepDesc}>
                            {step.note || `Step ${idx + 1} of the onboarding process.`}
                          </p>
                          {step.meta && (
                            <span className={styles.stepMeta}>
                              {step.key === 'review_submit' ? new Date(step.meta).toLocaleString() : step.meta}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

            </>
          )}

          {activeTab === 'jobs' && (
            <div className={styles.tabJobsList}>
              {orgJobs.length > 0 ? (
                orgJobs.map(job => <JobCard key={job.id} job={job} />)
              ) : (
                <div className={styles.emptyJobs}>
                  <h3>No jobs posted yet</h3>
                  <p>This organization hasn't published any job opportunities on the platform.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className={styles.usersGrid}>
              {members.map(member => (
                <div key={member.id} className={styles.teamMember} style={{padding: '24px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px'}}>
                  <div className={styles.avatar} style={{width: '64px', height: '64px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', color: 'white', borderRadius: '50%'}}>
                    {member.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.memberMeta}>
                    <p style={{fontSize: '18px', fontWeight: '800', color: 'var(--navy)', margin: '0 0 4px 0'}}>{member.full_name}</p>
                    <p style={{fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 8px 0'}}>{member.email}</p>
                    <span className={styles.statusPill} style={{padding: '4px 12px', fontSize: '11px'}}>Administrator</span>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className={styles.emptyJobs}>
                  <p>No active team members registered.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className={styles.sideContent}>
          {/* Admin Widget */}
          <section className={`${styles.sectionCard} ${styles.navySection}`}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Mail size={18} /></div>
              <h2 className={styles.sectionTitle}>Admin Team</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.teamList}>
                {members.map(member => (
                  <div key={member.id} className={styles.teamMember}>
                    <div className={styles.avatar}>{member.full_name?.charAt(0).toUpperCase()}</div>
                    <div className={styles.memberMeta}>
                      <span className={styles.memberName}>{member.full_name}</span>
                      <span className={styles.memberEmail}>{member.email}</span>
                    </div>
                  </div>
                ))}
                {members.length === 0 && invitation && (
                  <div className={styles.teamMember}>
                    <div className={styles.avatar} style={{background: 'var(--bg)', color: 'var(--text-muted)'}}>
                      {invitation.contact_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.memberMeta}>
                      <span className={styles.memberName}>{invitation.contact_name}</span>
                      <span className={styles.memberEmail}>{invitation.contact_email} (Invited)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Timeline Widget */}
          <section className={`${styles.sectionCard} ${styles.navySection}`}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Timer size={18} /></div>
              <h2 className={styles.sectionTitle}>Account Timeline</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.stepVerticalList} style={{paddingLeft: '0', marginTop: '0'}}>
                <div className={`${styles.stepItem} ${styles.stepDone}`}>
                  <div className={styles.stepIndicator} style={{width: '24px', height: '24px'}}><Clock size={12} /></div>
                  <div className={styles.stepContent}>
                    <p className={styles.stepTitle} style={{fontSize: '14px'}}>Created</p>
                    <span className={styles.stepMeta}>{new Date(organisation.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {organisation.submitted_at && (
                  <div className={`${styles.stepItem} ${styles.stepDone}`}>
                    <div className={styles.stepIndicator} style={{width: '24px', height: '24px'}}><Activity size={12} /></div>
                    <div className={styles.stepContent}>
                      <p className={styles.stepTitle} style={{fontSize: '14px'}}>Submitted</p>
                      <span className={styles.stepMeta}>{new Date(organisation.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.type === 'approved' ? 'Confirm Approval' : 'Rejection Details'}
      >
        <div className={styles.modalContent}>
          {confirmModal.type === 'approved' ? (
            <div className={styles.confirmWrapper}>
              <AlertCircle size={40} className={styles.warnIcon} />
              <p>Are you sure you want to approve <strong>{organisation.name}</strong>? This will grant them full access to the platform.</p>
              <div className={styles.modalActions}>
                <button 
                  className={styles.modalCancel} 
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                >
                  Cancel
                </button>
                <button 
                  className={styles.modalConfirm} 
                  disabled={updating}
                  onClick={() => handleUpdateStatus('approved')}
                >
                  Confirm Approve
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.rejectWrapper}>
              <label className={styles.modalLabel}>Reason for Rejection</label>
              <textarea 
                className={styles.reasonInput}
                placeholder="e.g., Documents are unclear or expired..."
                value={confirmModal.reason}
                onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
              />
              <p className={styles.modalHelp}>This reason will be visible to the organization owner.</p>
              <div className={styles.modalActions}>
                <button 
                  className={styles.modalCancel} 
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                >
                  Cancel
                </button>
                <button 
                  className={styles.modalReject} 
                  disabled={updating || !confirmModal.reason.trim()}
                  onClick={() => handleUpdateStatus('rejected', confirmModal.reason)}
                >
                  {updating ? 'Processing...' : 'Reject Organization'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OrganizationDetails;
