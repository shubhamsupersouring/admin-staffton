import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Briefcase,
  UserX, 
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Eye,
  List
} from 'lucide-react';
import styles from './CandidateManagement.module.css';
import { candidateService } from '../services/candidate.service';
import { entityService } from '../services/entity.service';
import toast from 'react-hot-toast';
import { OrganizationListSkeleton } from '../components/Skeleton';
import Pagination from '../components/Pagination/Pagination';

const formatRole = (role) => {
  if (!role) return 'Not Set';
  const roleLower = role.toLowerCase();
  if (roleLower === 'non_clinical') return 'Non-Clinical';
  if (roleLower === 'doctor') return 'Doctor';
  if (roleLower === 'nurse') return 'Nurse';
  if (roleLower === 'clinical') return 'Clinical';
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const CandidateManagement = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, notApplied: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedStatus, setAppliedStatus] = useState('');
  const [roles, setRoles] = useState([]);
  const [primaryRole, setPrimaryRole] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [limit, setLimit] = useState(() => {
    const savedLimit = localStorage.getItem('candidate_page_limit');
    return savedLimit ? Number(savedLimit) : 20;
  });

  // Toggle Candidate Status state
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const handleToggleActive = async (id, currentStatus) => {
    setUpdatingStatusId(id);
    const newStatus = !currentStatus;
    try {
      await candidateService.updateStatus(id, newStatus);
      toast.success(`Candidate ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, is_active: newStatus } : c));
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error(error.response?.data?.message || 'Failed to update candidate status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Fetch active roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await entityService.getAll({ type: 'role' });
        const activeRoles = (response.data || []).filter(r => r.is_active);
        setRoles(activeRoles);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  // Debounce search term to optimize API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        candidateService.getStats(),
        candidateService.getCandidates({ 
          page: currentPage, 
          search: debouncedSearchTerm,
          appliedStatus: appliedStatus,
          primaryRole: primaryRole,
          limit: limit
        })
      ]);
      
      setStats(statsRes.data);
      setCandidates(listRes.data.candidates || []);
      setPagination({
        total: listRes.data.total,
        page: listRes.data.page,
        totalPages: listRes.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, appliedStatus, primaryRole, limit]);

  // Fetch data immediately when current page, filters, or debounced search term changes
  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchData]);

  if (loading && candidates.length === 0) {
    return <OrganizationListSkeleton />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Candidate Management</h1>
          <p className={styles.subtitle}>Overview of all candidates and their application status on the platform.</p>
        </div>
      </header>

      {/* Stats Section */}
      <div className={styles.statsWrapper}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconTotal}`}>
              <Users size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total Candidates</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconApplied}`}>
              <UserCheck size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.applied}</span>
              <span className={styles.statLabel}>Applied for Jobs</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconNotApplied}`}>
              <UserX size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.notApplied}</span>
              <span className={styles.statLabel}>Not Applied Yet</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name, email or mobile..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterWrapper}>
            <Briefcase size={18} className={styles.filterIcon} />
            <select 
              value={primaryRole}
              onChange={(e) => {
                setPrimaryRole(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterWrapper}>
            <Filter size={18} className={styles.filterIcon} />
            <select 
              value={appliedStatus}
              onChange={(e) => {
                setAppliedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="applied">Applied</option>
              <option value="not_applied">Not Applied</option>
            </select>
          </div>

          <div className={styles.filterWrapper}>
            <List size={18} className={styles.filterIcon} />
            <select 
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                localStorage.setItem('candidate_page_limit', newLimit);
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.listContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Primary Role</th>
              <th>Specialisation</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Open to Global</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length > 0 ? (
              candidates.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div 
                      className={`${styles.candidateName} ${styles.nameLink} whitespace-pre-wrap break-all`}
                      onClick={() => navigate(`/candidates/${c.id}`)}
                    >
                      {c.full_name}
                    </div>
                    <div className={`${styles.candidateEmail} whitespace-pre-wrap break-all`}>{c.email}</div>
                  </td>
                  <td>{formatRole(c.primary_role)}</td>
                  <td>
                    {c.primary_specialisation && c.primary_specialisation.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {c.primary_specialisation.map((spec, index) => (
                          <span key={index} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium whitespace-pre-wrap break-words">
                            {spec}
                          </span>
                        ))}
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td>
                    {c.city ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {c.city}, {c.state}
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td>{c.years_experience ? `${c.years_experience} Years` : 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                      <span className={`${styles.badge} ${c.has_applied ? styles.badgeApplied : styles.badgeNotApplied}`}>
                        {c.has_applied ? 'Applied' : 'No Application'}
                      </span>
                      <span className={`${styles.badge} ${c.is_active !== false ? styles.badgeActive : styles.badgeInactive}`}>
                        {c.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {c.open_to_global === true ? (
                      <span className={`${styles.badge} ${styles.badgeTrue}`}>Yes</span>
                    ) : c.open_to_global === false ? (
                      <span className={`${styles.badge} ${styles.badgeFalse}`}>No</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate(`/candidates/${c.id}`)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <label className={styles.switch} title={c.is_active !== false ? "Deactivate Candidate" : "Activate Candidate"}>
                        <input
                          type="checkbox"
                          checked={c.is_active !== false}
                          onChange={() => handleToggleActive(c.id, c.is_active !== false)}
                          disabled={updatingStatusId === c.id}
                        />
                        <span className={`${styles.slider} ${updatingStatusId === c.id ? styles.sliderDisabled : ''}`} />
                      </label>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                  No candidates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination Section */}
        <Pagination 
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default CandidateManagement;
