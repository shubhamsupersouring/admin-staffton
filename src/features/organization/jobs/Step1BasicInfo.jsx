import React from 'react';
import styles from './PostJobWizard.module.css';

const Step1BasicInfo = ({ data, updateData, entities }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.formGrid}>
      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label className={styles.label}>Job Title</label>
        <input 
          type="text" 
          name="title" 
          className={styles.input} 
          placeholder="e.g. Registered Nurse, Senior Surgeon"
          value={data.title || ''}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Profession (Role)</label>
        <select 
          name="profession" 
          className={styles.select} 
          value={data.profession?.[0]?.id || ''}
          onChange={(e) => {
            const selected = entities.role?.find(r => r.id === e.target.value);
            updateData({ profession: selected ? [{ id: selected.id, name: selected.label }] : null });
          }}
        >
          <option value="">Select Role</option>
          {entities.role?.map(role => (
            <option key={role.id} value={role.id}>{role.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Specialization</label>
        <select 
          name="specialisation" 
          className={styles.select} 
          value={data.specialisation?.[0]?.id || ''}
          onChange={(e) => {
            const selected = entities.specialization?.find(s => s.id === e.target.value);
            updateData({ specialisation: selected ? [{ id: selected.id, name: selected.label }] : null });
          }}
        >
          <option value="">Select Specialization</option>
          {entities.specialization?.map(spec => (
            <option key={spec.id} value={spec.id}>{spec.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>State</label>
        <input 
          type="text" 
          name="state" 
          className={styles.input} 
          placeholder="e.g. Maharashtra"
          value={data.state || ''}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>City</label>
        <input 
          type="text" 
          name="city" 
          className={styles.input} 
          placeholder="e.g. Mumbai"
          value={data.city || ''}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Step1BasicInfo;
