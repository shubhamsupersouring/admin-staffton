import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter,
  Users as UsersIcon,
  Building,
  Shield,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './UserManagement.module.css';
import apiClient from '../services/apiClient';
import { OrganizationListSkeleton } from '../components/Skeleton';
import Modal from '../components/Modal/Modal';

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [organisations, setOrganisations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [deactivationModal, setDeactivationModal] = useState({ 
    isOpen: false, 
    userId: null, 
    userName: '' 
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
        page: currentPage,
        limit: ITEMS_PER_PAGE
      };
      if (debouncedSearch) params.searchTerm = debouncedSearch;
      if (orgFilter) params.org_id = orgFilter;
      if (statusFilter) params.is_active = statusFilter;

      const [usersRes, statsRes, orgsRes] = await Promise.all([
        apiClient.get('/admin/users', { params }),
        apiClient.get('/admin/users/stats'),
        apiClient.get('/admin/users/organisations')
      ]);

      setUsers(usersRes.data.data.users || []);
      setTotalPages(usersRes.data.data.totalPages || 0);
      if (statsRes.data.data) setStats(statsRes.data.data);
      if (orgsRes.data.data) setOrganisations(orgsRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, orgFilter, statusFilter, currentPage]);

  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, orgFilter, statusFilter]);

  const handleToggleActive = async (userId, e) => {
    e.stopPropagation();
    const user = users.find(u => u.id === userId);
    const isDeactivating = user?.is_active;

    if (isDeactivating) {
      setDeactivationModal({ 
        isOpen: true, 
        userId: user.id, 
        userName: user.full_name 
      });
      return;
    }

    // For activation, do it directly
    performToggle(userId);
  };

  const performToggle = async (userId) => {
    try {
      const res = await apiClient.patch(`/admin/users/${userId}/toggle`);
      toast.success(res.data.message);
      fetchData();
      setDeactivationModal({ isOpen: false, userId: null, userName: '' });
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  // Pagination - No longer needed as it's done on server
  const paginatedUsers = users;

  if (loading && users.length === 0) return <OrganizationListSkeleton />;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>View and manage all hospital staff members across the platform.</p>
        </div>
      </header>

      {/* Stats */}
      <div className={styles.statsWrapper}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconTotal}`}>
              <UsersIcon size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total Users</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconActive}`}>
              <Power size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.active}</span>
              <span className={styles.statLabel}>Active</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconInactive}`}>
              <PowerOff size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.inactive}</span>
              <span className={styles.statLabel}>Inactive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className={styles.tabsSection}>
        <div className={styles.tabs}>
          <div className={`${styles.tab} ${!statusFilter ? styles.activeTab : ''}`} onClick={() => setStatusFilter('')}>
            All Users
          </div>
          <div className={`${styles.tab} ${statusFilter === 'true' ? styles.activeTab : ''}`} onClick={() => setStatusFilter('true')}>
            Active
          </div>
          <div className={`${styles.tab} ${statusFilter === 'false' ? styles.activeTab : ''}`} onClick={() => setStatusFilter('false')}>
            Inactive
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.sortWrapper}>
            <Building size={18} className={styles.searchIcon} />
            <select
              style={{ paddingLeft: 42 }}
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
            >
              <option value="">All Hospitals</option>
              {organisations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className={styles.listContainer}>
        <div className={styles.resultsCount}>
          <UsersIcon size={14} /> {stats.total} users found
        </div>
        <div className={styles.listGrid}>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map(user => (
              <div key={user.id} className={styles.listCard}>
                <div className={styles.cardTopBar}>
                  <div className={styles.timeLabel}>
                    <Clock size={14} />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${user.is_active ? styles.badgeActive : styles.badgeInactive}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className={styles.cardMainContent}>
                  <h3 className={`${styles.userName} whitespace-pre-wrap break-all`}>{user.full_name}</h3>

                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <Building size={16} />
                      <span className="whitespace-pre-wrap break-all">{user.organisation_name || 'No Hospital'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Shield size={16} />
                      <span className="whitespace-pre-wrap break-all">{user.role_label || user.role_name || 'Member'}</span>
                    </div>
                  </div>

                  <div className={styles.contactRow}>
                    <div className={styles.metaItem}>
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                    {user.mobile && (
                      <div className={styles.metaItem}>
                        <Phone size={14} />
                        <span>{user.mobile}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardBottomRow}>
                    <div className={styles.statsGroup}>
                      <div className={styles.statBox}>
                        <span className={styles.statBoxLabel}>Role</span>
                        <span className={styles.statBoxValue}>{user.role_label || user.role_name || 'Member'}</span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statBoxLabel}>Last Login</span>
                        <span className={styles.statBoxValue}>
                          {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.actionGroup}>
                      <button 
                        className={`${styles.toggleBtn} ${user.is_active ? styles.deactivateBtn : styles.activateBtn}`}
                        onClick={(e) => handleToggleActive(user.id, e)}
                      >
                        {user.is_active ? <><PowerOff size={14} /> Deactivate</> : <><Power size={14} /> Activate</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIllustration}>
                <UsersIcon size={64} />
              </div>
              <h3>No users found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft size={16} /> Previous
            </button>
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`${styles.pageNum} ${currentPage === page ? styles.activePageNum : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className={styles.pageBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Deactivation Confirmation Modal */}
      <Modal
        isOpen={deactivationModal.isOpen}
        onClose={() => setDeactivationModal({ ...deactivationModal, isOpen: false })}
        title="Confirm Deactivation"
      >
        <div className={styles.confirmContent}>
          <div className={styles.confirmIconBox}>
            <AlertCircle size={48} className={styles.warnIcon} />
          </div>
          <p className={styles.confirmText}>
            Are you sure you want to deactivate <strong>{deactivationModal.userName}</strong>?
          </p>
          <p className={styles.confirmSubtext}>
            They will no longer be able to access their account or perform any actions until reactivated.
          </p>
          
          <div className={styles.modalActions}>
            <button 
              className={styles.modalCancel} 
              onClick={() => setDeactivationModal({ ...deactivationModal, isOpen: false })}
            >
              Cancel
            </button>
            <button 
              className={styles.modalConfirm} 
              onClick={() => performToggle(deactivationModal.userId)}
            >
              Deactivate User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
