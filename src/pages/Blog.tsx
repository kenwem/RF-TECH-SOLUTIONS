import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Mail, Menu, X, Heart, MessageSquare } from 'lucide-react';
import { Logo } from '../components/Logo';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';

function PostStats({ postId }: { postId: string }) {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);

  useEffect(() => {
    const likesRef = collection(db, `sites/siteA/posts/${postId}/likes`);
    const unsubscribeLikes = onSnapshot(likesRef, (snapshot) => {
      setLikes(snapshot.size);
    });

    const commentsRef = collection(db, `sites/siteA/posts/${postId}/comments`);
    const q = query(commentsRef, where('status', '==', 'approved'));
    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      setComments(snapshot.size);
    });

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
    };
  }, [postId]);

  return (
    <div className="flex items-center gap-4 mt-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">
      <div className="flex items-center gap-1.5">
        <Heart size={12} /> {likes}
      </div>
      <div className="flex items-center gap-1.5">
        <MessageSquare size={12} /> {comments}
      </div>
    </div>
  );
}

export default function Blog() {
  const [generalSettings, setGeneralSettings] = useState({
    heroTitle: 'Powering\nBusiness Growth',
    heroSubtitle: 'We build powerful websites, mobile apps, and digital solutions that help businesses grow, reach more customers, and succeed in the digital world.',
    contactEmail: 'contact@rftech.ng',
    contactPhone: '+234 813 433 2534',
    contactAddress: '98 Adatan Abeokuta, Ogun State Nigeria',
    footerText: '© 2026 RF Tech Solutions. All Rights Reserved.',
    heroBackgroundImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop',
    websiteLogo: ''
  });

  const [posts, setPosts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch General Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'sites/siteA/settings/general'), (docSnap) => {
      if (docSnap.exists()) {
        setGeneralSettings(docSnap.data() as any);
      }
    });

    // Fetch Posts
    const unsubscribePosts = onSnapshot(collection(db, 'sites/siteA/posts'), (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(fetchedPosts);
    });

    // Fetch Services (for footer)
    const unsubscribeServices = onSnapshot(collection(db, 'sites/siteA/services'), (snapshot) => {
      const fetchedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(fetchedServices);
    });

    return () => {
      unsubscribeSettings();
      unsubscribePosts();
      unsubscribeServices();
    };
  }, []);

  const getDirectImgurUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      if (id) return `https://i.imgur.com/${id}.png`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-white font-sans selection:bg-sky-500/30">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-[var(--c-bg)]/90 backdrop-blur-md border-b border-white/5">
        <Link to="/">
          {generalSettings.websiteLogo ? (
            <img src={generalSettings.websiteLogo} alt="RF Tech Solutions" className="h-8 md:h-10 w-auto" />
          ) : (
            <Logo className="text-[10px]" light />
          )}
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-xs font-medium uppercase tracking-widest text-white/80">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/#about" className="hover:text-white transition-colors">About</Link>
          <Link to="/#services" className="hover:text-white transition-colors">Services</Link>
          <Link to="/blog" className="text-white transition-colors">Blog</Link>
          <Link to="/our-work" className="hover:text-white transition-colors">Our Work</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/contact" className="border border-white/20 px-5 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-sky-600 transition-colors rounded-sm">
            Schedule Consultation
          </Link>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[var(--c-bg)] border-t border-white/10 flex flex-col py-4 px-6 gap-4 md:hidden shadow-xl">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Home</Link>
            <Link to="/#about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">About</Link>
            <Link to="/#services" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Services</Link>
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Blog</Link>
            <Link to="/our-work" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Our Work</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Contact</Link>
          </div>
        )}
      </nav>

      <main className="pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-12">
            <h1 className="display text-4xl md:text-6xl font-medium tracking-tight-custom mb-4">Our Blog</h1>
            <p className="text-white/60 max-w-2xl font-light leading-relaxed">
              Insights, news, and expert perspectives on technology, design, and digital marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <Link to={`/blog/${post.id}`} key={post.id} className="group block">
                <div className="aspect-[16/10] overflow-hidden rounded-sm mb-6 bg-white/5 relative">
                  <img src={getDirectImgurUrl(post.image)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={post.title} referrerPolicy="no-referrer" />
                </div>
                <div className="text-xs uppercase tracking-widest text-white/70 mb-3 font-medium">{post.category}</div>
                <h3 className="text-xl font-medium display tracking-tight-custom mb-3 text-white group-hover:text-white/80 transition-colors">{post.title}</h3>
                <p className="text-white/80 font-light text-sm line-clamp-3 mb-4">{post.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                    Read Full Article <ArrowRight size={14} />
                  </div>
                  <PostStats postId={post.id.toString()} />
                </div>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-20 text-white/40">
              No blog posts found. Check back soon!
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[var(--c-bg)] text-white/80 py-16 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/">
              <Logo className="text-[8px]" light />
            </Link>
            <p className="text-sm leading-relaxed font-light mt-4">
              {generalSettings.heroSubtitle}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm font-light">
              <li><Link to="/" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Home</Link></li>
              <li><Link to="/#about" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> About Us</Link></li>
              <li><Link to="/#services" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Services</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Blog</Link></li>
              <li><Link to="/our-work" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Our Work</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Our Services</h4>
            <ul className="space-y-4 text-sm font-light">
              {services.map(service => (
                <li key={service.id}><Link to="/#services" className="hover:text-white transition-colors">{service.title}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-6 text-sm font-light">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#00d084] shrink-0 mt-1" />
                <span>{generalSettings.contactAddress}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-[#00d084] shrink-0 mt-1" />
                <a href={`mailto:${generalSettings.contactEmail}`} className="hover:text-white transition-colors">{generalSettings.contactEmail}</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
