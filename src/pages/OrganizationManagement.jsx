import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Plus,
  UserPlus,
  CheckCircle2,
  Building,
  MapPin,
  Timer,
  Heart,
  Mail,
  User,
  Shield,
  Calendar,
  Send,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './OrganizationManagement.module.css';
import Modal from '../components/Modal/Modal';
import apiClient from '../services/apiClient';
import {
  FormOverlayContainer,
  FormSubmitOverlay,
  OrganizationListSkeleton,
  ModalFieldsSkeleton
} from '../components/Skeleton';

const ITEMS_PER_PAGE = 10;

const OrganizationManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'invitations'
  const [orgs, setOrgs] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ org_name: '', contact_name: '', contact_email: '' });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [resendLoadingId, setResendLoadingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const isInvitePendingAcceptance = (invite) => (invite?.status || '').toLowerCase() !== 'accepted';

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setStatusFilter('');
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        limit: ITEMS_PER_PAGE,
        page: currentPage
      };
      const q = debouncedSearch;
      if (q) {
        params.q = q;
      }
      if (activeTab === 'registry' && statusFilter) {
        params.verification_status = statusFilter;
      }
      if (activeTab === 'invitations' && statusFilter) {
        params.status = statusFilter;
      }

      if (activeTab === 'registry') {
        const res = await apiClient.get('/admin/organizations', { params });
        setOrgs(res.data.data.organizations || []);
        setTotalPages(res.data.data.totalPages || 0);
        setTotalItems(res.data.data.total || 0);
      } else {
        const res = await apiClient.get('/admin/invitations', { params });
        const inviteList = res.data.data.invitations || [];
        setInvites(inviteList); // API already filters accepted ones if needed, or we filter here
        setTotalPages(res.data.data.totalPages || 0);
        setTotalItems(res.data.data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
      setHasFetchedOnce(true);
    }
  }, [debouncedSearch, statusFilter, activeTab, currentPage]);

  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchData]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/admin/invitations', formData);
      toast.success('Invitation sent!');
      setIsModalOpen(false);
      setFormData({ org_name: '', contact_name: '', contact_email: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (e, item) => {
    e.stopPropagation();
    if (activeTab === 'registry') {
      navigate(`/organizations/${item.id}`);
      return;
    }
    // Invitations tab: `item.id` is invitation id; joined org fields come from `item.org_id`
    if (item.org_id) {
      navigate(`/organizations/${item.org_id}`);
      return;
    }
    setSelectedInvitation(item);
    setDetailModalOpen(true);
  };

  const handleManageInvite = async (e, item, action = 'resend') => {
    e.stopPropagation();
    if (action === 'resend') {
      setResendLoadingId(item.id);
    }
    try {
      if (action === 'revoke') {
        if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
      }
      await apiClient.patch(`/admin/invitations/${item.id}`, { action });
      if (action === 'resend') {
        toast.success('Invitation resent');
      } else if (action === 'revoke') {
        toast.success('Invitation revoked');
        setDetailModalOpen(false);
      } else if (action === 'extend') {
        toast.success('Invitation extended');
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      if (action === 'resend') {
        setResendLoadingId(null);
      }
    }
  };

  if (loading && !hasFetchedOnce) return <OrganizationListSkeleton />;

  const currentList = activeTab === 'invitations' ? invites : orgs;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Organization Management</h1>
          <p className={styles.subtitle}>View registry, manage verifications and invite new healthcare providers.</p>
        </div>
        <button className={styles.inviteBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Invite Organization
        </button>
      </header>

      <div className={styles.tabsSection}>
        <div className={styles.tabs}>
          <div
            className={`${styles.tab} ${activeTab === 'registry' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('registry')}
          >
            Provider Registry
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'invitations' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('invitations')}
          >
            Invite Sent
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.statusFilterWrapper}>
            <Filter size={18} className={styles.searchIcon} />
            <select
              className={styles.searchInput}
              style={{ paddingLeft: 42 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All {activeTab === 'invitations' ? 'Invite' : 'Verification'} Status</option>
              {activeTab === 'invitations' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.listContainer}>
        <div className={styles.listGrid}>
          {currentList.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIllustration}>
                <Building size={64} />
                <div className={styles.pulseRing}></div>
              </div>
              <h3>{activeTab === 'invitations' ? 'No pending invites found' : 'No organizations yet'}</h3>
              <p>Start building your ecosystem by inviting your first medical facility partner to the platform.</p>
              <button className={styles.inviteBtn} onClick={() => setIsModalOpen(true)}>
                <UserPlus size={18} /> Invite First Organization
              </button>
            </div>
          ) : (
            <>
              {currentList.map((item) => (
                <div
                  key={item.id}
                  className={styles.listCard}
                  onClick={() => activeTab === 'registry' && navigate(`/organizations/${item.id}`)}
                >
                  <div className={styles.cardTopBar}>
                    <div className={styles.timeLabel}>
                      <Timer size={14} />
                      <span className="whitespace-pre-wrap break-all">{activeTab === 'invitations' ? 'Sent' : 'Registered'} {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <button className={styles.saveBtn} onClick={(e) => e.stopPropagation()}>
                      <Heart size={18} />
                      <span>Save</span>
                    </button>
                  </div>

                  <div className={styles.cardMainContent}>
                    <h3 className={`${styles.orgNameTitle} whitespace-pre-wrap break-all`}>
                      {activeTab === 'invitations' ? item.org_name : item.name}
                    </h3>

                    <div className={styles.metaRow}>
                      <div className={styles.metaItem}>
                        <MapPin size={16} />
                        <span className="whitespace-pre-wrap break-all">{activeTab === 'invitations' ? 'Medical Partner' : (item.city || 'Location Pending')}</span>
                      </div>
                      <div className={styles.metaDivider}></div>
                      <div className={styles.metaItem}>
                        <Building size={16} />
                        <span className="whitespace-pre-wrap break-all">{activeTab === 'invitations' ? 'Facility' : (item.org_type || 'Hospital')}</span>
                      </div>
                      {(activeTab === 'registry' && item.verification_status === 'approved') && (
                        <div className={styles.verifiedBadge}>
                          <CheckCircle2 size={14} />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.tagCloud}>
                      {activeTab === 'registry' ? (
                        <>
                          <span className={`${styles.tag} whitespace-pre-wrap break-all`}>{item.org_type || 'Facility'}</span>
                          <span className={`${styles.tag} whitespace-pre-wrap break-all`}>{item.city || 'Remote'}</span>
                          <span className={`${styles.tag} whitespace-pre-wrap break-all`}>{item.state || 'India'}</span>
                        </>
                      ) : (
                        <>
                          <span className={`${styles.tag} whitespace-pre-wrap break-all`}>Pending Invite</span>
                          <span className={`${styles.tag} whitespace-pre-wrap break-all`}>{item.contact_email}</span>
                        </>
                      )}
                    </div>

                    <div className={styles.cardBottomRow}>
                      <div className={styles.statsGroup}>
                        <div className={styles.statBox}>
                          <span className={styles.statLabel}>Organization Type</span>
                          <span className={`${styles.statValue} whitespace-pre-wrap break-all`}>{activeTab === 'invitations' ? 'Medical Partner' : (item.org_type || 'Hospital')}</span>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.statBox}>
                          <span className={styles.statLabel}>Current Status</span>
                          <span className={`${styles.statValue} whitespace-pre-wrap break-all`} style={{
                            color: (item.verification_status === 'approved' || item.status === 'accepted') ? '#0d9488' : '#d97706'
                          }}>
                            {activeTab === 'invitations' ? item.status : item.verification_status}
                          </span>
                        </div>
                      </div>

                      <div className={styles.actionGroup}>
                        <button
                          className={styles.viewDetailsBtn}
                          onClick={(e) => handleViewDetails(e, item)}
                        >
                          View details
                        </button>
                        {activeTab === 'invitations' && (
                          <button
                            className={styles.primaryActionBtn}
                            disabled={resendLoadingId === item.id}
                            onClick={(e) => handleManageInvite(e, item, 'resend')}
                          >
                            {resendLoadingId === item.id ? (
                              <>
                                <span className={styles.btnSpinner} />
                                Resending...
                              </>
                            ) : (
                              'Resend Invite'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    className={styles.pageBtn} 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
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
                  <button 
                    className={styles.pageBtn} 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Organization"
      >
        <FormOverlayContainer>
          <FormSubmitOverlay show={submitting} message="Sending invitation..." />
          <form onSubmit={handleInvite} className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label>Organization Name</label>
              <div className={styles.inputWrapper}>
                <Building size={18} className={styles.inputIcon} />
                <input 
                  type="text" 
                  placeholder="e.g. Apollo Hospitals" 
                  required 
                  maxLength={80}
                  value={formData.org_name} 
                  onChange={(e) => setFormData({ ...formData, org_name: e.target.value })} 
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Primary Contact Name</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  required 
                  maxLength={80}
                  value={formData.contact_name} 
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Corporate Contact Email</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input 
                  type="email" 
                  placeholder="e.g. hr@apollo.com" 
                  required 
                  value={formData.contact_email} 
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} 
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className={styles.modalSubmit} disabled={submitting}>
                <Send size={16} />
                {submitting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </FormOverlayContainer>
      </Modal>

      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Invitation Details"
      >
        {selectedInvitation ? (
          <div className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label>Organization</label>
              <div className={styles.inputWrapper}>
                <Building size={18} className={styles.inputIcon} />
                <input className="whitespace-pre-wrap break-all" value={selectedInvitation.org_name || '-'} readOnly />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Contact Person</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input className="whitespace-pre-wrap break-all" value={selectedInvitation.contact_name || '-'} readOnly />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Contact Email</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input className="whitespace-pre-wrap break-all" value={selectedInvitation.contact_email || '-'} readOnly />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Invite Status</label>
              <div className={styles.inputWrapper}>
                <Shield size={18} className={styles.inputIcon} />
                <input className="whitespace-pre-wrap break-all" value={selectedInvitation.status || '-'} readOnly />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Link Expires At</label>
              <div className={styles.inputWrapper}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  className="whitespace-pre-wrap break-all"
                  value={selectedInvitation.expires_at ? new Date(selectedInvitation.expires_at).toLocaleString() : '-'}
                  readOnly
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={(e) => handleManageInvite(e, selectedInvitation, 'extend')}
              >
                Extend
              </button>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={(e) => handleManageInvite(e, selectedInvitation, 'revoke')}
                style={{ color: '#dc2626' }}
              >
                Revoke
              </button>
              <button
                type="button"
                className={styles.modalSubmit}
                disabled={resendLoadingId === selectedInvitation.id}
                onClick={(e) => handleManageInvite(e, selectedInvitation, 'resend')}
                style={{ minWidth: 120, justifyContent: 'center' }}
              >
                {resendLoadingId === selectedInvitation.id ? (
                  <>
                    <span className={styles.btnSpinner} />
                    Resending...
                  </>
                ) : (
                  'Resend Now'
                )}
              </button>
            </div>
          </div>
        ) : (
          <ModalFieldsSkeleton />
        )}
      </Modal>
    </div>
  );
};

export default OrganizationManagement;
