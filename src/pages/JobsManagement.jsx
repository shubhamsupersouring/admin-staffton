import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Building, 
  Briefcase, 
  Clock, 
  Filter, 
  ArrowUpRight, 
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './JobsManagement.module.css';
import apiClient from '../services/apiClient';
import Modal from '../components/Modal/Modal';
import { AdminDashboardSkeleton } from '../components/Skeleton';
import Pagination from '../components/Pagination/Pagination';

const JobCard = ({ job, onViewDetails }) => {
  const displayValue = (val) => {
    if (!val) return '';
    if (typeof val === 'object') return val.name || val.title || val.label || val.value || '';
    return val;
  };

  return (
    <div className={styles.listCard} onClick={onViewDetails}>
      <div className={styles.cardTopBar}>
        <div className={styles.timeLabel}>
          <Timer size={14} />
          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
        </div>
        <span className={`${styles.statusBadge} ${job.status === 'active' ? styles.badgeActive : styles.badgePending}`}>
          {job.status || 'draft'}
        </span>
      </div>

      <div className={styles.cardMainContent}>
        <h3 className={styles.jobNameTitle}>{displayValue(job.title)}</h3>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <MapPin size={16} />
            <span>{displayValue(job.city) || displayValue(job.org_city) || 'Remote'}</span>
          </div>
          <div className={styles.metaItem}>
            <Building size={16} />
            <span>{displayValue(job.organisation_name) || 'Staffton Partner'}</span>
          </div>
          {job.isUrgent && <span className={styles.urgentBadge}>Urgent</span>}
        </div>

        <div className={styles.tagCloud}>
          {displayValue(job.profession) ? <span className={styles.tag}>{displayValue(job.profession)}</span> : null}
          {displayValue(job.specialisation) ? <span className={styles.tag}>{displayValue(job.specialisation)}</span> : null}
          {Array.isArray(job.job_type) ? job.job_type.map((t, idx) => (
            displayValue(t) ? <span key={t?.id || idx} className={styles.tag}>{displayValue(t)}</span> : null
          )) : (displayValue(job.job_type) ? <span className={styles.tag}>{displayValue(job.job_type)}</span> : <span className={styles.tag}>Full-Time</span>)}
        </div>

        <div className={styles.cardBottomRow}>
          <div className={styles.statsGroup}>
            <div className={styles.statBox}>
              <span className={styles.statBoxLabel}>Experience</span>
              <span className={styles.statBoxValue}>{job.experience_min_yrs || 0} - {job.experience_max_yrs || 5} years</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statBoxLabel}>Budget</span>
              <span className={`${styles.statBoxValue} ${styles.budgetValue}`}>
                ₹{job.salary_min ? (job.salary_min/1000).toFixed(0) + 'k' : '—'} - ₹{job.salary_max ? (job.salary_max/1000).toFixed(0) + 'k' : '—'} /month
              </span>
            </div>
          </div>

          <div className={styles.actionGroup}>
            <button className={styles.viewDetailsBtn} onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
              View details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterModal = ({ isOpen, onClose, filters, setFilters, onApply, onReset }) => {
  const roles = ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Surgeon', 'Radiologist', 'Nurse', 'Technician'];
  const workTypes = ['Full time', 'Part time', 'Internship', 'Contract', 'Freelance'];
  const shifts = ['Day shift', 'Night shift', 'Weekend shift', 'On-call shift', 'Holiday shift'];

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category] || [];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter">
      <div className={styles.modalContent}>
        <div className={styles.filterSection}>
          <label className={styles.label}>Role</label>
          <div className={styles.pillsGrid}>
            {roles.map(role => (
              <button 
                key={role} 
                className={`${styles.pill} ${filters.roles?.includes(role) ? styles.activePill : ''}`}
                onClick={() => toggleFilter('roles', role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <label className={styles.label}>Work Type</label>
          <div className={styles.pillsGrid}>
            {workTypes.map(type => (
              <button 
                key={type} 
                className={`${styles.pill} ${filters.workTypes?.includes(type) ? styles.activePill : ''}`}
                onClick={() => toggleFilter('workTypes', type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <label className={styles.label}>Shift</label>
          <div className={styles.pillsGrid}>
            {shifts.map(shift => (
              <button 
                key={shift} 
                className={`${styles.pill} ${filters.shifts?.includes(shift) ? styles.activePill : ''}`}
                onClick={() => toggleFilter('shifts', shift)}
              >
                {shift}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <label className={styles.label}>Salary Range</label>
          <div className={styles.salaryGrid}>
            <div className={styles.inputGroup}>
              <label>Min (₹)</label>
              <input 
                type="number" 
                className={styles.modalBodyInput}
                placeholder="e.g. 30000" 
                value={filters.salaryFrom} 
                onChange={(e) => setFilters({...filters, salaryFrom: e.target.value})} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Max (₹)</label>
              <input 
                type="number" 
                className={styles.modalBodyInput}
                placeholder="e.g. 100000" 
                value={filters.salaryTo} 
                onChange={(e) => setFilters({...filters, salaryTo: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalReset} onClick={onReset}>Reset All</button>
          <button className={styles.modalApply} onClick={onApply}>Apply Filters</button>
        </div>
      </div>
    </Modal>
  );
};

const ITEMS_PER_PAGE = 10;

const JobsManagement = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [filters, setFilters] = useState({
    roles: ['All'],
    workTypes: [],
    shifts: [],
    salaryFrom: '',
    salaryTo: ''
  });
  const [sortOrder, setSortOrder] = useState('Recently Posted');
  const [stats, setStats] = useState({
    applied: 0,
    underReview: 0,
    active: 0,
    saved: 0
  });
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        searchTerm: debouncedSearch,
        sort: sortOrder,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      };
      
      if (statusFilter) params.status = statusFilter;
      if (filters.roles.length > 0 && !filters.roles.includes('All')) params.roles = filters.roles.join(',');
      if (filters.shifts.length > 0) params.shifts = filters.shifts.join(',');
      if (filters.workTypes.length > 0) params.workTypes = filters.workTypes.join(',');
      if (filters.salaryFrom) params.salaryFrom = filters.salaryFrom;
      if (filters.salaryTo) params.salaryTo = filters.salaryTo;
      
      const [jobsRes, statsRes] = await Promise.all([
        apiClient.get('/admin/jobs', { params }),
        apiClient.get('/admin/jobs/stats')
      ]);
      
      setJobs(jobsRes.data.data.jobs || []);
      setTotalPages(jobsRes.data.data.totalPages || 0);
      
      if (statsRes.data.data) {
        setStats({
          active: statsRes.data.data.active || 0,
          saved: statsRes.data.data.closed || 0,
          applied: statsRes.data.data.total || 0,
          underReview: statsRes.data.data.pending || 0
        });
      }
    } catch (error) {
      toast.error('Failed to fetch jobs data');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortOrder, statusFilter, filters, currentPage]);

  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchData]);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOrder, statusFilter, filters]);

  // Pagination - No longer needed as it's done on server
  const paginatedJobs = jobs;

  if (loading && jobs.length === 0) return <AdminDashboardSkeleton />;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Jobs Management</h1>
          <p className={styles.subtitle}>Find and manage healthcare opportunities across the platform.</p>
        </div>
      </header>

      {/* Dashboard-style Stats Wrapper */}
      <div className={styles.statsWrapper}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconApplied}`}>
              <Briefcase size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.applied}</span>
              <span className={styles.statLabel}>Total Jobs</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconReview}`}>
              <Search size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.underReview}</span>
              <span className={styles.statLabel}>Under Review</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconActive}`}>
              <Clock size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.active}</span>
              <span className={styles.statLabel}>Active</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconSaved}`}>
              <Heart size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.saved}</span>
              <span className={styles.statLabel}>Closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className={styles.tabsSection}>
        <div className={styles.tabs}>
          <div className={`${styles.tab} ${!statusFilter ? styles.activeTab : ''}`} onClick={() => setStatusFilter('')}>
            All Jobs
          </div>
          <div className={`${styles.tab} ${statusFilter === 'active' ? styles.activeTab : ''}`} onClick={() => setStatusFilter('active')}>
            Active
          </div>
          <div className={`${styles.tab} ${statusFilter === 'draft' ? styles.activeTab : ''}`} onClick={() => setStatusFilter('draft')}>
            Drafts
          </div>
          <div className={`${styles.tab} ${statusFilter === 'closed' ? styles.activeTab : ''}`} onClick={() => setStatusFilter('closed')}>
            Closed
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by job title, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.sortWrapper}>
            <Filter size={18} className={styles.searchIcon} />
            <select
              style={{ paddingLeft: 42 }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option>Recently Posted</option>
              <option>Salary High → Low</option>
              <option>Salary Low → High</option>
            </select>
          </div>
          <button className={styles.filterBtn} onClick={() => setIsFilterOpen(true)}>
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* List */}
      <div className={styles.listContainer}>
        <div className={styles.resultsCount}>
          <Briefcase size={14} /> {jobs.length} jobs found
        </div>
        <div className={styles.listGrid}>
          {paginatedJobs.length > 0 ? (
            paginatedJobs.map(job => <JobCard key={job.id} job={job} onViewDetails={() => navigate(`/jobs/${job.id}`)} />)
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIllustration}>
                <Briefcase size={64} />
              </div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search or filters to see more results.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => {
          setIsFilterOpen(false);
          setCurrentPage(1);
          fetchData();
        }}
        onReset={() => {
          setFilters({ roles: ['All'], workTypes: [], shifts: [], salaryFrom: '', salaryTo: '' });
          setCurrentPage(1);
          setTimeout(() => fetchData(), 0);
        }}
      />
    </div>
  );
};

export default JobsManagement;
