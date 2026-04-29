import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  Briefcase, 
  Activity,
  ShieldCheck, 
  Plus,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './AdminDashboard.module.css';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal/Modal';
import {
  AdminDashboardSkeleton,
  FormOverlayContainer,
  FormSubmitOverlay,
} from '../components/Skeleton';

const StatCard = ({ icon, value, label, sub, colorClass, onClick }) => (
  <div className={styles.statCard} onClick={onClick}>
    <div className={`${styles.statIcon} ${colorClass}`}>
      {icon}
    </div>
    <div className={styles.statContent}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  </div>
);

const PIE_COLORS = ['#0FB8A4', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#9CA3AF'];

const PieChartCard = ({ title, subtitle, data }) => {
  const safeData = Array.isArray(data) ? data.filter((item) => Number(item.value) > 0) : [];
  const total = safeData.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const chartBackground = total
    ? `conic-gradient(${safeData
        .map((item, index) => {
          const value = Number(item.value || 0);
          const start = safeData.slice(0, index).reduce((sum, curr) => sum + Number(curr.value || 0), 0);
          const startPct = (start / total) * 100;
          const endPct = ((start + value) / total) * 100;
          return `${PIE_COLORS[index % PIE_COLORS.length]} ${startPct}% ${endPct}%`;
        })
        .join(', ')})`
    : '#E5E7EB';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
        <span className={styles.cardMeta}>Total: {total}</span>
      </div>
      <div className={styles.chartContent}>
        <p className={styles.chartSubtitle}>{subtitle}</p>
        {total > 0 ? (
          <div className={styles.pieWrap}>
            <div className={styles.pieChart} style={{ background: chartBackground }}>
              <div className={styles.pieHole} />
            </div>
            <div className={styles.legendList}>
              {safeData.map((item, index) => {
                const value = Number(item.value || 0);
                const percent = Math.round((value / total) * 100);
                return (
                  <div key={`${item.name}-${index}`} className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className={styles.legendName}>{item.name}</span>
                    <span className={styles.legendValue}>{value}</span>
                    <span className={styles.legendPercent}>{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.emptyChart}>No data available</div>
        )}
      </div>
    </div>
  );
};

const DailyActivityCard = ({ title, subtitle, data }) => {
  const safeData = Array.isArray(data) ? data : [];
  const maxValue = safeData.reduce((max, item) => Math.max(max, Number(item.value || 0)), 0);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
      </div>
      <div className={styles.chartContent}>
        <p className={styles.chartSubtitle}>{subtitle}</p>
        {safeData.length > 0 ? (
          <div className={styles.barChart}>
            {safeData.map((item) => {
              const value = Number(item.value || 0);
              const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 6) : 6;
              return (
                <div key={item.label} className={styles.barColumn}>
                  <div className={styles.barValue}>{value}</div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ height: `${height}%` }} />
                  </div>
                  <div className={styles.barLabel}>{item.label}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyChart}>No trend available</div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    candidates: 0,
    organisations: 0,
    pendingVerifications: 0,
    jobs: 0
  });
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ org_name: '', contact_name: '', contact_email: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, verificationsRes] = await Promise.all([
          apiClient.get('/admin/dashboard-stats'),
          apiClient.get('/admin/verifications', { params: { limit: 5 } })
        ]);
        setStats(statsRes.data.data);
        setVerifications(verificationsRes.data.data.verifications || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/admin/invitations', formData);
      toast.success('Organization invited successfully!');
      setIsInviteModalOpen(false);
      setFormData({ org_name: '', contact_name: '', contact_email: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AdminDashboardSkeleton />;

  const activitySeries =
    (Array.isArray(stats.dailyActiveUsersTrend) && stats.dailyActiveUsersTrend.length > 0
      ? stats.dailyActiveUsersTrend
      : Array.isArray(stats.registrationTrend)
      ? stats.registrationTrend.map((point) => ({
          label: point.date,
          value: Number(point.candidates || 0) + Number(point.organizations || 0),
        }))
      : []
    ).slice(-7);

  return (
    <div className={styles.dashboard}>
      <header className={styles.welcomeHeader}>
        <div>
          <h1 className={styles.title}>Welcome back, Admin 👋</h1>
          <p className={styles.subtitle}>Here's what's happening on the platform today.</p>
        </div>
        <button className={styles.primaryAction} onClick={() => setIsInviteModalOpen(true)}>
          <Plus size={16} />
          Invite Organization
        </button>
      </header>

      {stats.pendingVerifications > 0 && (
        <div className={styles.alertBanner} onClick={() => navigate('/organizations')}>
          <span className={styles.alertIcon}>⚠️</span>
          <span className={styles.alertText}>
            <strong>{stats.pendingVerifications} organizations</strong> have been pending verification. Review and take action.
          </span>
          <span className={styles.alertAction}>Review now →</span>
        </div>
      )}

      <div className={styles.statsWrapper}>
        <div className={styles.statsGrid}>
          <StatCard 
            icon={<Building size={19} />} 
            value={stats.organisations || 0} 
            label="Registered Organizations" 
            sub="Total orgs onboarded"
            colorClass={styles.iconTeal}
            onClick={() => navigate('/organizations')}
          />
          <StatCard 
            icon={<ShieldAlert size={19} />} 
            value={stats.pendingVerifications || 0} 
            label="Pending Verifications" 
            sub="Awaiting Super Admin approval"
            colorClass={styles.iconPending}
            onClick={() => navigate('/organizations')}
          />
          <StatCard 
            icon={<Users size={19} />} 
            value={stats.candidates || 0} 
            label="Total Candidates" 
            sub="Registered on platform"
            colorClass={styles.iconActive}
          />
          <StatCard 
            icon={<Briefcase size={19} />} 
            value={stats.jobs || 0} 
            label="Live Job Postings" 
            sub="Currently accepting applications"
            colorClass={styles.iconBlue}
          />
          <StatCard 
            icon={<Activity size={19} />} 
            value={stats.dauYesterday || 0} 
            label="Yesterday Active Users" 
            sub="Daily Active Users (before today)"
            colorClass={styles.iconTeal}
          />
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <PieChartCard
          title="People on Platform"
          subtitle="Breakdown by candidate primary role"
          data={stats.peopleByRole}
        />
        <PieChartCard
          title="Hospital Status"
          subtitle="Organizations grouped by registration stage"
          data={stats.hospitalByStatus}
        />
        <DailyActivityCard
          title="Daily Active Users"
          subtitle={
            Array.isArray(stats.dailyActiveUsersTrend) && stats.dailyActiveUsersTrend.length > 0
              ? 'Day-wise platform visits before current day'
              : 'Day-wise trend from available dashboard data'
          }
          data={activitySeries}
        />
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Organization Verification Queue</span>
            <span className={styles.cardLink} onClick={() => navigate('/organizations')}>View all</span>
          </div>
          <div className={styles.verifQueue}>
            {verifications.length > 0 ? (
              verifications.map((org) => (
                <div key={org.id} className={styles.verifItem}>
                  <div className={styles.verifAvatar}>
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.verifInfo}>
                    <div className={`${styles.verifName} whitespace-pre-wrap break-all`}>{org.name}</div>
                    <div className={styles.verifMeta}>
                      <span className={styles.metaLabel}>
                        <MapPin size={13} /> {org.city || 'Location Pending'}
                      </span>
                      <span className={styles.metaDivider}>|</span>
                      <span className={styles.metaLabel}>
                        <Building size={13} /> {org.org_type || 'Facility'}
                      </span>
                    </div>
                    {/* Add overdue logic if needed */}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <div className={styles.verifDate}>{new Date(org.created_at).toLocaleDateString()}</div>
                    <span className={styles.badgePending}>PENDING</span>
                    <button 
                      className={styles.reviewBtn} 
                      onClick={() => navigate(`/organizations/${org.id}`)}
                    >
                      Review Docs
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyFeed}>
                <div className={styles.emptyIconBox}>
                  <ShieldCheck size={32} />
                </div>
                <h3>All caught up!</h3>
                <p>No organizations are currently awaiting verification.</p>
                <button className={styles.secondaryBtn} onClick={() => navigate('/organizations')}>
                  View Registry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        title="Invite New Organization"
      >
        <FormOverlayContainer>
          <FormSubmitOverlay show={submitting} message="Sending invitation..." />
        <form onSubmit={handleInvite} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Organization Name</label>
            <input 
              type="text" 
              placeholder="e.g. Apollo Hospitals" 
              required 
              maxLength={80}
              value={formData.org_name}
              onChange={(e) => setFormData({...formData, org_name: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Contact Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Smith" 
              required 
              maxLength={80}
              value={formData.contact_name}
              onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Contact Email</label>
            <input 
              type="email" 
              placeholder="e.g. admin@apollo.com" 
              required 
              maxLength={80}
              value={formData.contact_email}
              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalCancel} onClick={() => setIsInviteModalOpen(false)}>Cancel</button>
            <button type="submit" className={styles.modalSubmit} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
        </FormOverlayContainer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

