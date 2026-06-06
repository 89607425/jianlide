/** 历史记录页 - 查看所有诊断历史和评分 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import type { DiagnosisListItem } from '../types';

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-red-100 text-red-700',
};

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('jianlida_token');
  const [items, setItems] = useState<DiagnosisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/diagnoses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.items) {
        setItems(data.data.items);
      } else {
        setError(data.message || '加载失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingSpinner size="lg" text="加载历史记录..." />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">请先登录</p>
        <button onClick={() => navigate('/')} className="bg-primary-600 text-white px-6 py-2 rounded-lg">返回首页</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
          <p className="text-sm text-gray-500 mt-1">共 {items.length} 份诊断报告</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          上传新简历
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 mb-4">暂无诊断记录</p>
          <button onClick={() => navigate('/upload')} className="bg-primary-600 text-white px-6 py-2 rounded-lg">上传第一份简历</button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/diagnosis/${item.resume_id}`)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{item.file_name}</h3>
                    {item.is_unlocked && (
                      <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full font-medium shrink-0">已解锁</span>
                    )}
                    {item.has_polish && (
                      <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full font-medium shrink-0">已润色</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {item.created_at ? new Date(item.created_at).toLocaleString('zh-CN') : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-6 ml-6">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`text-3xl font-bold ${getScoreColor(item.total_score)}`}>{item.total_score}</span>
                      <span className="text-sm text-gray-400">/100</span>
                    </div>
                    {item.grade && (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${GRADE_COLORS[item.grade] || ''}`}>
                        {item.grade}
                      </span>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Mini score bars */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-50">
                {[
                  { label: 'ATS', score: item.ats_score, max: 20 },
                  { label: '内容', score: item.content_score, max: 25 },
                  { label: '项目', score: item.project_score, max: 30 },
                  { label: '匹配', score: item.match_score, max: 25 },
                ].map((dim) => (
                  <div key={dim.label} className="text-center">
                    <div className="text-xs text-gray-400 mb-1">{dim.label}</div>
                    <div className="text-sm font-medium text-gray-700">{dim.score}/{dim.max}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
