import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  Mail,
  Phone,
  FileText,
  Clock,
  Download,
  AlertCircle,
  Award,
  CircleDot,
  Building,
  ArrowUpRight,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { useBreadcrumbDetail } from '../contexts/BreadcrumbDetailContext';
import { OrganizationDetailsSkeleton } from '../components/Skeleton';
import { Avatar } from '../utils/avatar';
import styles from './Candidate-Detail.module.css';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Map status to CSS module classes
const getStatusClass = (status) => {
  if (!status) return styles.badge;
  const s = status.toLowerCase();
  switch (s) {
    case 'hired':
      return `${styles.badge} ${styles.badgeHired}`;
    case 'offered':
      return `${styles.badge} ${styles.badgeOffered}`;
    case 'shortlisted':
      return `${styles.badge} ${styles.badgeShortlisted}`;
    case 'interview':
      return `${styles.badge} ${styles.badgeInterview}`;
    case 'under_review':
      return `${styles.badge} ${styles.badgeUnderReview}`;
    case 'applied':
      return `${styles.badge} ${styles.badgeApplied}`;
    case 'rejected':
      return `${styles.badge} ${styles.badgeRejected}`;
    case 'offer_declined':
      return `${styles.badge} ${styles.badgeOfferDeclined}`;
    default:
      return styles.badge;
  }
};

const formatStatusText = (status) => {
  if (!status) return 'Applied';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setDetailLabel } = useBreadcrumbDetail();
  
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      if (!id) return;
      try {
        const response = await apiClient.get(`/admin/candidates/${id}`);
        const responseData = response.data;
        
        if (responseData && responseData.success) {
          setCandidate(responseData.data);
        } else {
          toast.error(responseData.message || 'Failed to fetch candidate details');
          navigate('/candidates');
        }
      } catch (error) {
        console.error('Error fetching candidate details:', error);
        toast.error('Something went wrong while loading candidate details');
        navigate('/candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [id, navigate]);

  // Set the breadcrumb label dynamically when candidate details load
  useEffect(() => {
    const fullName = candidate?.fullName || candidate?.full_name;
    if (fullName) {
      setDetailLabel(fullName);
    }
    return () => setDetailLabel(null);
  }, [candidate, setDetailLabel]);

  if (loading) {
    return <OrganizationDetailsSkeleton />;
  }

  if (!candidate) {
    return (
      <div className={styles.errorCard}>
        <AlertCircle size={48} className={styles.errorIcon} />
        <h3 className={styles.errorTitle}>Candidate Not Found</h3>
        <p className={styles.errorDesc}>The candidate details could not be found or loaded.</p>
        <button
          onClick={() => navigate('/candidates')}
          className={styles.errorBackBtn}
        >
          <ArrowLeft size={16} /> Back to Candidate Management
        </button>
      </div>
    );
  }

  // Extract variables with fallbacks to cover any variation of API responses
  const fullName = candidate.fullName || candidate.full_name || 'Candidate';
  const role = candidate.role || candidate.primary_role || 'Not Specified';
  const experience = candidate.experience || (candidate.years_experience !== undefined ? `${candidate.years_experience} Years` : 'N/A');
  const city = candidate.city || '';
  const state = candidate.state || '';
  const location = city && state ? `${city}, ${state}` : (city || state || 'N/A');
  const availability = candidate.availability || candidate.availability_to_join || 'Immediately Available';
  const lastWorkplace = candidate.lastWorkplace || candidate.current_employer || 'Not Provided';
  const about = candidate.about || candidate.bio || 'Dedicated healthcare professional.';
  const email = candidate.email || 'N/A';
  const mobile = candidate.mobile || 'N/A';
  const documents = candidate.documents || [];
  const openToGlobal = candidate.openToGlobal !== undefined ? candidate.openToGlobal : candidate.open_to_global;
  const preferredCountries = candidate.preferredCountries || candidate.preferred_countries || [];
  
  // Extract applications or applied jobs with fallback
  const applications = candidate.applications || candidate.appliedJobs || candidate.applied_jobs || [];

  // Extract skills (handles array of strings or objects)
  let skillsList = [];
  const rawSkills = candidate.skills || candidate.primary_specialisation || candidate.specialisation || [];
  if (Array.isArray(rawSkills)) {
    skillsList = rawSkills.map(skill => {
      if (skill && typeof skill === 'object') {
        return skill.name || skill.skillName || skill.title || skill.label || JSON.stringify(skill);
      }
      return skill || '';
    }).filter(s => s !== '');
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <div className={styles.topNav}>
        <button
          onClick={() => navigate(-1)}
          className={styles.backBtn}
        >
          <ArrowLeft size={14} /> Back to Candidates
        </button>
      </div>

      {/* Hero Profile Header */}
      <section className={styles.profileHeader}>
        <div className={styles.headerInfo}>
          <Avatar name={fullName} imageUrl={candidate.profilePhoto} size="xl" />
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{fullName}</h1>
              <span className={`${styles.statusPill} ${candidate.has_applied ? styles.applied : styles.notApplied}`}>
                {candidate.has_applied ? 'Applied' : 'No Application'}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaTag}>
                <Briefcase size={14} className={styles.metaIcon} /> {role}
              </span>
              <span className={styles.metaTag}>
                <MapPin size={14} className={styles.metaIcon} /> {location}
              </span>
              <span className={styles.metaTag}>
                <Calendar size={14} className={styles.metaIcon} /> Registered {candidate.created_at ? formatDate(candidate.created_at) : 'Recently'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Grid */}
      <div className={styles.detailGrid}>
        {/* Left Column: Core Candidate Information */}
        <div className={styles.mainContent}>
          
          {/* Summary / About */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Award size={18} /></div>
              <h2 className={styles.sectionTitle}>Professional Summary</h2>
            </div>
            <div className={styles.sectionBody}>
              <p className={styles.aboutText}>
                {about}
              </p>
            </div>
          </section>

          {/* Skills & Specialisations */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><CircleDot size={18} /></div>
              <h2 className={styles.sectionTitle}>Skills & Specialisations</h2>
            </div>
            <div className={styles.sectionBody}>
              {skillsList.length > 0 ? (
                <div className={styles.skillsRow}>
                  {skillsList.map((skill, index) => (
                    <span
                      key={index}
                      className={styles.skillTag}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.aboutText} style={{ color: '#94a3b8', fontStyle: 'italic' }}>No specific skills listed.</p>
              )}
            </div>
          </section>

          {/* Global Placement Preferences */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Globe size={18} /></div>
              <h2 className={styles.sectionTitle}>Global Placement Preferences</h2>
            </div>
            <div className={styles.sectionBody}>
              {openToGlobal ? (
                <div className={styles.globalPreferences}>
                  <div className={styles.globalStatus}>
                    <span className={styles.globalIcon}>🌍</span>
                    <div>
                      <span className={styles.globalTitle}>Open to Global Opportunities</span>
                      <span className={styles.globalDesc}>This candidate is open to relocate and work internationally.</span>
                    </div>
                  </div>
                  {preferredCountries.length > 0 ? (
                    <div className={styles.countriesGroup}>
                      <h4 className={styles.countriesTitle}>Preferred Countries</h4>
                      <div className={styles.countriesRow}>
                        {preferredCountries.map((country, index) => (
                          <span key={index} className={styles.countryTag}>
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.countriesGroup}>
                      <h4 className={styles.countriesTitle}>Preferred Countries</h4>
                      <p className={styles.noCountriesText}>Open to any global destination (no specific countries selected).</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.notGlobalPreferences}>
                  <span className={styles.notGlobalIcon}>📍</span>
                  <div>
                    <span className={styles.globalTitleLocal}>Local Placement Only</span>
                    <span className={styles.globalDescLocal}>This candidate is only looking for opportunities within their current country.</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Applied Jobs Section (Redesigned) */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Briefcase size={18} /></div>
              <h2 className={styles.sectionTitle}>Applied Jobs & Applications</h2>
            </div>
            
            {applications.length > 0 ? (
              <div className={styles.appsList}>
                {applications.map((app, idx) => {
                  const jobTitle = app.jobTitle || app.job?.title || app.job_title || app.title || 'Unknown Job';
                  const jobOrg = app.organisationName || app.job?.organisation_name || app.organisation_name || app.company_name || 'Unknown Facility';
                  const appliedDate = app.appliedAt || app.created_at || app.applied_at || app.date;
                  const appStatus = app.status || app.application_status || 'applied';
                  const jobId = app.jobId || app.job?.id || app.job_id;
                  const normalizedStatus = appStatus.toLowerCase().replace(/ /g, '_');

                  return (
                    <div key={app.id || idx} className={styles.appCard}>
                      <div className={styles.appMainDetails}>
                        <div className={styles.appIconWrapper}>
                          <Briefcase size={20} />
                        </div>
                        <div className={styles.appMetaInfo}>
                          <span className={styles.appJobTitle}>{jobTitle}</span>
                          <span className={styles.appOrgName}>
                            <Building size={14} /> {jobOrg}
                          </span>
                          <span className={styles.appDateText}>
                            Applied on {formatDate(appliedDate)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.appActionsArea}>
                        <span className={getStatusClass(appStatus)}>
                          {formatStatusText(appStatus)}
                        </span>
                        {jobId && normalizedStatus !== 'offer_declined' ? (
                          <button
                            onClick={() => navigate(`/pipeline?jobId=${jobId}&tab=${normalizedStatus}`)}
                            className={styles.pipelineBtn}
                          >
                            Track Pipeline <ArrowUpRight size={14} />
                          </button>
                        ) : jobId ? null : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>No Job ID Link</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.noApplications}>
                <AlertCircle size={32} className={styles.noAppsIcon} />
                <h4 className={styles.noAppsTitle}>No Applications Tracked</h4>
                <p className={styles.noAppsDesc}>
                  This candidate has not applied for any active job listings on the platform yet.
                </p>
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Sidebar Stats and Info Widgets */}
        <div className={styles.sideContent}>
          
          {/* Quick Metrics Widget */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Clock size={18} /></div>
              <h2 className={styles.sectionTitle}>Candidate Overview</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.overviewGrid}>
                <div className={styles.overviewCard}>
                  <span className={styles.overviewLabel}>Experience Level</span>
                  <span className={styles.overviewValue}>{experience}</span>
                </div>
                <div className={styles.overviewCard}>
                  <span className={styles.overviewLabel}>Availability</span>
                  <span className={styles.overviewValue}>{availability}</span>
                </div>
                <div className={styles.overviewCard}>
                  <span className={styles.overviewLabel}>Last Workplace</span>
                  <span className={styles.overviewValue}>{lastWorkplace}</span>
                </div>
                <div className={styles.overviewCard}>
                  <span className={styles.overviewLabel}>Global Mobility</span>
                  <span className={styles.overviewValue}>{openToGlobal ? 'Open to Relocate' : 'Local Only'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Details Widget */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Mail size={18} /></div>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.contactList}>
                <div className={styles.contactBlock}>
                  <span className={styles.contactLabel}>Email Address</span>
                  <a
                    href={`mailto:${email}`}
                    className={styles.contactLink}
                  >
                    <Mail size={14} className={styles.contactIcon} />
                    {email}
                  </a>
                </div>
                <div className={styles.contactBlock}>
                  <span className={styles.contactLabel}>Mobile Phone</span>
                  <a
                    href={`tel:${mobile}`}
                    className={styles.contactLink}
                  >
                    <Phone size={14} className={styles.contactIcon} />
                    {mobile}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Uploaded Documents Widget */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><FileText size={18} /></div>
              <h2 className={styles.sectionTitle}>Uploaded Documents</h2>
            </div>
            <div className={styles.sectionBody}>
              {documents.length > 0 ? (
                <div className={styles.docList}>
                  {documents.map((doc, idx) => {
                    const docName = doc.name || doc.file_name || `document_${idx + 1}`;
                    const docType = doc.type || doc.document_type || 'PDF Document';
                    const docUrl = doc.url || doc.file_url;

                    return (
                      <div
                        key={doc.id || idx}
                        className={styles.docItem}
                      >
                        <div className={styles.docIconContainer}>
                          <FileText size={18} />
                        </div>
                        <div className={styles.docMeta}>
                          <span
                            className={styles.docName}
                            title={docName}
                          >
                            {docName}
                          </span>
                          <span className={styles.docType}>
                            {docType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {docUrl && (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.downloadBtn}
                            title="Download Document"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.noDocsContainer}>
                  <AlertCircle size={24} className={styles.noDocsIcon} />
                  <span className={styles.noDocsText}>No legal files uploaded yet.</span>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
