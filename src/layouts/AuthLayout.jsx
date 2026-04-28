import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';
import fullLogo from '../assets/svg/staffon-logo.svg';
import loginImage from '../assets/images/login-left.jpg'
function AuthLayout() {
  return (
    <div className='max-h-screen'>
      <div className={styles.shell}>
        <div className='p-4 max-h-screen'>
          <img src={loginImage} alt='auth-side-logo object-fit' />
        </div>

        <div className={styles.rightSide}>
          <div className="w-full flex flex-col space-y-20">
            <img src={fullLogo} alt="Staffton" className='mb-[100px] w-fit' />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;



