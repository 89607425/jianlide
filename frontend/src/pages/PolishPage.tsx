/** 润色结果页 - 会员专享功能 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressLoading from '../components/ProgressLoading';
import type { PolishResult, DiffItem } from '../types';

function getUserIsMember(): boolean {
  try {
    const u = JSON.parse(localStorage.getItem('jianlida_user') || '{}');
    return u.member_type === 1;
  } catch { return false; }
}

const PolishPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('jianlida_token');
  const isMember = getUserIsMember();

  const [loading, setLoading] = useState(true);
  const [polishResult, setPolishResult] = useState<PolishResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'diff' | 'result'>('diff');
  const [customPrompt, setCustomPrompt] = useState('');
  const [needsCreate, setNeedsCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    if (!resumeId || !token) { setLoading(false); return; }
    checkExisting();
  }, [resumeId, token]);

  useEffect(() => {
    if (needsCreate && isMember && !polishResult) {
      createPolish();
    }
  }, [needsCreate, isMember]);

  const checkExisting = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/polish/resume/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setPolishResult(data.data);
        setNeedsCreate(false);
      } else {
        setNeedsCreate(true);
      }
    } catch {
      setNeedsCreate(true);
    } finally {
      setLoading(false);
    }
  };

  const createPolish = async () => {
    if (!resumeId || !token) return;
    setLoading(true);
    setCreating(true);
    try {
      const res = await fetch('/api/v1/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resume_id: parseInt(resumeId), custom_prompt: customPrompt }),
      });
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setPolishResult(data.data);
        setNeedsCreate(false);
      } else {
        setError(data.message || '润色失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
      setCreating(false);
    }
  };

  const handleExport = async (fmt: string) => {
    if (!resumeId || !token) return;
    setExporting(fmt);
    try {
      const res = await fetch(`/api/v1/polish/resume/${resumeId}/export?fmt=${fmt}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || '导出失败');
        setExporting('');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extMap: Record<string, string> = { pdf: '.pdf', word: '.docx', txt: '.txt', md: '.md' };
      a.download = `润色版简历${extMap[fmt] || '.txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('网络错误，导出失败');
    } finally {
      setExporting('');
    }
  };

  if (loading) {
    if (creating) {
      const stages = [
        { label: '正在分析诊断报告...', duration: 3000 },
        { label: 'AI正在润色优化简历...', duration: 20000 },
        { label: '生成润色报告...', duration: 2000 },
      ];
      return <ProgressLoading stages={stages} />;
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingSpinner size="lg" text="加载润色结果..." />
      </div>
    );
  }

  // 非会员 - 引导升级
  if (!isMember) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">AI简历润色 · 会员专享</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            AI润色是会员专属功能，AI将根据诊断结果对您的简历进行专业润色优化，支持逐条修改对比和多种格式导出
          </p>
          <div className="flex justify-center space-x-3">
            <button onClick={() => navigate('/profile')} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-colors">
              升级会员
            </button>
            <button onClick={() => navigate(`/diagnosis/${resumeId}`)} className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              返回诊断
            </button>
          </div>
        </div>
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

  // 会员但还没创建润色
  if (!polishResult && needsCreate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI简历润色</h1>
            <p className="text-sm text-gray-500 mt-1">AI将根据诊断结果对简历进行专业润色优化</p>
          </div>
          <button onClick={() => navigate(`/diagnosis/${resumeId}`)} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            查看诊断报告 →
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">自定义润色要求（可选）</h2>
          <p className="text-sm text-gray-500 mb-3">告诉AI你希望重点润色哪些方面，例如：侧重于STAR法则表达、使用更多量化数据、突出管理能力等</p>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="请输入你的润色要求..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-2 text-right">{customPrompt.length}/500</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">开始AI润色</h3>
          <p className="text-sm text-gray-500 mb-6">AI将根据诊断发现的问题，对简历进行专业润色</p>
          <button onClick={createPolish} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-colors">
            开始润色
          </button>
        </div>
      </div>
    );
  }

  if (!polishResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">暂无润色结果</p>
        <button onClick={() => navigate('/upload')} className="bg-primary-600 text-white px-6 py-2 rounded-lg">上传简历</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI润色结果</h1>
          <p className="text-sm text-gray-500 mt-1">AI已对您的简历进行专业润色优化</p>
        </div>
        <button onClick={() => navigate(`/diagnosis/${resumeId}`)} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          查看诊断报告 →
        </button>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        <button onClick={() => setActiveTab('diff')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'diff' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          逐条对比
        </button>
        <button onClick={() => setActiveTab('result')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'result' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          润色全文
        </button>
      </div>

      {activeTab === 'diff' && (
        <div className="space-y-4">
          {polishResult.diff_data.map((diff: DiffItem, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded mb-2 inline-block">原文</span>
                  <p className="text-sm text-gray-700 bg-red-50/50 p-3 rounded-lg">{diff.original}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded mb-2 inline-block">润色后</span>
                  <p className="text-sm text-gray-700 bg-green-50/50 p-3 rounded-lg">{diff.polished}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{diff.reason}</span>
              </div>
            </div>
          ))}
          {polishResult.diff_data.length === 0 && <div className="text-center py-12 text-gray-400">暂无修改对比数据</div>}
        </div>
      )}

      {activeTab === 'result' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">润色后全文</h2>
            <button onClick={() => { navigator.clipboard.writeText(polishResult.polished_text); alert('已复制到剪贴板'); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium">复制全文</button>
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">{polishResult.polished_text}</pre>
          </div>
        </div>
      )}

      {/* Export Download */}
      <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">导出润色版简历</h2>
            <p className="text-sm text-gray-500 mt-1">支持 PDF、Word、TXT、Markdown 四种专业格式</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { fmt: 'pdf', label: 'PDF 格式', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' },
            { fmt: 'word', label: 'Word 格式', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100' },
            { fmt: 'txt', label: 'TXT 格式', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', color: 'border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100' },
            { fmt: 'md', label: 'Markdown', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100' },
          ].map((item) => (
            <button
              key={item.fmt}
              onClick={() => handleExport(item.fmt)}
              disabled={exporting === item.fmt}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-colors ${item.color} ${exporting === item.fmt ? 'opacity-60 cursor-wait' : ''}`}
            >
              <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-sm font-bold">{item.label}</span>
              <span className="text-xs opacity-60 mt-0.5">{exporting === item.fmt ? '导出中...' : '点击下载'}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          导出格式均按正规简历排版，包含姓名、联系方式、各板块的专业格式
        </p>
      </div>
    </div>
  );
};

export default PolishPage;
