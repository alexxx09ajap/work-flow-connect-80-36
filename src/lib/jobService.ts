
import api from '@/services/api';
import { UserType } from '@/contexts/AuthContext';
import { JobType, CommentType, ReplyType } from '@/contexts/JobContext';

// Get all jobs with optional filters
export const getAllJobs = async (filters = {}) => {
  try {
    const response = await api.get('/jobs', { params: filters });
    return response.data.jobs || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Get job by ID
export const getJobById = async (jobId: string) => {
  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data.job;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
};

// Create a new job
export const createJob = async (jobData: any) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data.job;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

// Update job
export const updateJob = async (jobId: string, jobData: Partial<JobType>) => {
  try {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data.job;
  } catch (error) {
    console.error(`Error updating job ${jobId}:`, error);
    throw error;
  }
};

// Delete job
export const deleteJob = async (jobId: string) => {
  try {
    await api.delete(`/jobs/${jobId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error);
    throw error;
  }
};

// Add comment to job
export const addCommentToJob = async (jobId: string, content: string, user: UserType) => {
  try {
    const response = await api.post(`/jobs/${jobId}/comments`, { content });
    return response.data.comment;
  } catch (error) {
    console.error(`Error adding comment to job ${jobId}:`, error);
    throw error;
  }
};

// Add reply to comment
export const addReplyToComment = async (jobId: string, commentId: string, content: string, user: UserType) => {
  try {
    const response = await api.post(`/comments/${commentId}/replies`, { content });
    return response.data.reply;
  } catch (error) {
    console.error(`Error adding reply to comment ${commentId}:`, error);
    throw error;
  }
};

// Toggle job like
export const toggleJobLike = async (jobId: string, userId: string) => {
  try {
    const response = await api.post(`/jobs/${jobId}/like`);
    return response.data.liked;
  } catch (error) {
    console.error(`Error toggling like for job ${jobId}:`, error);
    throw error;
  }
};

// Toggle saved job
export const toggleSavedJob = async (userId: string, jobId: string) => {
  try {
    const response = await api.post(`/jobs/${jobId}/save`);
    return response.data.saved;
  } catch (error) {
    console.error(`Error toggling saved status for job ${jobId}:`, error);
    throw error;
  }
};

// Get saved jobs for a user
export const getSavedJobs = async (userId: string) => {
  try {
    const response = await api.get(`/users/saved-jobs`);
    return response.data.jobs || [];
  } catch (error) {
    console.error(`Error fetching saved jobs for user ${userId}:`, error);
    throw error;
  }
};
