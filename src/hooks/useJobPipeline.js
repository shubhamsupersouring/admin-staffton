import { useState, useCallback } from 'react';
import { jobService } from '../services/job.service';

/**
 * Hook to fetch and manage candidate pipeline statistics.
 * @param {string} jobId 
 */
export const useJobPipelineStats = (jobId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await jobService.getPipelineStats(jobId);
      console.log('API Response for Pipeline Stats (/api/v1/admin/jobs/{id}/pipeline/stats):', response);
      setStats(response);
    } catch (err) {
      console.error('Error fetching pipeline stats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  return { stats, loading, error, fetchStats };
};

/**
 * Hook to fetch and manage chat details for a specific job application.
 */
export const useApplicationChat = () => {
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChat = useCallback(async (applicationId) => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await jobService.getApplicationChat(applicationId);
      console.log(`API Response for Application Chat (/api/v1/admin/jobs/applications/${applicationId}/chat):`, response);
      setChatData(response);
      return response;
    } catch (err) {
      console.error(`Error fetching application chat for ID ${applicationId}:`, err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { chatData, loading, error, fetchChat, setChatData };
};
