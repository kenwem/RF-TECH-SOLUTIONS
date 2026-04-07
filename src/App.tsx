import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Toaster } from 'sonner';

// Lazy load components to prevent blank page flash and improve performance
const Home = lazy(() => import('./pages/Home'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Contact = lazy(() => import('./pages/Contact'));
const OurWork = lazy(() => import('./pages/OurWork'));
const Sitemap = lazy(() => import('./pages/Sitemap'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Blog = lazy(() => import('./pages/Blog'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
      <p className="text-sky-500/60 text-[10px] uppercase tracking-[0.3em] font-bold">RF Tech</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const adminEmails = ['kenwem@yahoo.com'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  const userEmail = user.email?.toLowerCase().trim();
  if (!userEmail || !adminEmails.includes(userEmail)) {
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
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/our-work" element={<OurWork />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<PostDetail />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          {/* Fallback for clean URLs - redirect any unknown route to home or 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
