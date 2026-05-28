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
import { adminService } from '../services/admin.service';
import { organizationService } from '../services/organization.service';
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
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const safeData = Array.isArray(data) ? data.filter((item) => Number(item.value) > 0) : [];
  const total = safeData.reduce((sum, item) => sum + Number(item.value || 0), 0);

  // SVG dimensions
  const cx = 100;
  const cy = 100;
  const R = 80; // Outer radius
  const r = 44; // Inner radius (donut hole)

  const angleToRad = (deg) => (deg - 90) * Math.PI / 180;

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
            <div className={styles.pieChart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
                <g>
                  {safeData.length === 1 ? (
                    // Single item 100% case
                    (() => {
                      const color = PIE_COLORS[0];
                      const isHovered = hoveredIndex === 0;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={R}
                          fill={color}
                          onMouseEnter={() => setHoveredIndex(0)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          style={{
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                          }}
                        />
                      );
                    })()
                  ) : (
                    // Multi-item slices
                    safeData.map((item, index) => {
                      const value = Number(item.value || 0);
                      const start = safeData.slice(0, index).reduce((sum, curr) => sum + Number(curr.value || 0), 0);
                      const startAngle = (start / total) * 360;
                      const endAngle = ((start + value) / total) * 360;

                      const startRad = angleToRad(startAngle);
                      const endRad = angleToRad(endAngle);

                      const x1 = cx + R * Math.cos(startRad);
                      const y1 = cy + R * Math.sin(startRad);
                      const x2 = cx + R * Math.cos(endRad);
                      const y2 = cy + R * Math.sin(endRad);

                      const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0;
                      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                      const midAngle = (startAngle + endAngle) / 2;
                      const midRad = angleToRad(midAngle);
                      const isHovered = hoveredIndex === index;
                      const shiftDist = 6;
                      const dx = Math.cos(midRad) * shiftDist;
                      const dy = Math.sin(midRad) * shiftDist;

                      return (
                        <path
                          key={`${item.name}-${index}`}
                          d={d}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          style={{
                            transform: isHovered ? `translate(${dx}px, ${dy}px)` : 'translate(0px, 0px)',
                            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                          }}
                        />
                      );
                    })
                  )}
                  {/* Central hole to make it a donut chart */}
                  <circle cx={cx} cy={cy} r={r} fill="var(--white)" />
                </g>
              </svg>
            </div>
            <div className={styles.legendList}>
              {safeData.map((item, index) => {
                const value = Number(item.value || 0);
                const percent = Math.round((value / total) * 100);
                const isHovered = hoveredIndex === index;
                const dotColor = PIE_COLORS[index % PIE_COLORS.length];
                return (
                  <div
                    key={`${item.name}-${index}`}
                    className={styles.legendItem}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                      borderColor: isHovered ? dotColor : 'var(--border-light)',
                      backgroundColor: isHovered ? `${dotColor}10` : 'transparent',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer'
                    }}
                  >
                    <span
                      className={styles.legendDot}
                      style={{ backgroundColor: dotColor }}
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
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const safeData = Array.isArray(data) ? data : [];
  const maxValue = safeData.reduce((max, item) => Math.max(max, Number(item.value || 0)), 0);
  const anyHovered = hoveredIndex !== null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
      </div>
      <div className={styles.chartContent}>
        <p className={styles.chartSubtitle}>{subtitle}</p>
        {safeData.length > 0 ? (
          <div className={styles.barChart}>
            {safeData.map((item, index) => {
              const value = Number(item.value || 0);
              const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 6) : 6;
              const isHovered = hoveredIndex === index;
              return (
                <div
                  key={item.label}
                  className={styles.barColumn}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                    opacity: anyHovered && !isHovered ? 0.6 : 1,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    className={styles.barValue}
                    style={{
                      color: isHovered ? 'var(--teal)' : 'var(--navy)',
                      fontWeight: isHovered ? '800' : '700',
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {value}
                  </div>
                  <div
                    className={styles.barTrack}
                    style={{
                      boxShadow: isHovered ? '0 4px 12px rgba(15, 184, 164, 0.25)' : 'none',
                      borderColor: isHovered ? 'var(--teal)' : 'transparent',
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div
                      className={styles.barFill}
                      style={{
                        height: `${height}%`,
                        background: isHovered
                          ? 'linear-gradient(180deg, #14b8a6 0%, #0f766e 100%)'
                          : 'linear-gradient(180deg, var(--teal) 0%, var(--teal-dark) 100%)',
                        transition: 'background 0.2s ease'
                      }}
                    />
                  </div>
                  <div
                    className={styles.barLabel}
                    style={{
                      color: isHovered ? 'var(--text)' : 'var(--text-muted)',
                      fontWeight: isHovered ? '600' : 'normal',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {item.label}
                  </div>
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
        const [statsData, verificationsData] = await Promise.all([
          adminService.getDashboardStats(),
          organizationService.getVerifications({ limit: 5 })
        ]);
        setStats(statsData.data);
        setVerifications(verificationsData.data.verifications || []);
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
      await organizationService.inviteOrganization(formData);
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
            label="Total Candidate"
            sub="Registered on platform"
            colorClass={styles.iconActive}
            onClick={() => navigate('/candidates')}
          />
          <StatCard
            icon={<Briefcase size={19} />}
            value={stats.jobs || 0}
            label="Live Job Postings"
            sub="Currently accepting applications"
            colorClass={styles.iconBlue}
            onClick={() => navigate('/jobs')}
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
                onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
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

