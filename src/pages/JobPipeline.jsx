import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutList,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Eye,
  AlertCircle,
  Lock,
  Check,
  X,
  FileText,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';
import styles from './JobPipeline.module.css';
import { jobService } from '../services/job.service';
import { candidateService } from '../services/candidate.service';
import { useJobPipelineStats, useApplicationChat } from '../hooks/useJobPipeline';
import toast from 'react-hot-toast';
import { Avatar } from '../utils/avatar';

const JobPipeline = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Applied');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });

  // Custom API Hooks
  const { stats: pipelineStats, loading: statsLoading, fetchStats } = useJobPipelineStats(jobId);
  const { chatData, loading: chatLoading, fetchChat } = useApplicationChat();

  const getMessageDetails = (msg) => {
    const isSelf = msg.sender ? msg.sender === 'admin' : msg.sender_type !== 'candidate';
    const textContent = msg.text || msg.content;
    const timeText = msg.time || (msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
    const isRead = msg.is_read || msg.status === 'read';
    return { isSelf, textContent, timeText, isRead };
  };

  const renderMessageContent = (textContent) => {
    if (!textContent) return null;

    // Check if it's a JSON string representing an interview invitation
    if (textContent.trim().startsWith('{') && textContent.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(textContent);
        if (parsed && parsed.type === 'interview_invitation') {
          return (
            <div className={styles.invitationCard}>
              <div className={styles.invitationHeader}>
                <Calendar size={16} />
                <h4>{parsed.title || 'Interview Invitation'}</h4>
              </div>

              <div className={styles.invitationDetails}>
                {parsed.interview_type && (
                  <div className={styles.inviteDetailItem}>
                    <strong>Type:</strong> <span>{parsed.interview_type.replace('_', ' ')}</span>
                  </div>
                )}
                {parsed.interviewer && (
                  <div className={styles.inviteDetailItem}>
                    <strong>Interviewer:</strong> <span>{parsed.interviewer}</span>
                  </div>
                )}
                {parsed.duration_minutes && (
                  <div className={styles.inviteDetailItem}>
                    <strong>Duration:</strong> <span>{parsed.duration_minutes} mins</span>
                  </div>
                )}
                {parsed.location && (
                  <div className={styles.inviteDetailItem}>
                    <strong>Location:</strong> <span>{parsed.location}</span>
                  </div>
                )}
                {parsed.address && (
                  <div className={styles.inviteDetailItem}>
                    <strong>Address:</strong> <span>{parsed.address}</span>
                  </div>
                )}
                {parsed.meeting_link && (
                  <div className={styles.inviteDetailItem}>
                    <strong>Meeting Link:</strong>{' '}
                    <a href={parsed.meeting_link} target="_blank" rel="noopener noreferrer" className={styles.meetingLink}>
                      Join Meeting
                    </a>
                  </div>
                )}
                {parsed.note_to_candidate && (
                  <div className={styles.inviteNote}>
                    <strong>Note:</strong> <p>{parsed.note_to_candidate}</p>
                  </div>
                )}
              </div>

              {parsed.slots && parsed.slots.length > 0 && (
                <div className={styles.slotsContainer}>
                  <h5>Proposed Slots:</h5>
                  {parsed.slots.map((slot, index) => {
                    const slotDate = slot.date ? new Date(slot.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
                    return (
                      <div key={slot.id || index} className={styles.slotBadge}>
                        {slotDate} at {slot.time} ({slot.status})
                      </div>
                    );
                  })}
                </div>
              )}

              {parsed.date && (
                <div className={styles.singleSlot}>
                  <strong>Date & Time:</strong> {parsed.date} {parsed.time ? `at ${parsed.time}` : ''}
                </div>
              )}

              {parsed.status && (
                <div className={`${styles.statusBadge} ${styles[parsed.status]}`}>
                  Status: {parsed.status}
                </div>
              )}
            </div>
          );
        }
      } catch (e) {
        // Fallback to plain text if JSON parsing fails
      }
    }

    return <p>{textContent}</p>;
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatCandidate, setChatCandidate] = useState(null);
  const [chatMessages, setChatMessages] = useState({});

  const getInitialMockMessages = (candidate) => {
    const name = candidate.full_name || 'Candidate';
    const role = candidate.primary_role || 'Staff Nurse';
    const stage = activeTab;

    const baseMessages = [
      {
        id: 1,
        text: `Hello, I'm interested in the ${role} position.`,
        sender: 'candidate',
        time: '10:30 AM',
      },
      {
        id: 2,
        text: `Hi ${name}, thank you for your interest! We have received your application.`,
        sender: 'admin',
        time: '10:35 AM',
      }
    ];

    if (stage === 'Applied') {
      baseMessages.push({
        id: 3,
        text: `Please let me know if you need any additional documents from my side.`,
        sender: 'candidate',
        time: '11:00 AM'
      });
    } else if (stage === 'Under Review') {
      baseMessages.push({
        id: 3,
        text: `We are currently reviewing your qualifications. We will get back to you shortly.`,
        sender: 'admin',
        time: 'Yesterday, 3:15 PM'
      });
      baseMessages.push({
        id: 4,
        text: `Sure, thank you for the update. Looking forward to hearing from you.`,
        sender: 'candidate',
        time: 'Yesterday, 3:20 PM'
      });
    } else if (stage === 'Shortlisted') {
      baseMessages.push({
        id: 3,
        text: `Congratulations! You have been shortlisted for this position. The HR team will contact you shortly for the next steps.`,
        sender: 'admin',
        time: '16:47'
      });
      baseMessages.push({
        id: 4,
        text: `hlo`,
        sender: 'candidate',
        time: '17:01',
        status: 'read'
      });
      baseMessages.push({
        id: 5,
        text: `hmm lets see for the jobs`,
        sender: 'candidate',
        time: '17:02',
        status: 'read'
      });
    } else if (stage === 'Interview') {
      baseMessages.push({
        id: 3,
        text: `We would like to schedule an interview with you. Are you available this Thursday at 2 PM?`,
        sender: 'admin',
        time: 'May 18, 2:00 PM'
      });
      baseMessages.push({
        id: 4,
        text: `Yes, Thursday at 2 PM works perfectly for me. I've received the calendar invite.`,
        sender: 'candidate',
        time: 'May 18, 2:15 PM'
      });
    } else if (stage === 'Offered') {
      baseMessages.push({
        id: 3,
        text: `We are pleased to extend an offer to you. The offer letter has been sent to your email. Please review and sign it.`,
        sender: 'admin',
        time: 'May 19, 10:00 AM'
      });
      baseMessages.push({
        id: 4,
        text: `Thank you so much! I am thrilled to receive the offer. I will review it today.`,
        sender: 'candidate',
        time: 'May 19, 10:15 AM'
      });
    } else if (stage === 'Hired') {
      baseMessages.push({
        id: 3,
        text: `Welcome to the team, ${name}! Your onboarding starts next Monday.`,
        sender: 'admin',
        time: 'May 19, 11:00 AM'
      });
      baseMessages.push({
        id: 4,
        text: `Thank you! Excited to join and get started!`,
        sender: 'candidate',
        time: 'May 19, 11:05 AM'
      });
    } else if (stage === 'Rejected') {
      baseMessages.push({
        id: 3,
        text: `Thank you for taking the time to interview with us. Unfortunately, we've decided to move forward with other candidates.`,
        sender: 'admin',
        time: 'May 17, 4:00 PM'
      });
      baseMessages.push({
        id: 4,
        text: `Thank you for the update. I appreciate the opportunity.`,
        sender: 'candidate',
        time: 'May 17, 4:30 PM'
      });
    }

    return baseMessages;
  };

  const handleOpenChat = (candidate) => {
    setChatCandidate(candidate);
    setIsChatOpen(true);

    if (candidate.application_id) {
      fetchChat(candidate.application_id).catch(err => {
        console.error("Failed to fetch application chat:", err);
      });
    } else {
      console.warn("No application_id found on candidate to fetch chat", candidate);
    }

    const candidateKey = candidate.application_id || candidate.candidate_id;
    if (!chatMessages[candidateKey]) {
      setChatMessages(prev => ({
        ...prev,
        [candidateKey]: getInitialMockMessages(candidate)
      }));
    }
  };



  const tabs = [
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview',
    'Offered',
    'Hired',
    'Rejected'
  ];

  const statusMap = {
    'Applied': 'applied',
    'Under Review': 'under_review',
    'Shortlisted': 'shortlisted',
    'Interview': 'interview',
    'Offered': 'offered',
    'Hired': 'hired',
    'Rejected': 'rejected'
  };

  const fetchCandidates = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    try {
      const response = await jobService.getPipeline(jobId, {
        status: statusMap[activeTab],
        page: pagination.page,
        pageSize: pagination.pageSize
      });

      console.log("Pipeline API Response:", response);

      if (response.success && response.data) {
        setCandidates(response.data.candidates || []);
        setPagination({
          total: response.data.total || 0,
          page: response.data.page || 1,
          pageSize: response.data.limit || 10,
          totalPages: response.data.totalPages || 1
        });
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  }, [jobId, activeTab, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    if (jobId) {
      fetchStats();
    }
  }, [jobId, fetchStats]);

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (id) => {
    const colors = ['#0f766e', '#1d4ed8', '#7c3aed', '#c026d3', '#db2777', '#dc2626', '#d97706'];
    const index = parseInt(id.substring(0, 2), 16) % colors.length;
    return colors[index] || '#0f766e';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleViewProfile = async (candidateId) => {
    setModalLoading(true);
    setIsModalOpen(true);
    try {
      const response = await candidateService.getCandidateDetails(candidateId);
      if (response.success) {
        setSelectedCandidate(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch candidate details');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      toast.error('Something went wrong');
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => navigate(-1)}
            className={styles.backBtn}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={styles.titleWrapper}>
            <h1>Candidate Pipeline</h1>
            <p>Manage applications and track candidate progress for this job</p>
          </div>
        </div>
        <button className={styles.viewToggle}>
          <LayoutList size={18} />
          List
        </button>
      </header>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map((tab) => {
            const count = pipelineStats?.data?.[statusMap[tab]] ?? 0;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`${styles.tab} flex gap-1 ${activeTab === tab ? styles.activeTab : ''}`}
              >
                {tab}

                <span >({count})</span>
                {/* className={styles.tabCount} */}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {/* Status Indicator */}
        <div className={styles.statusIndicator}>
          <div className={styles.dot} />
          {activeTab}
        </div>

        {/* Candidate List */}
        <div className={styles.candidateList}>
          {loading ? (
            <div className={styles.loadingState}>
              <Clock className={styles.spinIcon} size={48} />
              <p>Loading candidates...</p>
            </div>
          ) : candidates.length > 0 ? (
            candidates.map((candidate) => (
              <article
                key={candidate.application_id}
                className={styles.card}
              >
                {/* Card Top */}
                <div className={styles.cardTop}>
                  <div className={styles.candidateInfo}>
                    <Avatar 
                      name={candidate.full_name} 
                      imageUrl={candidate.profilePhoto} 
                      size="md" 
                    />
                    <div className={styles.nameWrapper}>
                      <h3>{candidate.full_name}</h3>
                      <p className={styles.role}>{candidate.primary_role}</p>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => handleViewProfile(candidate.candidate_id)}
                    >
                      <Eye size={18} />

                    </button>
                    <button
                      className={`${styles.chatBtn}  `}
                      onClick={() => handleOpenChat(candidate)}
                      title="Chat with Candidate"
                    >
                      <MessageSquare size={18} color='#0d9488' />
                    </button>
                  </div>
                </div>

                {/* Card Bottom */}
                <footer className={styles.cardBottom}>
                  <div className={styles.infoItem}>
                    <MapPin size={16} />
                    {candidate.city}, {candidate.state}
                  </div>
                  <div className={styles.infoItem}>
                    <Briefcase size={16} />
                    {candidate.years_experience} years
                  </div>
                  <div className={styles.infoItem}>
                    <Calendar size={16} />
                    {candidate.availability_to_join}
                  </div>
                  <div className={styles.infoItem}>
                    <LayoutList size={16} />
                    <span className={styles.jobId}>{candidate.job_id_display}</span>
                  </div>
                </footer>
              </article>
            ))
          ) : (
            <div className={styles.emptyState}>
              <AlertCircle size={48} />
              <h3>No candidates found</h3>
              <p>There are no candidates in the "{activeTab}" stage for this job.</p>
            </div>
          )}
        </div>

        {/* Reach End */}
        {!loading && candidates.length > 0 && (
          <div className={styles.footer}>
            Showing {candidates.length} of {pagination.total} candidates.
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>

            {modalLoading ? (
              <div className={styles.loadingState}>
                <Clock className={styles.spinIcon} size={40} />
                <p>Fetching candidate details...</p>
              </div>
            ) : selectedCandidate ? (
              <div className={styles.modalBody}>
                <div className={styles.candidateHeader}>
                  <div className={styles.headerFlex}>
                    <Avatar 
                      name={selectedCandidate.fullName || 'Candidate'} 
                      imageUrl={selectedCandidate.profilePhoto} 
                      size="xl" 
                    />
                    <div className={styles.headerInfo}>
                      <h2>{selectedCandidate.fullName}</h2>
                      <p className={styles.modalRole}>{selectedCandidate.role || 'No Role Specified'}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.detailCards}>
                  <div className={styles.detailCard}>
                    <div className={styles.detailCardIcon}>
                      <Briefcase size={16} />
                      Experience
                    </div>
                    <div className={styles.detailCardValue}>
                      {selectedCandidate.experience || `${selectedCandidate.years || 0} yrs experience`}
                    </div>
                  </div>

                  <div className={styles.detailCard}>
                    <div className={styles.detailCardIcon}>
                      <MapPin size={16} />
                      Location
                    </div>
                    <div className={styles.detailCardValue}>
                      {selectedCandidate.location || 'N/A'}
                    </div>
                  </div>

                  <div className={styles.detailCard}>
                    <div className={styles.detailCardIcon}>
                      <Calendar size={16} />
                      Availability
                    </div>
                    <div className={styles.detailCardValue}>
                      {selectedCandidate.availability || 'Immediately Available'}
                    </div>
                  </div>

                  <div className={styles.detailCard}>
                    <div className={styles.detailCardIcon}>
                      <LayoutList size={16} />
                      Last Workplace
                    </div>
                    <div className={styles.detailCardValue}>
                      {selectedCandidate.lastWorkplace || 'Not Provided'}
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>Professional Summary</h4>
                  <p className={styles.summaryText}>
                    {selectedCandidate.about || 'Dedicated professional with experience in their field.'}
                  </p>
                </div>

                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Skills</h4>
                    <div className={styles.skillsWrapper}>
                      {selectedCandidate.skills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>Contact Details</h4>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactItem}>
                      <Mail size={16} />
                      {selectedCandidate.email}
                    </div>
                    <div className={styles.contactItem}>
                      <Phone size={16} />
                      {selectedCandidate.mobile}
                    </div>
                  </div>
                </div>

                {selectedCandidate.documents && selectedCandidate.documents.length > 0 && (
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Documents</h4>
                    <div className={styles.docsList}>
                      {selectedCandidate.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.docItem}
                        >
                          <div className={styles.docIcon}>
                            <FileText size={18} />
                          </div>
                          <div className={styles.docDetails}>
                            <span className={styles.docName}>{doc.name}</span>
                            <span className={styles.docType}>{doc.type}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className={styles.emptyState}>
                <AlertCircle size={40} />
                <p>Failed to load candidate details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Drawer Sidebar */}
      {isChatOpen && chatCandidate && (
        <div className={styles.drawerOverlay} onClick={() => setIsChatOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <header className={styles.drawerHeader}>
              <div className={styles.drawerCandidateInfo}>
                <Avatar 
                  name={chatCandidate.full_name} 
                  imageUrl={chatCandidate.profilePhoto} 
                  size="md" 
                />
                <div className={styles.drawerNameWrapper}>
                  <h3>{chatCandidate.full_name}</h3>
                  <span className={styles.drawerStatusText}>Active Chat</span>
                </div>
              </div>
              <button className={styles.drawerClose} onClick={() => setIsChatOpen(false)}>
                <X size={20} />
              </button>
            </header>

            {/* Drawer Messages Body */}
            <div className={styles.drawerBody}>
              {chatLoading ? (
                <div className={styles.loadingState}>
                  <Clock className={styles.spinIcon} size={32} />
                  <p>Loading messages...</p>
                </div>
              ) : (
                <div className={styles.drawerMessages}>
                  {(chatData?.data?.metadata?.application_id === chatCandidate.application_id
                    ? chatData.data.messages
                    : chatMessages[chatCandidate.application_id || chatCandidate.candidate_id] || []
                  ).map((msg) => {
                    const { isSelf, textContent, timeText, isRead } = getMessageDetails(msg);
                    return (
                      <div
                        key={msg.id}
                        className={`${styles.messageWrapper} ${isSelf ? styles.messageSelf : styles.messageOther}`}
                      >
                        <div className={styles.messageBubble}>
                          {renderMessageContent(textContent)}
                          <div className={styles.messageMeta}>
                            <span>{timeText}</span>
                            {isSelf && (
                              <span className={styles.checkIcon}>
                                <Check size={12} style={{ color: isRead ? '#38bdf8' : 'currentColor' }} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Body Only */}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPipeline;
