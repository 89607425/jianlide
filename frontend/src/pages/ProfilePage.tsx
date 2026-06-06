/** 个人中心页 - 用户信息、会员激活、支付记录 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import type { OrderInfo } from '../types';

interface MemberUser {
  id: number;
  phone: string;
  nickname: string;
  member_type: number;
}

const PRODUC_NAMES: Record<number, string> = { 1: '完整诊断报告', 2: 'AI简历润色' };
const STATUS_LABELS: Record<number, string> = { 0: '待支付', 1: '已支付', 2: '已退款' };
const STATUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-600',
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('jianlida_token');
  const userStr = localStorage.getItem('jianlida_user');

  const [user, setUser] = useState<MemberUser | null>(null);
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch {/* ignore */}
    }
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/v1/payment/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.items) {
        setOrders(data.data.items);
      }
    } catch {/* ignore */} finally {
      setLoading(false);
    }
  };

  const handleActivateMember = async () => {
    if (!token) return;
    setActivating(true);
    try {
      const res = await fetch('/api/v1/payment/activate-member', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 0 && data.data) {
        const newUser = data.data;
        localStorage.setItem('jianlida_user', JSON.stringify(newUser));
        setUser(newUser);
        alert('恭喜！您已成为会员，所有诊断报告将自动解锁。');
      } else {
        alert(data.message || '操作失败');
      }
    } catch {
      alert('网络错误，请重试');
    } finally {
      setActivating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jianlida_token');
    localStorage.removeItem('jianlida_user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">请先登录</p>
        <button onClick={() => navigate('/')} className="bg-primary-600 text-white px-6 py-2 rounded-lg">返回首页</button>
      </div>
    );
  }

  const isMember = user.member_type === 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">个人中心</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 text-xl font-bold">{user.phone.slice(-2)}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-gray-900">{user.phone}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isMember ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {isMember ? '会员' : '免费用户'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isMember ? '所有诊断报告和AI润色功能已解锁' : '免费用户，每个诊断报告需付费解锁'}
            </p>
          </div>
        </div>

        {/* Member activation button for non-members */}
        {!isMember && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-800">升级会员</p>
                <p className="text-xs text-amber-600 mt-0.5">一键激活，所有诊断和润色免费使用</p>
              </div>
              <button
                onClick={handleActivateMember}
                disabled={activating}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                {activating ? '激活中...' : '成为会员'}
              </button>
            </div>
          </div>
        )}

        <div className="flex space-x-3 mt-4">
          <button
            onClick={() => navigate('/history')}
            className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            诊断历史
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* Payment Records */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">支付记录</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">暂无支付记录</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.order_no} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {PRODUC_NAMES[order.product_type] || `产品${order.product_type}`}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                      {STATUS_LABELS[order.status] || '未知'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    订单号: {order.order_no}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className="text-lg font-bold text-primary-600">¥{order.amount.toFixed(2)}</span>
                  {order.paid_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.paid_at).toLocaleDateString('zh-CN')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
