import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Contact from './pages/Contact';
import OurWork from './pages/OurWork';
import Sitemap from './pages/Sitemap';
import PostDetail from './pages/PostDetail';
import { Toaster } from 'sonner';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const adminEmail = 'kenwem@yahoo.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[var(--c-bg)] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    return <Navigate to="/" />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/our-work" element={<OurWork />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/blog/:id" element={<PostDetail />} />
      </Routes>
    </Router>
  );
}
