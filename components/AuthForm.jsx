// 登入 / 註冊表單
const { useState: useStateAuth } = React;

function AuthForm({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useStateAuth(false);
  const [formData, setFormData] = useStateAuth({ memberMail: '', memberName: '', memberPassword: '' });
  const [error, setError] = useStateAuth('');
  const [success, setSuccess] = useStateAuth('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const generateMemberID = () => 'M' + Math.random().toString(36).substring(2, 9).toUpperCase();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.memberMail || !formData.memberPassword) { setError('請填寫信箱與密碼'); return; }

    const users = JSON.parse(localStorage.getItem('aeroTicketUsers') || '[]');
    if (isLoginMode) {
      const user = users.find(u => u.memberMail === formData.memberMail);
      if (!user) { setError('找不到此帳號，請先註冊'); return; }
      if (user.memberPassword !== formData.memberPassword) { setError('密碼錯誤'); return; }
      onLoginSuccess(user);
    } else {
      if (!formData.memberName) { setError('請填寫會員名稱'); return; }
      if (users.some(u => u.memberMail === formData.memberMail)) { setError('此信箱已被註冊'); return; }
      const newUser = {
        memberID: generateMemberID(),
        memberMail: formData.memberMail,
        memberName: formData.memberName,
        memberPassword: formData.memberPassword
      };
      users.push(newUser);
      localStorage.setItem('aeroTicketUsers', JSON.stringify(users));
      setSuccess('註冊成功！正在為您登入...');
      setTimeout(() => onLoginSuccess(newUser), 1000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>AeroTicket</h1>
        <p>{isLoginMode ? '歡迎回來，請登入您的帳號' : '建立您的 AeroTicket 帳號'}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>會員信箱</label>
          <input type="email" name="memberMail" value={formData.memberMail} onChange={handleInputChange} required />
        </div>
        {!isLoginMode && (
          <div className="form-group">
            <label>會員名稱</label>
            <input type="text" name="memberName" value={formData.memberName} onChange={handleInputChange} required={!isLoginMode} />
          </div>
        )}
        <div className="form-group">
          <label>密碼</label>
          <input type="password" name="memberPassword" value={formData.memberPassword} onChange={handleInputChange} required />
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <button type="submit" className="btn">{isLoginMode ? '登入' : '註冊'}</button>
      </form>
      <div className="toggle-mode">
        {isLoginMode ? '還沒有帳號？' : '已有帳號？'}
        <button type="button" onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode ? '立即註冊' : '直接登入'}
        </button>
      </div>
    </div>
  );
}

window.AuthForm = AuthForm;
