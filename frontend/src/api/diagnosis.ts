/** 诊断相关API */

import client from './client';
import type { ApiResponse, DiagnosisResult, DiagnosisCreateRequest, PolishResult, PolishCreateRequest } from '../types';

/** 发起诊断 */
export async function createDiagnosis(data: DiagnosisCreateRequest): Promise<ApiResponse<DiagnosisResult>> {
  return client.post('/diagnoses', data);
}

/** 获取诊断报告 */
export async function getDiagnosis(diagnosisId: number): Promise<ApiResponse<DiagnosisResult>> {
  return client.get(`/diagnoses/${diagnosisId}`);
}

/** 发起润色 */
export async function createPolish(data: PolishCreateRequest): Promise<ApiResponse<PolishResult>> {
  return client.post('/polish', data);
}

/** 获取润色结果 */
export async function getPolish(polishId: number): Promise<ApiResponse<PolishResult>> {
  return client.get(`/polish/${polishId}`);
}
