import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  Plus,
  UserPlus,
  CheckCircle2,
  Building,
  MapPin,
  Timer,
  Mail,
  User,
  Shield,
  Calendar,
  Send
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './OrganizationManagement.module.css';
import Modal from '../components/Modal/Modal';
import { organizationService } from '../services/organization.service';
import {
  FormOverlayContainer,
  FormSubmitOverlay,
  OrganizationListSkeleton,
  ModalFieldsSkeleton
} from '../components/Skeleton';
import Pagination from '../components/Pagination/Pagination';

const ITEMS_PER_PAGE = 10;

const OrganizationManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'pending' ? 'invitations' : 'registry';

  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: 'all', status: '' }, { replace: true });
    }
  }, [tabParam, setSearchParams]);
  const [orgs, setOrgs] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const statusParam = searchParams.get('status');
  const statusFilter = statusParam !== null ? statusParam : (activeTab === 'invitations' ? 'pending' : '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ org_name: '', contact_name: '', contact_email: '' });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [resendLoadingId, setResendLoadingId] = useState(null);

  // Pagination derived from URL search params
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const handlePageChange = useCallback((page) => {
    const params = Object.fromEntries(searchParams.entries());
    params.page = String(page);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const isInvitePendingAcceptance = (invite) => (invite?.latest_invitation_status || invite?.status || '').toLowerCase() !== 'accepted';

  const getStatusColor = (status) => {
    if (!status) return '#6b7e92';
    const s = status.toLowerCase();
    switch (s) {
      case 'active':
      case 'approved':
      case 'accepted':
        return '#0d9488'; // teal
      case 'pending':
      case 'under_review':
        return '#d97706'; // orange
      case 'rejected':
      case 'suspended':
        return '#ef4444'; // red
      case 'expired':
        return '#9ca3af'; // gray
      default:
        return '#6b7e92';
    }
  };


  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const prevSearchRef = useRef(debouncedSearch);
  const prevStatusRef = useRef(statusFilter);

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch || prevStatusRef.current !== statusFilter) {
      prevSearchRef.current = debouncedSearch;
      prevStatusRef.current = statusFilter;
      
      const page = searchParams.get('page');
      if (page && page !== '1') {
        const params = Object.fromEntries(searchParams.entries());
        params.page = '1';
        setSearchParams(params);
      }
    }
  }, [debouncedSearch, statusFilter, searchParams, setSearchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        searchTerm: debouncedSearch,
        status: statusFilter === 'all' ? '' : statusFilter
      };

      if (activeTab === 'registry') {
        const res = await organizationService.getOrganizations(params);
        setOrgs(res.data.organizations || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalItems(res.data.total || 0);
      } else {
        const res = await organizationService.getOrganizations(params);
        const inviteList = res.data.organizations || [];
        setInvites(inviteList);
        setTotalPages(res.data.totalPages || 0);
        setTotalItems(res.data.total || 0);
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
      await organizationService.inviteOrganization(formData);
      toast.success('Organization invited successfully!');
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
    // if (activeTab === 'registry') {
      navigate(`/organizations/${item.id}`);
    //   return;
    // }
    // Invitations tab: `item.id` is invitation id; joined org fields come from `item.org_id`
    // if (item.org_id) {
    //   navigate(`/organizations/${item.org_id}`);
    //   return;
    // }
    // setSelectedInvitation(item);
    // setDetailModalOpen(true);
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
      
      let inviteId = item.latest_invitation_id || item.invitation_id || item.invite_id || item.invitation?.id;
      
      if (!inviteId) {
        const details = await organizationService.getOrganizationDetails(item.id);
        inviteId = details.data?.latest_invitation_id || details.data?.invitation?.id || details.data?.invitation_id;
      }
      
      if (!inviteId) {
        throw new Error('No invitation found for this organization');
      }

      await organizationService.updateInvitation(inviteId, { action });
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
      toast.error(error.response?.data?.message || error.message || 'Action failed');
    } finally {
      if (action === 'resend') {
        setResendLoadingId(null);
      }
    }
  };
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
            onClick={() => setSearchParams({ tab: 'all', status: '' })}
          >
            All Organizations
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'invitations' ? styles.activeTab : ''}`}
            onClick={() => setSearchParams({ tab: 'pending', status: 'pending' })}
          >
            Pending Organizations
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
              onChange={(e) => setSearchParams({ tab: tabParam || 'all', status: e.target.value })}
            >
              <option value="">All {activeTab === 'invitations' ? 'Invite' : 'Verification'} Status</option>
              {activeTab === 'invitations' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>

                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  {/* <option value="under_review">Under Review</option> */}
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.listContainer}>
        {loading ? (
          <OrganizationListSkeleton count={4} />
        ) : currentList.length === 0 ? (
          <div className={styles.listGrid}>
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
          </div>
        ) : (
          <div className={styles.listGrid}>
            {currentList.map((item) => (
              <div
                key={item.id}
                className={styles.listCard}
                onClick={() => navigate(`/organizations/${item.id}`)}
              >
                <div className={styles.cardTopBar}>
                  <div className={styles.timeLabel}>
                    <Timer size={14} />
                    <span className="whitespace-pre-wrap break-all">{activeTab === 'invitations' ? 'Sent' : 'Registered'} {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={styles.cardMainContent}>
                  <h3 className={`${styles.orgNameTitle} whitespace-pre-wrap break-all`}>
                    {item.name}
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
                      <div className={`   gap-1 flex items-center justify-center `}>
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
                        <span className={`${styles.tag} ${(item.latest_invitation_status || item.status) === 'expired' ? styles.tagExpired : styles.tagPending} whitespace-pre-wrap break-all`}>
                          {(item.latest_invitation_status || item.status) === 'expired' ? 'Expired Invite' : 'Pending Invite'}
                        </span>
                        <span className={`${styles.tag} whitespace-pre-wrap break-all`}>{item?.contact_email || item?.latest_invitation_contact_email}</span>
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
                          color: getStatusColor(item.verification_status)
                        }}>
                          {item.verification_status.charAt(0).toUpperCase() + item.verification_status.slice(1)}
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
                      {(activeTab === 'invitations' ||
                        (activeTab === 'registry' &&
                          (item.verification_status?.toLowerCase() === 'pending' ||
                           item.verification_status?.toLowerCase() === 'rejected' ||
                           item.verification_status?.toLowerCase() === 'reject'))) && (
                        <button
                          className={styles.primaryActionBtn}
                          disabled={resendLoadingId === item.id}
                          onClick={(e) => handleManageInvite(e, item, 'resend')}
                        >
                          {resendLoadingId === item.id ? (
                            <div className='flex gap-2'>
                              <span className={styles.btnSpinner} />
                             <span>Resending...</span> 
                            </div>
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
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
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value.toLocaleLowerCase() })}
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
                <input className="whitespace-pre-wrap break-all" value={selectedInvitation.latest_invitation_status || selectedInvitation.status || '-'} readOnly />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Link Expires At</label>
              <div className={styles.inputWrapper}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  className="whitespace-pre-wrap break-all"
                  value={selectedInvitation.latest_invitation_expires_at || selectedInvitation.expires_at ? new Date(selectedInvitation.latest_invitation_expires_at || selectedInvitation.expires_at).toLocaleString() : '-'}
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
