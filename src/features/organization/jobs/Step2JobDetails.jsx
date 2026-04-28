import React from 'react';
import styles from './PostJobWizard.module.css';

const Step2JobDetails = ({ data, updateData, entities }) => {
  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    updateData({ [e.target.name]: value });
  };

  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Min Experience (Years)</label>
        <input 
          type="number" 
          name="experience_min_yrs" 
          className={styles.input} 
          min="0"
          value={data.experience_min_yrs || ''}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Max Experience (Years)</label>
        <input 
          type="number" 
          name="experience_max_yrs" 
          className={styles.input} 
          min="0"
          value={data.experience_max_yrs || ''}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Min Monthly Salary (₹)</label>
        <input 
          type="number" 
          name="salary_min" 
          className={styles.input} 
          placeholder="e.g. 30000"
          value={data.salary_min || ''}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Max Monthly Salary (₹)</label>
        <input 
          type="number" 
          name="salary_max" 
          className={styles.input} 
          placeholder="e.g. 50000"
          value={data.salary_max || ''}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Job Type</label>
        <select 
          name="job_type" 
          className={styles.select} 
          value={data.job_type?.[0]?.id || ''}
          onChange={(e) => {
            const selected = entities.work_type?.find(item => item.id === e.target.value);
            updateData({ job_type: selected ? [{ id: selected.id, name: selected.label }] : null });
          }}
        >
          <option value="">Select Type</option>
          {entities.work_type?.map(item => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Shift Type</label>
        <select 
          name="shift_type" 
          className={styles.select} 
          value={data.shift_type?.[0]?.id || ''}
          onChange={(e) => {
            const selected = entities.shift?.find(item => item.id === e.target.value);
            updateData({ shift_type: selected ? [{ id: selected.id, name: selected.label }] : null });
          }}
        >
          <option value="">Select Shift</option>
          {entities.shift?.map(item => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Urgency Level</label>
        <select 
          name="urgency" 
          className={styles.select} 
          value={data.urgency?.[0]?.id || ''}
          onChange={(e) => {
            const selected = entities.urgency?.find(item => item.id === e.target.value);
            updateData({ urgency: selected ? [{ id: selected.id, name: selected.label }] : null });
          }}
        >
          <option value="">Select Urgency</option>
          {entities.urgency?.map(item => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Openings Count</label>
        <input 
          type="number" 
          name="openings_count" 
          className={styles.input} 
          min="1"
          value={data.openings_count || 1}
          onChange={handleChange}
        />
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label className={styles.label}>Job Description</label>
        <textarea 
          name="description" 
          className={styles.textarea} 
          placeholder="Detailed description of the role..."
          value={data.description || ''}
          onChange={handleChange}
        />
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label className={styles.label}>Responsibilities</label>
        <textarea 
          name="responsibilities" 
          className={styles.textarea} 
          placeholder="Daily tasks and responsibilities..."
          value={data.responsibilities || ''}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Step2JobDetails;
