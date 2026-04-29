import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Briefcase, 
  UserX, 
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import styles from './CandidateManagement.module.css';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { OrganizationListSkeleton } from '../components/Skeleton';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, notApplied: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedStatus, setAppliedStatus] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        apiClient.get('/admin/candidates/stats'),
        apiClient.get('/admin/candidates', { 
          params: { 
            page: currentPage, 
            search: searchTerm,
            appliedStatus: appliedStatus,
            limit: 10
          } 
        })
      ]);
      
      setStats(statsRes.data.data);
      setCandidates(listRes.data.data.candidates || []);
      setPagination({
        total: listRes.data.data.total,
        page: listRes.data.data.page,
        totalPages: listRes.data.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, appliedStatus]);

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
      </div>

      {/* Table Section */}
      <div className={styles.listContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Primary Role</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length > 0 ? (
              candidates.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className={`${styles.candidateName} whitespace-pre-wrap break-all`}>{c.full_name}</div>
                    <div className={`${styles.candidateEmail} whitespace-pre-wrap break-all`}>{c.email}</div>
                  </td>
                  <td>{c.primary_role || 'Not Set'}</td>
                  <td>
                    {c.city ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {c.city}, {c.state}
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td>{c.years_experience ? `${c.years_experience} Years` : 'N/A'}</td>
                  <td>
                    <span className={`${styles.badge} ${c.has_applied ? styles.badgeApplied : styles.badgeNotApplied}`}>
                      {c.has_applied ? 'Applied' : 'No Application'}
                    </span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  No candidates found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Section */}
        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Showing page {pagination.page} of {pagination.totalPages}
            </div>
            <div className={styles.pageActions}>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`${styles.pageNum} ${currentPage === page ? styles.activePageNum : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                className={styles.pageBtn} 
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateManagement;
