import { useState, useRef, useEffect } from 'react';
import styles from './OTPVerify.module.css';
import Button from '../../../components/Button';
import { ArrowLeft } from 'lucide-react';
import { FormOverlayContainer, FormSubmitOverlay } from '../../../components/Skeleton';

function OTPVerify({ mobile, onVerify, onBack, onResend, loading }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(27);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 6 && !loading) {
      onVerify(code);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Verify Your Number</h1>
        <p className={styles.subtitle}>Enter the 6-digit OTP sent to your email</p>
      </div>

      <FormOverlayContainer>
        <FormSubmitOverlay show={loading} message="Verifying OTP..." />
      <div className={styles.otpSection}>
        <label className={styles.label}>Enter Otp</label>
        <div className={styles.otpGrid}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              className={styles.otpInput}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              disabled={loading}
            />
          ))}
        </div>
      </div>
      
      <Button 
        variant="primary" 
        fullWidth 
        onClick={handleVerify}
        disabled={otp.join('').length < 6 || loading}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>
      </FormOverlayContainer>
      
      <div className={styles.footer}>
        <button onClick={onBack} className={styles.backButton} disabled={loading}>
          <ArrowLeft size={16} /> Edit Details
        </button>
        <button 
          onClick={onResend} 
          disabled={timer > 0 || loading} 
          className={styles.resendButton}
        >
          {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP now'}
        </button>
      </div>
    </div>
  );
}

export default OTPVerify;
