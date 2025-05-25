import './index.css';
import Sidebar from './components/sideBar';
import AuthForm from './components/auth';
import StickyWall from './stickyNotes/stickyWall';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { authDomain } from './config/firebase';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authDomain, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, []);
  if (loading) return <div className="mt-10 text-center">Loading...</div>;

  const handleLogout = async () => {
    try {
      await signOut(authDomain);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div>
      {user ? (
        <>
          <div>
            <Sidebar user={user} handleLogOut={handleLogout} />
            <StickyWall />
          </div>
        </>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

export default App;
