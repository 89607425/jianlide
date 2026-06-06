/** 岗位匹配分析页 - 关键词热力图、技能差距、匹配度可视化 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import type { DiagnosisResult, MatchAnalysis } from '../types';

const MatchPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('jianlida_token');

  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resumeId || !token) { setLoading(false); return; }
    fetchData();
  }, [resumeId, token]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/v1/diagnoses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.items) {
        const matched = data.data.items.find(
          (d: DiagnosisResult) => d.resume_id === parseInt(resumeId || '0')
        );
        if (matched) {
          const detailRes = await fetch(`/api/v1/diagnoses/${matched.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const detailData = await detailRes.json();
          if (detailData.code === 0 && detailData.data) {
            setDiagnosis(detailData.data);
            setLoading(false);
            return;
          }
        }
      }
      setError('未找到诊断数据，请先上传简历并完成诊断');
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingSpinner size="lg" text="加载匹配分析..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/upload')} className="bg-primary-600 text-white px-6 py-2 rounded-lg">上传简历</button>
      </div>
    );
  }

  const matchAnalysis: MatchAnalysis | null = diagnosis?.match_analysis || null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">岗位匹配分析</h1>
          <p className="text-sm text-gray-500 mt-1">简历与目标岗位的深度匹配分析</p>
        </div>
        <button onClick={() => navigate(`/diagnosis/${resumeId}`)} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          返回诊断报告
        </button>
      </div>

      {/* Overall Match Rate */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">综合匹配度</h2>
        <div className="flex items-center space-x-8">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={matchAnalysis ? (matchAnalysis.overall_rate >= 70 ? '#10b981' : matchAnalysis.overall_rate >= 40 ? '#f59e0b' : '#ef4444') : '#e5e7eb'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${matchAnalysis ? matchAnalysis.overall_rate * 3.267 : 0} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{matchAnalysis?.overall_rate ?? '--'}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {matchAnalysis
                ? matchAnalysis.overall_rate >= 70 ? '匹配度良好，简历与目标岗位契合度较高' :
                  matchAnalysis.overall_rate >= 40 ? '匹配度一般，简历有一定优化空间' :
                  '匹配度较低，建议重点补充目标岗位所需技能'
                : '暂无匹配分析数据'}
            </p>
            {matchAnalysis && (
              <p className="text-xs text-gray-400 mt-2">
                基于四大维度·关键词·技能的深度分析
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Keyword Heatmap */}
      {matchAnalysis?.keyword_heatmap && matchAnalysis.keyword_heatmap.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">关键词热力图</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchAnalysis.keyword_heatmap.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${item.found ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${item.found ? 'text-green-800' : 'text-red-800'}`}>
                    {item.keyword}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.found ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {item.found ? '已匹配' : '未匹配'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs text-gray-500 w-10">重要度</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${item.relevance >= 70 ? 'bg-red-500' : item.relevance >= 40 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${item.relevance}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{item.relevance}%</span>
                </div>
                {item.note && (
                  <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Gaps */}
      {matchAnalysis?.skill_gaps && matchAnalysis.skill_gaps.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">技能差距</h2>
          <p className="text-sm text-gray-500 mb-4">以下为目标岗位所需但您的简历中未体现的核心技能</p>
          <div className="flex flex-wrap gap-2">
            {matchAnalysis.skill_gaps.map((skill, idx) => (
              <span key={idx} className="bg-red-50 text-red-700 text-sm px-3 py-1.5 rounded-full border border-red-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {matchAnalysis?.recommendations && matchAnalysis.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">匹配提升建议</h2>
          <div className="space-y-3">
            {matchAnalysis.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm text-blue-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback if no match_analysis */}
      {!matchAnalysis && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1">暂无岗位匹配分析数据</p>
          <p className="text-sm text-gray-400">请在上传简历时填写目标岗位，AI 将自动生成匹配分析</p>
        </div>
      )}
    </div>
  );
};

export default MatchPage;
