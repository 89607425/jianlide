/** 底部信息栏组件 */

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">简</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">简立得</span>
            <span className="text-xs text-gray-400">AI简历诊断工具</span>
          </div>
          <div className="text-xs text-gray-400 text-center">
            <p>简历智能诊断 · 专业润色优化 · 助力求职成功</p>
            <p className="mt-1">© 2025 简立得 All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
