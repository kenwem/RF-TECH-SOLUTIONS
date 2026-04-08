import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Globe, MapPin, Mail, Menu, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { db } from '../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

export default function About() {
  const [generalSettings, setGeneralSettings] = useState({
    heroTitle: 'Powering\nBusiness Growth',
    heroSubtitle: 'We build powerful websites, mobile apps, and digital solutions that help businesses grow, reach more customers, and succeed in the digital world.',
    contactEmail: 'contact@rftech.ng',
    contactPhone: '+234 813 433 2534',
    contactAddress: '98 Adatan Abeokuta, Ogun State Nigeria',
    footerText: '© 2026 RF Tech Solutions. All Rights Reserved.',
    heroBackgroundImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop',
    websiteLogo: '',
    aboutUs: ''
  });

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

    // Fetch Services (for footer)
    const unsubscribeServices = onSnapshot(collection(db, 'sites/siteA/services'), (snapshot) => {
      const fetchedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(fetchedServices);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeServices();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-white font-sans selection:bg-sky-500/30">
      <div className="noise-overlay"></div>

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
          <Link to="/about" className="text-white transition-colors">About</Link>
          <Link to="/services" className="hover:text-white transition-colors">Services</Link>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
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
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">About</Link>
            <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Services</Link>
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Blog</Link>
            <Link to="/our-work" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Our Work</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Contact</Link>
          </div>
        )}
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-16">
            <div className="text-xs uppercase tracking-[0.2em] mb-6 text-sky-400 font-bold flex items-center gap-3">
              <span className="w-8 h-[1px] bg-sky-400"></span>
              About Us
            </div>
            <h1 className="display text-5xl md:text-7xl font-medium tracking-tight-custom mb-8 leading-[1.1]">
              Our Story & <br /> <span className="text-white/70">Mission.</span>
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <h2 className="display text-3xl md:text-4xl font-medium tracking-tight-custom leading-tight text-white">
                Building the <br/>Digital <span className="text-white/70">Solutions.</span>
              </h2>
              <div className="flex flex-col md:flex-row gap-4 text-xs font-medium uppercase tracking-widest text-white/70">
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  Expert Developers
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} />
                  Global Reach
                </div>
              </div>
            </div>
            
            <div className="text-lg md:text-xl font-light leading-relaxed text-white/90">
              {generalSettings.aboutUs ? (
                <p className="mb-8 whitespace-pre-line">
                  {generalSettings.aboutUs}
                </p>
              ) : (
                <>
                  <p className="mb-8">
                    RF Tech Solutions is a trusted partner for digital transformation projects. Our experienced developers, designers, and marketers ensure high-quality, scalable solutions that power your business growth.
                  </p>
                  <p className="mb-8">
                    We specialize in comprehensive web and mobile app development, UI/UX design, and digital marketing services. From initial concept to final deployment, we manage the complex delivery of modern digital experiences.
                  </p>
                </>
              )}
              
              <div className="h-px w-full bg-white/20 my-10"></div>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium uppercase tracking-widest text-white mb-2">Focus</h4>
                  <p className="text-sm text-white/70">Web & Mobile Solutions</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium uppercase tracking-widest text-white mb-2">Expertise</h4>
                  <p className="text-sm text-white/70">Development & Marketing</p>
                </div>
              </div>
            </div>
          </div>
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
              <li><Link to="/about" className="text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Services</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Blog</Link></li>
              <li><Link to="/our-work" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Our Work</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Our Services</h4>
            <ul className="space-y-4 text-sm font-light">
              {services.map(service => (
                <li key={service.id}><Link to={`/service/${service.id}`} className="hover:text-white transition-colors">{service.title}</Link></li>
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
