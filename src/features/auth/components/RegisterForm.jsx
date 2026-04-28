import { useState } from 'react';
import styles from './RegisterForm.module.css';
import Button from '../../../components/Button';
import { Link } from 'lucide-react';
import { FormOverlayContainer, FormSubmitOverlay } from '../../../components/Skeleton';

function RegisterForm({ onRegister, onGoToLogin, loading }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    agreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.agreed && !loading) {
      onRegister(formData);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join 50,000+ healthcare professionals</p>
      </div>
      
      <FormOverlayContainer>
        <FormSubmitOverlay show={loading} message="Sending OTP..." />
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="fullName" className={styles.label}>Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Ex: John Smith"
            className={styles.input}
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Ex: example@email.com"
            className={styles.input}
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="mobile" className={styles.label}>Mobile Number</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            placeholder="Ex: 65XXX XX34"
            className={styles.input}
            value={formData.mobile}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.checkboxGroup}>
          <input
            id="agreed"
            name="agreed"
            type="checkbox"
            className={styles.checkbox}
            checked={formData.agreed}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <label htmlFor="agreed" className={styles.checkboxLabel}>
            I agree to the <span className={styles.linkText}>Terms of Service</span> and <span className={styles.linkText}>Privacy Policy</span> (DPDPA compliant)
          </label>
        </div>
        
        <Button type="submit" variant="primary" fullWidth disabled={!formData.agreed || loading}>
          {loading ? 'Sending OTP...' : 'Continue & send otp'}
        </Button>
      </form>
      </FormOverlayContainer>
      
      <div className={styles.footer}>
        <button onClick={onGoToLogin} className={styles.linkButton} disabled={loading}>
          <Link className={styles.linkIcon} size={14} /> Already have account ? login
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
