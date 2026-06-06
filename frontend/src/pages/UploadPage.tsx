/** 上传简历页 - 支持 PDF 和 Word (.docx) 格式 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const ALLOWED_EXTS = ['.pdf', '.docx'];

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('jianlida_token');

  const handleFileSelect = useCallback((selectedFile: File) => {
    const ext = '.' + selectedFile.name.toLowerCase().split('.').pop();
    if (!ALLOWED_EXTS.includes(ext)) {
      setError('仅支持 PDF 和 Word (.docx) 格式文件');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('文件大小不能超过5MB');
      return;
    }
    setFile(selectedFile);
    setError('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleUploadAndDiagnose = async () => {
    if (!file) return;

    if (!token) {
      setError('请先登录后再上传简历');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (uploadData.code !== 0 || !uploadData.data) {
        setError(uploadData.message || '上传失败');
        setUploading(false);
        return;
      }

      const resumeId = uploadData.data.id;

      if (uploadData.data.status === 2) {
        setError('简历解析失败，请检查文件是否正常');
        setUploading(false);
        return;
      }

      setUploading(false);
      setDiagnosing(true);

      const diagRes = await fetch('/api/v1/diagnoses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_id: resumeId,
          target_job: targetJob || '',
          custom_prompt: customPrompt || '',
        }),
      });
      const diagData = await diagRes.json();

      if (diagData.code !== 0) {
        setError(diagData.message || '诊断失败');
        setDiagnosing(false);
        return;
      }

      navigate(`/diagnosis/${resumeId}`);
    } catch {
      setError('网络错误，请重试');
      setUploading(false);
      setDiagnosing(false);
    }
  };

  if (uploading || diagnosing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <LoadingSpinner
          size="lg"
          text={uploading ? '正在上传简历...' : 'AI正在诊断简历，请稍候（约30秒）...'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">上传简历</h1>
      <p className="text-gray-500 mb-8">上传 PDF 或 Word (.docx) 格式简历，AI将自动诊断并给出改进建议</p>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
        }`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />
        {file ? (
          <div className="space-y-3">
            <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="space-y-3">
            <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-500">拖拽文件到此处，或点击选择文件</p>
            <p className="text-xs text-gray-400">支持 PDF 和 Word (.docx) 格式，文件大小不超过5MB</p>
          </div>
        )}
      </div>

      {/* Target Job */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">目标岗位（选填）</label>
        <input
          type="text"
          value={targetJob}
          onChange={(e) => setTargetJob(e.target.value)}
          placeholder="例如：前端开发工程师、产品经理"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">填写目标岗位可提升岗位匹配度评分准确度</p>
      </div>

      {/* Custom Prompt */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">自定义诊断提示（选填）</label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="例如：请重点检查项目经历描述是否符合STAR法则、评估技术栈的匹配度..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none"
          rows={2}
          maxLength={300}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{customPrompt.length}/300</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleUploadAndDiagnose}
        disabled={!file || !token}
        className="mt-6 w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-colors"
      >
        {!token ? '请先登录' : '上传并开始诊断'}
      </button>
    </div>
  );
};

export default UploadPage;
