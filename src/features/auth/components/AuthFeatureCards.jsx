import { Hospital, Briefcase, Users } from 'lucide-react';
import styles from './AuthFeatureCards.module.css';

const stats = [
  {
    icon: <Hospital className={styles.icon} />,
    value: '500+',
    label: 'Hospital',
    color: '#009688',
  },
  {
    icon: <Briefcase className={styles.icon} />,
    value: '10k',
    label: 'Jobs',
    color: '#00bfa5',
  },
  {
    icon: <Users className={styles.icon} />,
    value: '100',
    label: 'Professionals',
    color: '#4db6ac',
  },
];

function AuthFeatureCards() {
  return (
    <div className={styles.container}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.iconWrapper} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
            {stat.icon}
          </div>
          <div className={styles.textWrapper}>
            <div className={styles.value}>{stat.value}</div>
            <div className={styles.label}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AuthFeatureCards;
