import { useState } from 'react';
import styles from './LoginForm.module.css';
import Button from '../../../components/Button';
import { Link } from 'lucide-react';
import { FormOverlayContainer, FormSubmitOverlay } from '../../../components/Skeleton';

function LoginForm({ onSendOtp, onGoToRegister, loading }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && !loading) onSendOtp(email);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Login with your registered email</p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <button type="button" className={styles.forgotLink}>Forgot?</button>
          </div>
          <input
            id="email"
            type="email"
            placeholder="Placeholder"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <Button type="submit" variant="primary" fullWidth disabled={!email || loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </form>
      
      <div className={styles.footer}>
        <button onClick={onGoToRegister} className={styles.linkButton} disabled={loading}>
          <Link className={styles.linkIcon} size={14} /> New here? Create Account
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
