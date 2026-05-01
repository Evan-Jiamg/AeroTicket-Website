// App 根元件 + 掛載
// 所有子元件已在 components/ 中定義並掛在 window 上，載入順序由 index.html 保證
const { useState, useEffect } = React;

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <>
      {!currentUser
        ? <AuthForm onLoginSuccess={handleLoginSuccess} />
        : <JourneyManager user={currentUser} onLogout={handleLogout} />
      }
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
