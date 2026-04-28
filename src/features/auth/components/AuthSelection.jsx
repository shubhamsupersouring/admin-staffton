import styles from './AuthSelection.module.css';
import Button from '../../../components/Button';

function AuthSelection({ onSelectStep }) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Find Healthcare Jobs</h1>
      <p className={styles.subtitle}>
        That Match Your Skills India's dedicated platform for healthcare professionals
      </p>
      
      <div className={styles.buttonGroup}>
        <Button 
          variant="primary" 
          fullWidth 
          className={styles.button}
          onClick={() => onSelectStep('register')}
        >
          Create Account
        </Button>
        <Button 
          variant="outline" 
          fullWidth 
          className={styles.button}
          onClick={() => onSelectStep('login')}
        >
          Login
        </Button>
      </div>
    </div>
  );
}

export default AuthSelection;
