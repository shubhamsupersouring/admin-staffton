import apiClient from '../../../services/apiClient';

const JobService = {
  /**
   * Save Step 1: Basic Information (admin creates job for an org)
   */
  saveStep1: async (data) => {
    const response = await apiClient.post('/admin/jobs', {
      org_id: data.org_id,
      title: data.title,
      profession: data.profession,
      specialisation: data.specialisation,
      state: data.state,
      city: data.city,
      experience_min_yrs: data.experience_min_yrs,
      experience_max_yrs: data.experience_max_yrs,
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      status: 'draft',
      current_step: 1
    });
    return response.data;
  },

  /**
   * Save Step 2: Job Details
   */
  saveStep2: async (data) => {
    const response = await apiClient.put(`/admin/jobs/${data.id}`, {
      job_type: data.job_type,
      shift_type: data.shift_type,
      urgency: data.urgency,
      openings_count: data.openings_count,
      description: data.description,
      responsibilities: data.responsibilities,
      required_qualification: data.required_qualification,
      required_documents: data.required_documents,
      custom_document: data.custom_document,
      current_step: 2
    });
    return response.data;
  },

  /**
   * Save Step 3: Finalize and Publish
   */
  saveStep3: async (id) => {
    const response = await apiClient.put(`/admin/jobs/${id}`, {
      status: 'active',
      is_active: true,
      published_at: new Date().toISOString(),
      current_step: 3
    });
    return response.data;
  },

  /**
   * Fetch dynamic entities for dropdowns
   */
  getEntities: async () => {
    const response = await apiClient.get('/admin/entities/public');
    return response.data;
  },

  /**
   * Fetch drafted job to resume
   */
  getLatestDraft: async () => {
    try {
      const response = await apiClient.get('/admin/jobs', { params: { status: 'draft', limit: 1 } });
      return { data: response.data.data?.[0] || null };
    } catch {
      return { data: null };
    }
  },

  /**
   * Fetch job details
   */
  getJobDetails: async (id) => {
    const response = await apiClient.get(`/admin/jobs/${id}`);
    return response.data;
  },

  /**
   * List organizations for dropdown
   */
  getOrganizations: async () => {
    const response = await apiClient.get('/admin/organizations');
    return response.data;
  }
};

export default JobService;
