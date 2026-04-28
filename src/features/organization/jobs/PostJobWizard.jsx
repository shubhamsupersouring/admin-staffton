import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import styles from './PostJobWizard.module.css';
import JobService from './jobService';

// Child Steps
import Step1BasicInfo from './Step1BasicInfo';
import Step2JobDetails from './Step2JobDetails';
import Step3Review from './Step3Review';

const PostJobWizard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobIdFromQuery = searchParams.get('id');

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!jobIdFromQuery);
  const [entities, setEntities] = useState({
    role: [],
    specialization: [],
    work_type: [],
    shift: [],
    urgency: []
  });

  const [jobData, setJobData] = useState({
    id: jobIdFromQuery || null,
    title: '',
    profession: null,
    specialisation: null,
    state: '',
    city: '',
    experience_min_yrs: '',
    experience_max_yrs: '',
    salary_min: '',
    salary_max: '',
    job_type: null,
    shift_type: null,
    urgency: null,
    openings_count: 1,
    description: '',
    responsibilities: '',
    required_qualification: '',
    required_documents: [],
    custom_document: []
  });

  // Load Entities and Draft Data
  useEffect(() => {
    const init = async () => {
      try {
        const entityRes = await JobService.getEntities();
        setEntities(entityRes.data);

        if (jobIdFromQuery) {
          const jobRes = await JobService.getJobDetails(jobIdFromQuery);
          const job = jobRes.data;
          setJobData({
            ...jobData,
            ...job
          });
          setCurrentStep(job.current_step || 1);
        } else {
            // Check for latest draft if no ID in query
            const draftRes = await JobService.getLatestDraft();
            if (draftRes.data) {
                const draft = draftRes.data;
                toast(
                    (t) => (
                      <span>
                        Found a draft job: <b>{draft.title || 'Untitled'}</b>. 
                        <button 
                          onClick={() => {
                              setJobData({ ...jobData, ...draft });
                              setCurrentStep(draft.step || 1);
                              toast.dismiss(t.id);
                          }}
                          style={{ marginLeft: '10px', background: '#009688', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Resume
                        </button>
                      </span>
                    ),
                    { duration: 6000 }
                );
            }
        }
      } catch (error) {
        toast.error('Failed to initialize form data');
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [jobIdFromQuery]);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (currentStep === 1) {
        const res = await JobService.saveStep1(jobData);
        setJobData({ ...jobData, id: res.data.id });
        setCurrentStep(2);
      } else if (currentStep === 2) {
        await JobService.saveStep2(jobData);
        setCurrentStep(3);
      } else if (currentStep === 3) {
        await JobService.saveStep3(jobData.id);
        toast.success('Job posted successfully!');
        navigate('/jobs');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Loader2 className="animate-spin" size={48} color="#009688" />
      </div>
    );
  }

  const steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Job Details' },
    { number: 3, label: 'Review & Post' }
  ];

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.wizardHeader}>
        <h1 className={styles.title}>Post a New Job</h1>
        <p className={styles.subtitle}>Fill in the details below to find your perfect candidate</p>
      </div>

      <div className={styles.stepper}>
        {steps.map((step) => (
          <div 
            key={step.number} 
            className={`${styles.step} ${currentStep === step.number ? styles.activeStep : ''} ${currentStep > step.number ? styles.completedStep : ''}`}
          >
            <div className={styles.stepNumber}>{step.number}</div>
            <div className={styles.stepLabel}>{step.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.stepContent}>
        {currentStep === 1 && (
          <Step1BasicInfo 
            data={jobData} 
            updateData={(updates) => setJobData({ ...jobData, ...updates })} 
            entities={entities}
          />
        )}
        {currentStep === 2 && (
          <Step2JobDetails 
            data={jobData} 
            updateData={(updates) => setJobData({ ...jobData, ...updates })} 
            entities={entities}
          />
        )}
        {currentStep === 3 && (
          <Step3Review 
            data={jobData} 
            entities={entities}
          />
        )}
      </div>

      <div className={styles.footer}>
        <button 
          className={styles.backBtn} 
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            color: '#64748b',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          <ChevronLeft size={18} /> Back
        </button>

        <button 
          className={styles.nextBtn} 
          onClick={handleNext}
          disabled={loading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '10px 24px',
            background: '#009688',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontWeight: '600',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : currentStep === 3 ? (
            <>Post Job <Send size={18} /></>
          ) : (
            <>Next Step <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default PostJobWizard;
