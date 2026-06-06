/** 诊断流程自定义Hook */

import { useState, useCallback } from 'react';
import { createDiagnosis, getDiagnosis } from '../api/diagnosis';
import type { DiagnosisResult } from '../types';

interface UseDiagnosisReturn {
  diagnosis: DiagnosisResult | null;
  loading: boolean;
  error: string;
  startDiagnosis: (resumeId: number, targetJob?: string) => Promise<void>;
  refreshDiagnosis: (diagnosisId: number) => Promise<void>;
}

export function useDiagnosis(): UseDiagnosisReturn {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startDiagnosis = useCallback(async (resumeId: number, targetJob: string = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await createDiagnosis({ resume_id: resumeId, target_job: targetJob });
      setDiagnosis(res.data);
    } catch (err: any) {
      setError(err.message || '诊断失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDiagnosis = useCallback(async (diagnosisId: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await getDiagnosis(diagnosisId);
      setDiagnosis(res.data);
    } catch (err: any) {
      setError(err.message || '获取诊断报告失败');
    } finally {
      setLoading(false);
    }
  }, []);

  return { diagnosis, loading, error, startDiagnosis, refreshDiagnosis };
}
