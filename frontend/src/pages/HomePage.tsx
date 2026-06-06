/** 首页 - 上传入口和产品介绍 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('jianlida_token');

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: '四维智能诊断',
      desc: 'ATS通过率、内容质量、项目经历、岗位匹配度全面评估，所有人都可免费查看完整报告',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: '岗位匹配分析',
      desc: '关键词热力图、技能差距、匹配度可视化，精准定位简历与目标岗位的差距',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      ),
      title: '会员专属·AI润色+导出',
      desc: 'AI专业改写简历，支持PDF/Word/TXT/MD四种格式专业导出',
    },
  ];

  const steps = [
    { num: '1', title: '上传简历', desc: '上传PDF/Word简历' },
    { num: '2', title: 'AI诊断', desc: '四维度智能评分' },
    { num: '3', title: '查看报告', desc: '发现全部问题与建议' },
    { num: '4', title: '升级会员', desc: 'AI润色与导出' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              让简历脱颖而出
              <br />
              <span className="text-primary-200">AI诊断 + 智能润色</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8 leading-relaxed">
              上传简历，AI自动诊断ATS通过率、内容质量、项目经历和岗位匹配度，
              提供完整诊断报告和岗位匹配分析。会员还能享受AI润色和专业格式导出。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(token ? '/upload' : '#')}
                className="bg-white text-primary-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg"
              >
                {token ? '上传简历，开始诊断' : '免费开始使用'}
              </button>
              {token && (
                <button
                  onClick={() => navigate('/history')}
                  className="border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                >
                  历史记录
                </button>
              )}
              <div className="flex items-center text-primary-200 text-sm">
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                每天免费诊断 2 份简历
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">核心功能</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">使用流程</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {s.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">非会员</h3>
            <p className="text-3xl font-bold text-primary-600 mb-2">免费</p>
            <p className="text-sm text-gray-500 mb-6">每日可诊断 2 份简历</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                完整诊断报告（四维度评分 + 详情）
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                岗位匹配分析（关键词热力图）
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                优先级改进清单
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-gray-300 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span className="text-gray-400">AI润色优化</span>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-gray-300 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span className="text-gray-400">简历导出（PDF/Word/TXT/MD）</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 shadow-lg text-white">
            <h3 className="text-lg font-bold mb-2">会员</h3>
            <p className="text-3xl font-bold mb-2">点击即享</p>
            <p className="text-sm text-primary-100 mb-6">每日可诊断 8 份简历</p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-primary-200 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                包含非会员全部功能
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-primary-200 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                AI智能润色（逐条修改对比）
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-primary-200 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                专业格式导出（PDF/Word/TXT/MD）
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-primary-200 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                每日诊断上限 8 份
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
