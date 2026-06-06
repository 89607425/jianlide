/** 简历相关API */

import client from './client';
import type { ApiResponse, ResumeUploadResponse, ResumeDetail, ResumeListResponse } from '../types';

/** 上传简历PDF */
export async function uploadResume(file: File): Promise<ApiResponse<ResumeUploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

/** 获取简历详情 */
export async function getResumeDetail(resumeId: number): Promise<ApiResponse<ResumeDetail>> {
  return client.get(`/resumes/${resumeId}`);
}

/** 获取当前用户的简历列表 */
export async function getResumeList(): Promise<ApiResponse<ResumeListResponse>> {
  return client.get('/resumes');
}
