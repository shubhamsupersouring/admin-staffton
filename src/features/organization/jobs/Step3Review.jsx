import React from 'react';
import { CheckCircle2, MapPin, Briefcase, Clock, IndianRupee, Users, AlertTriangle } from 'lucide-react';
import styles from './PostJobWizard.module.css';

const Step3Review = ({ data, entities }) => {
  const getLabel = (fieldData) => {
    if (!fieldData) return 'Not Specified';
    if (Array.isArray(fieldData)) {
      return fieldData.map(item => item.name || item.label).join(', ');
    }
    return fieldData.name || fieldData.label || 'Not Specified';
  };

  const sections = [
    {
      title: 'Basic Information',
      icon: <Briefcase size={20} color="#009688" />,
      fields: [
        { label: 'Title', value: data.title },
        { label: 'Role', value: getLabel(data.profession) },
        { label: 'Specialization', value: getLabel(data.specialisation) }
      ]
    },
    {
      title: 'Location',
      icon: <MapPin size={20} color="#009688" />,
      fields: [
        { label: 'State', value: data.state },
        { label: 'City', value: data.city }
      ]
    },
    {
      title: 'Employment Details',
      icon: <Clock size={20} color="#009688" />,
      fields: [
        { label: 'Type', value: getLabel(data.job_type) },
        { label: 'Shift', value: getLabel(data.shift_type) },
        { label: 'Experience', value: `${data.experience_min_yrs} - ${data.experience_max_yrs} Years` },
        { label: 'Salary', value: `₹${data.salary_min} - ₹${data.salary_max}` }
      ]
    },
    {
      title: 'Additional Info',
      icon: <Users size={20} color="#009688" />,
      fields: [
        { label: 'Openings', value: data.openings_count },
        { label: 'Urgency', value: getLabel(data.urgency) }
      ]
    }
  ];

  return (
    <div className={styles.reviewContainer}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#e0f2f1', borderRadius: '4px', border: '1px solid #b2dfdb' }}>
        <CheckCircle2 color="#009688" size={24} />
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#00695c' }}>Almost there!</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#00796b' }}>Please review the job details before posting. You can always edit this later.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {sections.map((section, idx) => (
          <div key={idx} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              {section.icon}
              <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>{section.title}</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {section.fields.map((f, fidx) => (
                <div key={fidx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>{f.label}:</span>
                  <span style={{ color: '#1e293b', fontWeight: '600' }}>{f.value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        <h4 style={{ fontSize: '15px', marginBottom: '12px', color: '#1e293b' }}>Job Description</h4>
        <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {data.description || 'No description provided.'}
        </div>
      </div>
    </div>
  );
};

export default Step3Review;
