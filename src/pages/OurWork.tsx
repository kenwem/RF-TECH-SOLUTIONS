import { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Smartphone, Monitor, Globe, MapPin, Mail, Menu, X, Search, Phone } from 'lucide-react';
import { Logo } from '../components/Logo';
import { db } from '../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

export default function OurWork() {
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

  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch General Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'sites/siteA/settings/general'), (docSnap) => {
      if (docSnap.exists()) {
        setGeneralSettings(docSnap.data() as any);
      }
    });

    // Fetch Services
    const unsubscribeServices = onSnapshot(collection(db, 'sites/siteA/services'), (snapshot) => {
      const fetchedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(fetchedServices);
    });

    // Fetch Projects
    const unsubscribeProjects = onSnapshot(collection(db, 'sites/siteA/projects'), (snapshot) => {
      const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(fetchedProjects);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeServices();
      unsubscribeProjects();
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone size={20} />;
      case 'desktop': return <Monitor size={20} />;
      default: return <Globe size={20} />;
    }
  };

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
          <Link to="/blog" className="hover:text-sky-600 transition-colors">Blog</Link>
          <Link to="/our-work" className="text-sky-600 transition-colors">Our Work</Link>
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
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-sky-600 py-2">Blog</Link>
            <Link to="/our-work" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-sky-600 py-2">Our Work</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-sky-600 py-2">Contact</Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6 md:px-12 relative">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-[0.2em] mb-6 text-sky-600 font-bold flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-sky-600"></span>
              Portfolio
              <span className="w-8 h-[1px] bg-sky-600"></span>
            </div>
            <h1 className="display text-5xl md:text-8xl font-bold tracking-tight text-zinc-900 mb-8 leading-tight">
              Our Work
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
              Explore our portfolio of successful projects. From custom web applications to robust mobile and desktop solutions, we deliver excellence across all platforms.
            </p>
          </div>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="py-20 px-6 md:px-12 bg-white border-y border-zinc-200">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {projects.map((project) => (
              <div key={project.id} className="group bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 flex flex-col hover:-translate-y-1">
                <div 
                  className="h-72 overflow-hidden relative cursor-zoom-in"
                  onClick={() => setSelectedImage(getDirectImgurUrl(project.imageUrl))}
                >
                  <img 
                    src={getDirectImgurUrl(project.imageUrl) || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Search className="text-white" size={32} />
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl text-sky-600 shadow-sm border border-white/20">
                    {getIcon(project.type)}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="text-xs uppercase tracking-widest text-sky-600 mb-4 font-bold">{project.category}</div>
                  <h3 className="text-2xl font-bold display tracking-tight text-zinc-900 mb-4 leading-tight">{project.title}</h3>
                  <p className="text-zinc-500 font-normal text-base leading-relaxed mb-8 flex-1">
                    {project.description}
                  </p>
                  {project.projectLink && project.projectLink !== '#' && project.projectLink.trim() !== '' && (
                    <a 
                      href={project.projectLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors mt-auto uppercase tracking-widest"
                    >
                      View Project <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
            
            {projects.length === 0 && (
              <div className="col-span-full text-center py-32 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                  No projects found. Check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="display text-4xl md:text-7xl font-bold tracking-tight text-zinc-900 mb-8 leading-tight">Ready to start your project?</h2>
          <p className="text-zinc-500 font-medium text-lg mb-12 leading-relaxed">Let's discuss how we can bring your ideas to life with our expertise.</p>
          <Link to="/contact" className="inline-flex items-center gap-3 bg-sky-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-xl shadow-sky-100 active:scale-95">
            Contact Us <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-white text-zinc-600 py-20 px-6 md:px-12 relative z-10 border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          
          {/* Column 1: Logo & About */}
          <div className="space-y-8">
            <Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <Logo className="text-[10px]" />
            </Link>
            <p className="text-base leading-relaxed font-normal text-zinc-500">
              {generalSettings.heroSubtitle}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-zinc-900 mb-8">Quick Links</h4>
            <ul className="space-y-4 text-base font-medium">
              <li><Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-sky-600 transition-colors flex items-center gap-2">Home</Link></li>
              <li><Link to="/about" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-sky-600 transition-colors flex items-center gap-2">About Us</Link></li>
              <li><Link to="/services" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-sky-600 transition-colors flex items-center gap-2">Services</Link></li>
              <li><Link to="/blog" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-sky-600 transition-colors flex items-center gap-2">Blog</Link></li>
              <li><Link to="/our-work" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-sky-600 transition-colors flex items-center gap-2">Our Work</Link></li>
              <li><Link to="/contact" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-sky-600 transition-colors flex items-center gap-2">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <h4 className="text-lg font-bold text-zinc-900 mb-8">Our Services</h4>
            <ul className="space-y-4 text-base font-medium">
              {services.map((service) => (
                <li key={service.id}><Link to={`/service/${service.id}`} className="hover:text-sky-600 transition-colors">{service.title}</Link></li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
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
          
          {/* Copyright */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 border-t border-zinc-100 pt-12 mt-8 text-center text-sm font-medium text-zinc-400 uppercase tracking-widest">
            {generalSettings.footerText.split('RF').map((part, i, arr) => (
              <Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span 
                    onClick={() => navigate('/admin')} 
                    className="hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    RF
                  </span>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/2348134332534" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#1ebe57] transition-colors z-50 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size project" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}
