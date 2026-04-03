import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Smartphone, Monitor, Globe, MapPin, Mail, Menu, X } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function OurWork() {
  const [generalSettings, setGeneralSettings] = useState({
    heroTitle: 'Powering\nBusiness Growth',
    heroSubtitle: 'We build powerful websites, mobile apps, and digital solutions that help businesses grow, reach more customers, and succeed in the digital world.',
    email: 'contact@rftechsolutions.com',
    phone: '+234 813 433 2534',
    address: '98 Adatan Abeokuta, Ogun State Nigeria',
    copyright: '© 2026 RF Tech Solutions. All Rights Reserved.',
    heroBgUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop'
  });

  const defaultServices = [
    { id: 1, title: 'Web Development' },
    { id: 2, title: 'Mobile App Development' },
    { id: 3, title: 'Desktop Application Development' },
    { id: 4, title: 'UI/UX Design' },
    { id: 5, title: 'Digital Marketing' }
  ];

  const [services, setServices] = useState(defaultServices);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'E-Commerce Platform',
      category: 'Web Development',
      description: 'A full-featured e-commerce platform with inventory management, payment processing, and user analytics.',
      image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=2664&auto=format&fit=crop',
      link: 'https://example.com',
      type: 'web'
    },
    {
      id: 2,
      title: 'Fitness Tracking App',
      category: 'Mobile App',
      description: 'A cross-platform mobile application for tracking workouts, nutrition, and connecting with personal trainers.',
      image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=2670&auto=format&fit=crop',
      link: 'https://example.com',
      type: 'mobile'
    },
    {
      id: 3,
      title: 'Enterprise ERP System',
      category: 'Desktop App',
      description: 'A comprehensive desktop application for managing enterprise resources, HR, and financial reporting.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
      link: 'https://example.com',
      type: 'desktop'
    }
  ]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedProjects = localStorage.getItem('rftech_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    const savedSettings = localStorage.getItem('rftech_general_settings');
    if (savedSettings) {
      setGeneralSettings(JSON.parse(savedSettings));
    }

    const savedServices = localStorage.getItem('rftech_services');
    if (savedServices) {
      setServices(JSON.parse(savedServices));
    }
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone size={20} />;
      case 'desktop': return <Monitor size={20} />;
      default: return <Globe size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-white font-sans selection:bg-sky-500/30">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-[var(--c-bg)]/90 backdrop-blur-md border-b border-white/5">
        <Link to="/">
          <Logo className="text-[10px]" light />
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
          <Link to="/#blog" className="hover:text-white transition-colors">Blog</Link>
          <Link to="/our-work" className="text-white transition-colors">Our Work</Link>
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
            <Link to="/#blog" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Blog</Link>
            <Link to="/our-work" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Our Work</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Contact</Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6 md:px-12 relative">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] mb-6 text-sky-400 font-bold flex items-center gap-3">
              <span className="w-8 h-[1px] bg-sky-400"></span>
              Portfolio
            </div>
            <h1 className="display text-5xl md:text-7xl font-medium tracking-tight-custom mb-8 leading-[1.1]">
              Our Work
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed mb-10 max-w-2xl">
              Explore our portfolio of successful projects. From custom web applications to robust mobile and desktop solutions, we deliver excellence across all platforms.
            </p>
          </div>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="py-20 px-6 md:px-12 bg-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-sky-500/50 transition-colors flex flex-col">
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={project.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white">
                    {getIcon(project.type)}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="text-xs uppercase tracking-widest text-sky-400 mb-3 font-medium">{project.category}</div>
                  <h3 className="text-2xl font-medium display tracking-tight-custom mb-4 text-white">{project.title}</h3>
                  <p className="text-white/70 font-light text-sm leading-relaxed mb-8 flex-1">
                    {project.description}
                  </p>
                  {project.link && project.link !== '#' && project.link.trim() !== '' && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-sky-400 transition-colors mt-auto"
                    >
                      View Project <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
            
            {projects.length === 0 && (
              <div className="col-span-full text-center py-20 text-white/50">
                No projects found. Check back later!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="display text-4xl md:text-6xl font-medium tracking-tight-custom mb-8">Ready to start your project?</h2>
          <p className="text-white/70 font-light text-lg mb-10">Let's discuss how we can bring your ideas to life with our expertise.</p>
          <Link to="/contact" className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-sky-50 transition-colors">
            Contact Us <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-[var(--c-bg)] text-white/80 py-16 px-6 md:px-12 relative z-10 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Logo & About */}
          <div className="space-y-6">
            <Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <Logo className="text-[8px]" light />
            </Link>
            <p className="text-sm leading-relaxed font-light mt-4">
              {generalSettings.heroSubtitle}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm font-light">
              <li><Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Home</Link></li>
              <li><Link to="/#about" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> About Us</Link></li>
              <li><Link to="/#services" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Services</Link></li>
              <li><Link to="/#blog" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Blog</Link></li>
              <li><Link to="/our-work" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Our Work</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Our Services</h4>
            <ul className="space-y-4 text-sm font-light">
              {services.map((service) => (
                <li key={service.id}><Link to="/#services" className="hover:text-white transition-colors">{service.title}</Link></li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-6 text-sm font-light">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#00d084] shrink-0 mt-1" />
                <span>{generalSettings.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00d084] shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <a href={`tel:${generalSettings.phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{generalSettings.phone}</a>
                  </div>
                  <a href="https://wa.me/2348134332534" target="_blank" rel="noopener noreferrer" className="text-[#00d084] text-xs mt-1 ml-7 hover:underline">WhatsApp Us</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-[#00d084] shrink-0 mt-1" />
                <a href={`mailto:${generalSettings.email}`} className="hover:text-white transition-colors">{generalSettings.email}</a>
              </li>
            </ul>
          </div>
          
          {/* Copyright */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 border-t border-white/10 pt-8 mt-4 text-center text-sm font-light text-white/60">
            {generalSettings.copyright.split('RF').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && <Link to="/admin" className="hover:text-white transition-colors">RF</Link>}
              </React.Fragment>
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
    </div>
  );
}
