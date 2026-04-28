import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin, clearError } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import styles from './Login.module.css';
import { FormOverlayContainer, FormSubmitOverlay } from '../components/Skeleton';
import { EyeOff,EyeIcon } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Successfully logged in!');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    dispatch(adminLogin(formData));
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Portal</h1>
        <p className={styles.subtitle}>Sign in to manage your healthcare platform</p>
      </header>

      <FormOverlayContainer>
        <FormSubmitOverlay show={loading} message="Authenticating..." />
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              className={styles.input}
              type="email"
              name="email"
              placeholder="you@organization.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="login-password">
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="login-password"
                className={styles.input}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeIcon className='w-5 h-5' />
                ) : (
                  <EyeOff className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            System Login <ArrowRight size={18} aria-hidden />
          </button>
        </form>
      </FormOverlayContainer>

   
    </div>
  );
}

export default Login;

