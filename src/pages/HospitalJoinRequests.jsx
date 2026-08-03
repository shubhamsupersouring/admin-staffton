import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Search,
  Mail,
  User,
  Phone,
  Clock,
  CheckCircle2,
  Inbox,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './HospitalJoinRequests.module.css';
import { hospitalJoinRequestService } from '../services/hospitalJoinRequest.service';
import { OrganizationListSkeleton } from '../components/Skeleton';
import Pagination from '../components/Pagination/Pagination';

const normalizeRequest = (item) => ({
  id: item.id,
  hospitalName: item.hospital_name || item.facility_name || item.org_name || item.name || '—',
  workEmail: item.official_email || item.official_work_email || item.work_email || item.email || '—',
  contactName: item.contact_person_name || item.contact_name || '—',
  mobile: item.work_mobile_number || item.mobile || item.phone || '—',
  status: (item.status || (item.read_user ? 'read' : 'unread')).toLowerCase(),
  createdAt: item.created_at || item.requested_at,
});

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
    case 'read':
      return styles.badgeApproved;
    case 'rejected':
      return styles.badgeRejected;
    default:
      return styles.badgePending;
  }
};

const formatStatusLabel = (status) => {
  if (!status) return 'Pending';
  if (status === 'read') return 'Read';
  if (status === 'unread') return 'Unread';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const openGmailCompose = (request) => {
  const to = request.workEmail;
  if (!to || to === '—') {
    toast.error('No email available for this request');
    return;
  }

  const subject = `Staffton — Regarding your access request for ${request.hospitalName}`;
  const body = `Dear ${request.contactName !== '—' ? request.contactName : 'Team'},\n\nThank you for your interest in joining Staffton.\n\n`;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank', 'noopener,noreferrer');
};

const HospitalJoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [limit, setLimit] = useState(() => {
    const saved = localStorage.getItem('hospital_join_page_limit');
    return saved ? Number(saved) : 20;
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, limit]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: debouncedSearch,
      };

      const listRes = await hospitalJoinRequestService.getRequests(params);
      const listData = listRes?.data || listRes || {};

      const rawList = listData.data || listData.requests || [];
      const paginationInfo = listData.pagination || {};

      setRequests(rawList.map(normalizeRequest));
      setPagination({
        total: paginationInfo.total ?? listData.total ?? rawList.length,
        totalPages: paginationInfo.totalPages ?? listData.totalPages ?? 1,
      });
    } catch (error) {
      console.error('Error fetching hospital join requests:', error);
      toast.error('Failed to load hospital join requests');
      setRequests([]);
      setPagination({ total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, limit]);

  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchData]);

  if (loading && requests.length === 0) {
    return <OrganizationListSkeleton count={4} />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Hospital Join Requests</h1>
          <p className={styles.subtitle}>
            Review access requests from hospitals and facilities that want to onboard onto Staffton.
          </p>
        </div>
      </header>

  

      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by hospital, email or contact name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterWrapper}>
            <List size={18} className={styles.filterIcon} />
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                localStorage.setItem('hospital_join_page_limit', String(newLimit));
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.listContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Hospital / Facility Name</th>
                <th>Official Work Email</th>
                <th>Contact Person Name</th>
                <th>Work Mobile Number</th>
                <th>Requested Date</th>
               
                {/* <th>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className={`${styles.facilityName} whitespace-pre-wrap break-all`}>
                        <span className={styles.facilityIcon}>
                          <Building2 size={16} />
                        </span>
                        {request.hospitalName}
                      </div>
                    </td>
                    <td>
                      <div className={`${styles.cellWithIcon} whitespace-pre-wrap break-all`}>
                        <Mail size={14} className={styles.cellIcon} />
                        {request.workEmail}
                      </div>
                    </td>
                    <td>
                      <div className={`${styles.cellWithIcon} whitespace-pre-wrap break-all`}>
                        <User size={14} className={styles.cellIcon} />
                        {request.contactName}
                      </div>
                    </td>
                    <td>
                      <div className={styles.cellWithIcon}>
                        <Phone size={14} className={styles.cellIcon} />
                        <span className="whitespace-pre-wrap break-all">{request.mobile}</span>
                      </div>
                    </td>
                    <td>
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                   
                    {/* <td>
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnMail}`}
                          title={`Email ${request.workEmail}`}
                          onClick={() => openGmailCompose(request)}
                        >
                          <Mail size={16} />
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>
                        <Building2 size={32} />
                      </div>
                      <h3>No join requests yet</h3>
                      <p>
                        When hospitals submit the Request Access form, their details will appear here for review.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {requests.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default HospitalJoinRequests;
