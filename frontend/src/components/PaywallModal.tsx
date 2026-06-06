/** 付费弹窗组件 */

import React from 'react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: 1 | 2;
  amount: number;
  onPay: () => void;
  loading?: boolean;
}

const productNames: Record<number, string> = {
  1: '完整诊断报告',
  2: 'AI简历润色',
};

const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  productType,
  amount,
  onPay,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">解锁{productNames[productType]}</h3>
          <p className="text-sm text-gray-500">
            {productType === 1
              ? '解锁后可查看完整诊断报告，包含所有维度的问题与建议'
              : '解锁后可获取AI专业润色结果，包含逐条修改对比'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{productNames[productType]}</span>
            <span className="text-xl font-bold text-primary-600">¥{amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPay}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white py-3 rounded-xl font-medium transition-colors"
          >
            {loading ? '支付中...' : '立即支付（Mock）'}
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
          >
            暂不购买
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          MVP阶段为Mock支付，点击即完成
        </p>
      </div>
    </div>
  );
};

export default PaywallModal;
