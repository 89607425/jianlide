/** 诊断报告页 - 四维雷达图 + 详细分析 + 改进清单 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScoreBar from '../components/ScoreBar';
import LoadingSpinner from '../components/LoadingSpinner';
import RadarChart from '../components/RadarChart';
import type { DiagnosisResult, IssueItem, ChecklistItem } from '../types';

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green-600 bg-green-50',
  B: 'text-blue-600 bg-blue-50',
  C: 'text-amber-600 bg-amber-50',
  D: 'text-red-600 bg-red-50',
};

const GRADE_LABELS: Record<string, string> = {
  A: '优秀',
  B: '良好',
  C: '及格',
  D: '需改进',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: '严重',
  warning: '建议',
  info: '优化',
};

function getUserIsMember(): boolean {
  try {
    const u = JSON.parse(localStorage.getItem('jianlida_user') || '{}');
    return u.member_type === 1;
  } catch { return false; }
}

const DiagnosisPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('jianlida_token');
  const isMember = getUserIsMember();

  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resumeId || !token) { setLoading(false); return; }
    fetchLatestDiagnosis();
  }, [resumeId, token]);

  const fetchLatestDiagnosis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/diagnoses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.items?.length > 0) {
        const matched = data.data.items.find(
          (d: DiagnosisResult) => d.resume_id === parseInt(resumeId || '0')
        );
        if (matched) {
          setDiagnosis(matched);
          setLoading(false);
          return;
        }
      }
      await createDiagnosis();
    } catch {
      await createDiagnosis();
    }
  };

  const createDiagnosis = async () => {
    if (!resumeId || !token) return;
    try {
      const res = await fetch('/api/v1/diagnoses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resume_id: parseInt(resumeId), target_job: '' }),
      });
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setDiagnosis(data.data);
      } else {
        setError(data.message || '诊断失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      warning: 'bg-amber-100 text-amber-700',
      info: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${styles[severity] || styles.info}`}>
        {SEVERITY_LABELS[severity] || severity}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingSpinner size="lg" text="正在加载诊断报告..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/upload')} className="bg-primary-600 text-white px-6 py-2 rounded-lg">重新上传</button>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">暂无诊断结果</p>
        <button onClick={() => navigate('/upload')} className="bg-primary-600 text-white px-6 py-2 rounded-lg">上传简历</button>
      </div>
    );
  }

  const detail = diagnosis.detail;
  const checklist = diagnosis.priority_checklist;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">诊断报告</h1>
          <p className="text-sm text-gray-500 mt-1">完整诊断报告</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(`/match/${resumeId}`)} className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors border border-primary-200 px-4 py-2 rounded-xl hover:bg-primary-50">
            岗位匹配分析
          </button>
          {isMember ? (
            <button onClick={() => navigate(`/polish/${resumeId}`)} className="bg-accent-600 hover:bg-accent-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              AI润色优化
            </button>
          ) : (
            <button onClick={() => navigate('/profile')} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              升级会员解锁润色
            </button>
          )}
        </div>
      </div>

      {/* Score Overview */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="mb-6 lg:mb-0">
            <RadarChart
              scores={{
                ats: diagnosis.ats_score,
                content: diagnosis.content_score,
                project: diagnosis.project_score,
                match: diagnosis.match_score,
              }}
              maxScores={{ ats: 20, content: 25, project: 30, match: 25 }}
              size={280}
            />
          </div>

          <div className="flex-1 max-w-md w-full lg:ml-10 space-y-3">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-4xl font-bold text-gray-900">{diagnosis.total_score}</span>
              <span className="text-gray-400 text-lg">/ 100</span>
              {diagnosis.grade && (
                <span className={`px-3 py-1 rounded-full text-lg font-bold ${GRADE_COLORS[diagnosis.grade] || ''}`}>
                  {diagnosis.grade} · {GRADE_LABELS[diagnosis.grade] || ''}
                </span>
              )}
            </div>
            <ScoreBar score={diagnosis.ats_score} maxScore={20} label="ATS通过率" />
            <ScoreBar score={diagnosis.content_score} maxScore={25} label="内容质量" />
            <ScoreBar score={diagnosis.project_score} maxScore={30} label="项目经历" />
            <ScoreBar score={diagnosis.match_score} maxScore={25} label="岗位匹配" />
          </div>
        </div>
      </div>

      {/* Overall Assessment */}
      {diagnosis.overall_assessment && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-100 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-800 mb-1">综合评估</h3>
              <p className="text-sm text-blue-700 leading-relaxed">{diagnosis.overall_assessment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Full Detail */}
      {detail && (
        <>
          {(['ats', 'content', 'project', 'match'] as const).map((dimKey) => {
            const dimData = detail[dimKey];
            if (!dimData) return null;
            const scores = { ats: diagnosis.ats_score, content: diagnosis.content_score, project: diagnosis.project_score, match: diagnosis.match_score };
            const maxScores = { ats: 20, content: 25, project: 30, match: 25 };
            const titles = { ats: 'ATS通过率', content: '内容质量', project: '项目经历', match: '岗位匹配度' };
            return (
              <div key={dimKey} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">{titles[dimKey]}</h2>
                  <span className={`text-lg font-bold ${scores[dimKey] / maxScores[dimKey] >= 0.6 ? 'text-green-600' : 'text-amber-600'}`}>
                    {scores[dimKey]}/{maxScores[dimKey]}
                  </span>
                </div>

                {dimKey === 'ats' && dimData.keywords_found && (
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs font-medium text-green-700 mb-2">已覆盖关键词</p>
                      <div className="flex flex-wrap gap-1">
                        {dimData.keywords_found.map((kw: string, i: number) => (
                          <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{kw}</span>
                        ))}
                      </div>
                    </div>
                    {dimData.keywords_missing && (
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xs font-medium text-red-700 mb-2">缺失关键词</p>
                        <div className="flex flex-wrap gap-1">
                          {dimData.keywords_missing.map((kw: string, i: number) => (
                            <span key={i} className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {dimKey === 'content' && (
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {dimData.star_rate !== undefined && (
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xs font-medium text-amber-700 mb-1">STAR法则完成度</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-amber-200 rounded-full h-2">
                            <div className="bg-amber-500 rounded-full h-2" style={{width: `${dimData.star_rate}%`}} />
                          </div>
                          <span className="text-sm font-bold text-amber-700">{dimData.star_rate}%</span>
                        </div>
                      </div>
                    )}
                    {dimData.quant_rate !== undefined && (
                      <div className="bg-teal-50 rounded-xl p-3">
                        <p className="text-xs font-medium text-teal-700 mb-1">量化数据密度</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-teal-200 rounded-full h-2">
                            <div className="bg-teal-500 rounded-full h-2" style={{width: `${dimData.quant_rate}%`}} />
                          </div>
                          <span className="text-sm font-bold text-teal-700">{dimData.quant_rate}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {dimKey === 'match' && dimData.match_keywords && (
                  <div className="mb-4 bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-medium text-blue-700 mb-2">岗位匹配关键词</p>
                    <div className="flex flex-wrap gap-1">
                      {dimData.match_keywords.map((kw: string, i: number) => (
                        <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">问题列表</h3>
                  <div className="space-y-2">
                    {dimData.issues.map((issue: IssueItem, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                        {getSeverityBadge(issue.severity)}
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{issue.description}</p>
                          <p className="text-xs text-gray-400 mt-1">字段: {issue.field}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">改进建议</h3>
                  <div className="space-y-2">
                    {dimData.suggestions.map((s: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-3 bg-green-50 rounded-xl">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-gray-700">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Priority Checklist */}
          {checklist && checklist.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">优先级改进清单</h2>
              <div className="space-y-2">
                {checklist.map((item: ChecklistItem) => (
                  <div key={item.priority} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      item.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      item.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getSeverityBadge(item.severity)}
                        <span className="text-xs text-gray-400">{item.dimension}</span>
                      </div>
                      <p className="text-sm text-gray-700">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DiagnosisPage;
