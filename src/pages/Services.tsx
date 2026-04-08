import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Mail, Menu, X, Code, Smartphone, Share2, FileText, PenTool } from 'lucide-react';
import { Logo } from '../components/Logo';
import { db } from '../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

export default function Services() {
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

  const defaultServices = [
    { id: 'web-dev', title: 'Web Development', subtitle: 'Scalable & Responsive', description: 'Custom web applications, e-commerce platforms, and corporate websites built with modern technologies. We deliver fast, secure, and scalable solutions tailored to your business needs.', icon: <Code size={16} />, iconText: 'Full-Stack Solutions', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2672&auto=format&fit=crop' },
    { id: 'mobile-dev', title: 'Mobile App Development', subtitle: 'iOS & Android', description: 'Native and cross-platform mobile applications that provide seamless user experiences. From concept to app store launch, we build apps that engage and retain users.', icon: <Smartphone size={16} />, iconText: 'Cross-Platform Apps', imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2670&auto=format&fit=crop' },
    { id: 'desktop-dev', title: 'Desktop Application Development', subtitle: 'Windows, macOS & Linux', description: 'Robust and high-performance desktop applications tailored for your enterprise needs. We build secure, cross-platform software that integrates seamlessly with your existing infrastructure.', icon: <FileText size={16} />, iconText: 'Enterprise Software', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop' },
    { id: 'ui-ux', title: 'UI/UX Design', subtitle: 'User-Centric Interfaces', description: 'Intuitive and visually stunning designs that enhance user satisfaction. We focus on user research, wireframing, prototyping, and creating engaging digital experiences.', icon: <PenTool size={16} />, iconText: 'Design Systems', imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop' },
    { id: 'marketing', title: 'Digital Marketing', subtitle: 'SEO, Social & Content', description: 'Comprehensive digital marketing strategies including Search Engine Optimization (SEO), Social Media Management, and compelling Content Writing to boost your online visibility.', icon: <Share2 size={16} />, iconText: 'Growth Strategies', imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2674&auto=format&fit=crop' }
  ];

  const [services, setServices] = useState(defaultServices);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch General Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'sites/siteA/settings/general'), (docSnap) => {
      if (docSnap.exists()) {
        setGeneralSettings(docSnap.data() as any);
      }
    });

    // Fetch Services
    const unsubscribeServices = onSnapshot(collection(db, 'sites/siteA/services'), (snapshot) => {
      const fetchedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (fetchedServices.length > 0) {
        const sortedServices = fetchedServices.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setServices(sortedServices as any);
      }
    });

    return () => {
      unsubscribeSettings();
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
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/services" className="text-white transition-colors">Services</Link>
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
              Our Expertise
            </div>
            <h1 className="display text-5xl md:text-7xl font-medium tracking-tight-custom mb-8 leading-[1.1]">
              Digital Solutions <br /> <span className="text-white/70">for Modern Business.</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Link to={`/service/${service.id}`} key={service.id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-sky-500/50 transition-all flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={getDirectImgurUrl(service.imageUrl || (service as any).image)} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={service.title} 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="text-sm font-mono mb-4 text-white/40">0{index + 1}</div>
                  <h3 className="text-2xl font-medium display tracking-tight-custom mb-3 text-white">{service.title}</h3>
                  <p className="text-xs uppercase tracking-widest text-sky-400 mb-4 font-bold">{service.subtitle}</p>
                  <p className="text-white/70 font-light text-sm leading-relaxed mb-6 flex-1">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 group-hover:text-sky-400 transition-colors">
                    Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
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
              <li><Link to="/about" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> About Us</Link></li>
              <li><Link to="/services" className="text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Services</Link></li>
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
