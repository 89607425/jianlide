/** 简历在线编辑器 - 预留页面 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

const EditorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">简历编辑器</h1>
          <p className="text-sm text-gray-500 mt-1">在线编辑和优化您的简历</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">即将上线</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          我们正在开发在线简历编辑器，届时您可以直接在平台内创建、编辑和优化简历，敬请期待！
        </p>
        <div className="flex justify-center space-x-3">
          <button onClick={() => navigate('/upload')} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            上传简历
          </button>
          <button onClick={() => navigate('/history')} className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            查看历史
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
