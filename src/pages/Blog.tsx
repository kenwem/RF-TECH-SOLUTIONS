import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Mail, Menu, X, Heart, MessageSquare, Phone } from 'lucide-react';
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <Link to="/">
          {generalSettings.websiteLogo ? (
            <img src={generalSettings.websiteLogo} alt="RF Tech Solutions" className="h-8 md:h-10 w-auto" />
          ) : (
            <Logo className="text-[10px]" />
          )}
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-zinc-900 z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
          <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-sky-600 transition-colors">About</Link>
          <Link to="/services" className="hover:text-sky-600 transition-colors">Services</Link>
          <Link to="/blog" className="text-sky-600 transition-colors">Blog</Link>
          <Link to="/our-work" className="hover:text-sky-600 transition-colors">Our Work</Link>
          <Link to="/contact" className="hover:text-sky-600 transition-colors">Contact</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/contact" className="bg-sky-600 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-sky-700 transition-all rounded-xl shadow-lg shadow-sky-100">
            Schedule Consultation
          </Link>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t border-zinc-100 flex flex-col py-6 px-6 gap-4 md:hidden shadow-2xl">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-sky-600 py-2">Home</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-sky-600 py-2">About</Link>
            <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-sky-600 py-2">Services</Link>
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-sky-600 py-2">Blog</Link>
            <Link to="/our-work" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-sky-600 py-2">Our Work</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-sky-600 py-2">Contact</Link>
          </div>
        )}
      </nav>

      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16 text-center">
            <h1 className="display text-4xl md:text-7xl font-bold tracking-tight text-zinc-900 mb-6">Our Blog</h1>
            <p className="text-zinc-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
              Insights, news, and expert perspectives on technology, design, and digital marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post) => (
              <Link to={`/blog/${post.slug || post.id}`} key={post.id} className="group block bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 hover:-translate-y-1">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={getDirectImgurUrl(post.image)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-sky-600 px-3 py-1.5 rounded-full shadow-sm border border-white/20">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold display tracking-tight text-zinc-900 mb-4 group-hover:text-sky-600 transition-colors line-clamp-2 leading-tight">{post.title}</h3>
                  <p className="text-zinc-500 font-normal text-base line-clamp-3 mb-6 leading-relaxed">{post.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                    <div className="flex items-center gap-2 text-sky-600 text-xs font-bold uppercase tracking-widest">
                      Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                    <PostStats postId={post.id.toString()} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-zinc-200">
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                No blog posts found. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white text-zinc-600 py-20 px-6 md:px-12 border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="space-y-8">
            <Link to="/">
              <Logo className="text-[10px]" />
            </Link>
            <p className="text-base leading-relaxed font-normal text-zinc-500">
              {generalSettings.heroSubtitle}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold text-zinc-900 mb-8">Quick Links</h4>
            <ul className="space-y-4 text-base font-medium">
              <li><Link to="/" className="hover:text-sky-600 transition-colors flex items-center gap-2">Home</Link></li>
              <li><Link to="/about" className="hover:text-sky-600 transition-colors flex items-center gap-2">About Us</Link></li>
              <li><Link to="/services" className="hover:text-sky-600 transition-colors flex items-center gap-2">Services</Link></li>
              <li><Link to="/blog" className="hover:text-sky-600 transition-colors flex items-center gap-2">Blog</Link></li>
              <li><Link to="/our-work" className="hover:text-sky-600 transition-colors flex items-center gap-2">Our Work</Link></li>
              <li><Link to="/contact" className="hover:text-sky-600 transition-colors flex items-center gap-2">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-zinc-900 mb-8">Our Services</h4>
            <ul className="space-y-4 text-base font-medium">
              {services.map(service => (
                <li key={service.id}><Link to={`/service/${service.id}`} className="hover:text-sky-600 transition-colors">{service.title}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-zinc-900 mb-8">Contact Us</h4>
            <ul className="space-y-6 text-base font-normal">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="text-sky-600 shrink-0 mt-1" />
                <span>{generalSettings.contactAddress}</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-4">
                    <Phone size={20} className="text-sky-600 shrink-0 mt-1" />
                    <a href={`tel:${generalSettings.contactPhone.replace(/\s+/g, '')}`} className="hover:text-sky-600 transition-colors">{generalSettings.contactPhone}</a>
                  </div>
                  <a href="https://wa.me/2348134332534" target="_blank" rel="noopener noreferrer" className="text-sky-600 text-xs mt-1 ml-9 hover:underline">WhatsApp Us</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Mail size={20} className="text-sky-600 shrink-0 mt-1" />
                <a href={`mailto:${generalSettings.contactEmail}`} className="hover:text-sky-600 transition-colors">{generalSettings.contactEmail}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto border-t border-zinc-100 mt-16 pt-12 text-center">
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
            {generalSettings.footerText.split('RF').map((part, i, arr) => (
              <Fragment key={i}>
                {part}
                {i < arr.length - 1 && <Link to="/admin" className="hover:text-zinc-600 transition-colors">RF</Link>}
              </Fragment>
            ))}
          </p>
        </div>
      </footer>
    </div>
  );
}
