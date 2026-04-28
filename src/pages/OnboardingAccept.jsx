import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './OnboardingAccept.module.css';
import apiClient from '../services/apiClient';
import { OnboardingAcceptSkeleton, FormOverlayContainer, FormSubmitOverlay } from '../components/Skeleton';

const OnboardingAccept = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid invitation link.');
      navigate('/login');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await apiClient.get(`/auth/invitation/verify/${token}`);
        setInviteData(res.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Link expired or invalid');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/auth/invitation/accept', { token, password });
      toast.success('Account set up successfully!');
      
      // Store token
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.member));
      localStorage.setItem('userType', 'org_member');
      
      // Wait a moment and redirect to dashboard
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <OnboardingAcceptSkeleton />;

  return (
    <div className={styles.onboardingPage}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.brandLogo}>
            <Building size={30} />
          </div>
          <h1 className={styles.title}>Welcome to Staffton</h1>
          <p className={styles.subtitle}>
            Hello <strong>{inviteData.contact_name}</strong>, you've been invited to manage 
            <strong> {inviteData.org_name}</strong>. Set up your secure account password below.
          </p>
        </header>

        <FormOverlayContainer>
          <FormSubmitOverlay show={submitting} message="Securing your account..." />
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Choose Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Minimum 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className={styles.toggleBtn} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Re-type Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Repeat your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Setting up...' : 'Get Started'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>
        </FormOverlayContainer>

        <footer className={styles.footer}>
          <p>By proceeding, you agree to our Terms of Service and data protection policies.</p>
        </footer>
      </div>
    </div>

  );
};

export default OnboardingAccept;
