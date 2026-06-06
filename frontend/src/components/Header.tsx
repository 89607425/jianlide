/** 顶部导航栏组件 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface UserInfo {
  id: number;
  phone: string;
  nickname: string;
  member_type: number;
}

type ModalView = 'login' | 'register' | 'forgot';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('login');
  const [loading, setLoading] = useState(false);

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regCodeSent, setRegCodeSent] = useState(false);
  const [regSendingCode, setRegSendingCode] = useState(false);
  const [regError, setRegError] = useState('');
  const [codeMsg, setCodeMsg] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPwd, setForgotNewPwd] = useState('');
  const [forgotCodeSent, setForgotCodeSent] = useState(false);
  const [forgotSendingCode, setForgotSendingCode] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotCodeMsg, setForgotCodeMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('jianlida_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('jianlida_user'); }
    }
    refreshUserInfo();
  }, []);

  const refreshUserInfo = async () => {
    const tok = localStorage.getItem('jianlida_token');
    if (!tok) return;
    try {
      const res = await fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json();
      if (data.code === 0 && data.data) {
        const updated = { id: data.data.id, phone: data.data.phone, nickname: data.data.nickname || '', member_type: data.data.member_type || 0 };
        localStorage.setItem('jianlida_user', JSON.stringify(updated));
        setUser(updated);
      }
    } catch {/* ignore */}
  };

  const saveLogin = (data: { id: number; phone: string; nickname: string; member_type: number; token: string }) => {
    const userInfo = { id: data.id, phone: data.phone, nickname: data.nickname || '', member_type: data.member_type || 0 };
    localStorage.setItem('jianlida_token', data.token);
    localStorage.setItem('jianlida_user', JSON.stringify(userInfo));
    setUser(userInfo);
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setAccount(''); setPassword(''); setLoginError('');
    setRegPhone(''); setRegEmail(''); setRegPassword(''); setRegCode(''); setRegCodeSent(false); setRegError(''); setCodeMsg('');
    setForgotEmail(''); setForgotCode(''); setForgotNewPwd(''); setForgotCodeSent(false); setForgotError(''); setForgotCodeMsg('');
  };

  const openModal = (view: ModalView) => {
    setModalView(view);
    setShowModal(true);
  };

  const sendCode = async (email: string, setSent: (v: boolean) => void, setSending: (v: boolean) => void, setMsg: (v: string) => void) => {
    if (!email) { setMsg('请输入邮箱'); return; }
    setSending(true);
    setMsg('');
    try {
      const res = await fetch('/api/v1/auth/send-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (data.code === 0) { setSent(true); setMsg(''); } else { setMsg(data.message || '发送失败'); }
    } catch { setMsg('网络错误'); }
    finally { setSending(false); }
  };

  const handleLogin = async () => {
    if (!account || !password) { setLoginError('请输入账号和密码'); return; }
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account, password }) });
      const data = await res.json();
      if (data.code === 0 && data.data) { saveLogin(data.data); }
      else { setLoginError(data.message || '登录失败'); }
    } catch { setLoginError('网络错误，请重试'); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regPhone || !regEmail || !regPassword || !regCode) { setRegError('请填写所有字段'); return; }
    setRegError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: regPhone, email: regEmail, password: regPassword, code: regCode }) });
      const data = await res.json();
      if (data.code === 0 && data.data) { saveLogin(data.data); }
      else { setRegError(data.message || '注册失败'); }
    } catch { setRegError('网络错误，请重试'); }
    finally { setLoading(false); }
  };

  const handleForgot = async () => {
    if (!forgotEmail || !forgotCode || !forgotNewPwd) { setForgotError('请填写所有字段'); return; }
    setForgotError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail, code: forgotCode, new_password: forgotNewPwd }) });
      const data = await res.json();
      if (data.code === 0) { setForgotError('密码重置成功，请使用新密码登录'); setTimeout(() => setModalView('login'), 800); }
      else { setForgotError(data.message || '操作失败'); }
    } catch { setForgotError('网络错误，请重试'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('jianlida_token');
    localStorage.removeItem('jianlida_user');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/jian.png" alt="logo" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-bold text-gray-900">简立得</span>
          <span className="text-xs text-gray-400 hidden sm:inline">AI简历诊断</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">首页</Link>
          <Link to="/upload" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">上传简历</Link>
          {user && (<><Link to="/history" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">历史记录</Link><Link to="/editor" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">简历编辑器</Link></>)}
        </nav>
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-primary-700 text-sm font-medium">{user.phone.slice(-2)}</span></div>
                <span className="text-sm text-gray-700 hidden sm:inline">{user.phone}</span>
                {user.member_type === 1 && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">会员</span>}
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 text-sm transition-colors">退出</button>
            </div>
          ) : (
            <button onClick={() => openModal('login')} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">登录</button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
              <button onClick={() => setModalView('login')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${modalView === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>登录</button>
              <button onClick={() => setModalView('register')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${modalView === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>注册</button>
            </div>

            {modalView === 'login' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">欢迎登录</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号 / 邮箱</label>
                  <input type="text" value={account} onChange={(e) => { setAccount(e.target.value); setLoginError(''); }}
                    placeholder="请输入手机号或邮箱" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                    placeholder="请输入密码" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-500">{loginError}</span>
                  <button onClick={() => { setModalView('forgot'); setForgotEmail(account.includes('@') ? account : ''); }} className="text-xs text-gray-400 hover:text-primary-600 transition-colors">忘记密码？</button>
                </div>
                <button onClick={handleLogin} disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white py-3 rounded-xl font-medium transition-colors">{loading ? '登录中...' : '登录'}</button>
                <p className="text-center text-sm text-gray-500">没有账号？<button onClick={() => setModalView('register')} className="text-primary-600 hover:text-primary-700 ml-1">立即注册</button></p>
              </div>
            )}

            {modalView === 'register' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">注册账号</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                  <input type="tel" value={regPhone} onChange={(e) => { setRegPhone(e.target.value); setRegError(''); }}
                    placeholder="请输入手机号" maxLength={11} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <input type="email" value={regEmail} onChange={(e) => { setRegEmail(e.target.value); setRegError(''); }}
                    placeholder="请输入邮箱地址" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <input type="password" value={regPassword} onChange={(e) => { setRegPassword(e.target.value); setRegError(''); }}
                    placeholder="6-20位密码" maxLength={20} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱验证码</label>
                  <div className="flex space-x-3">
                    <input type="text" value={regCode} onChange={(e) => { setRegCode(e.target.value); setRegError(''); }}
                      placeholder="6位验证码" maxLength={6} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                    <button onClick={() => sendCode(regEmail, setRegCodeSent, setRegSendingCode, setCodeMsg)} disabled={regSendingCode}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                      {regSendingCode ? '发送中...' : regCodeSent ? '重新发送' : '获取验证码'}
                    </button>
                  </div>
                  {codeMsg && <p className="text-xs text-red-500 mt-1">{codeMsg}</p>}
                </div>
                {regError && <p className="text-xs text-red-500 !mt-0">{regError}</p>}
                <button onClick={handleRegister} disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white py-3 rounded-xl font-medium transition-colors">{loading ? '注册中...' : '注册'}</button>
                <p className="text-center text-sm text-gray-500">已有账号？<button onClick={() => setModalView('login')} className="text-primary-600 hover:text-primary-700 ml-1">立即登录</button></p>
              </div>
            )}

            {modalView === 'forgot' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">找回密码</h2>
                <p className="text-sm text-gray-500">请输入注册邮箱，验证后即可设置新密码</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">注册邮箱</label>
                  <input type="email" value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                    placeholder="请输入注册时的邮箱" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
                  <div className="flex space-x-3">
                    <input type="text" value={forgotCode} onChange={(e) => { setForgotCode(e.target.value); setForgotError(''); }}
                      placeholder="6位验证码" maxLength={6} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                    <button onClick={() => sendCode(forgotEmail, setForgotCodeSent, setForgotSendingCode, setForgotCodeMsg)} disabled={forgotSendingCode}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                      {forgotSendingCode ? '发送中...' : forgotCodeSent ? '重新发送' : '获取验证码'}
                    </button>
                  </div>
                  {forgotCodeMsg && <p className="text-xs text-red-500 mt-1">{forgotCodeMsg}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                  <input type="password" value={forgotNewPwd} onChange={(e) => { setForgotNewPwd(e.target.value); setForgotError(''); }}
                    placeholder="设置新密码（6-20位）" maxLength={20} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                </div>
                {forgotError && <p className={`text-xs ${forgotError.includes('成功') ? 'text-green-500' : 'text-red-500'} !mt-0`}>{forgotError}</p>}
                <button onClick={handleForgot} disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white py-3 rounded-xl font-medium transition-colors">{loading ? '重置中...' : '重置密码'}</button>
                <p className="text-center text-sm text-gray-500"><button onClick={() => setModalView('login')} className="text-primary-600 hover:text-primary-700">返回登录</button></p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
