import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Globe, MapPin, Users, Code, Smartphone, PenTool, Search, Share2, FileText, ArrowDown, Monitor, Mail, Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
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

  const defaultServices = [
    { id: 'web-dev', title: 'Web Development', subtitle: 'Scalable & Responsive', description: 'Custom web applications, e-commerce platforms, and corporate websites built with modern technologies. We deliver fast, secure, and scalable solutions tailored to your business needs.', icon: <Code size={16} />, iconText: 'Full-Stack Solutions', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2672&auto=format&fit=crop' },
    { id: 'mobile-dev', title: 'Mobile App Development', subtitle: 'iOS & Android', description: 'Native and cross-platform mobile applications that provide seamless user experiences. From concept to app store launch, we build apps that engage and retain users.', icon: <Smartphone size={16} />, iconText: 'Cross-Platform Apps', imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2670&auto=format&fit=crop' },
    { id: 'desktop-dev', title: 'Desktop Application Development', subtitle: 'Windows, macOS & Linux', description: 'Robust and high-performance desktop applications tailored for your enterprise needs. We build secure, cross-platform software that integrates seamlessly with your existing infrastructure.', icon: <FileText size={16} />, iconText: 'Enterprise Software', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop' },
    { id: 'ui-ux', title: 'UI/UX Design', subtitle: 'User-Centric Interfaces', description: 'Intuitive and visually stunning designs that enhance user satisfaction. We focus on user research, wireframing, prototyping, and creating engaging digital experiences.', icon: <PenTool size={16} />, iconText: 'Design Systems', imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop' },
    { id: 'marketing', title: 'Digital Marketing', subtitle: 'SEO, Social & Content', description: 'Comprehensive digital marketing strategies including Search Engine Optimization (SEO), Social Media Management, and compelling Content Writing to boost your online visibility.', icon: <Share2 size={16} />, iconText: 'Growth Strategies', imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2674&auto=format&fit=crop' }
  ];

  const [services, setServices] = useState(defaultServices);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderBarRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch General Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'sites/siteA/settings/general'), (docSnap: any) => {
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

  const handleHashScroll = (e?: React.MouseEvent, targetHash?: string) => {
    const hash = targetHash || window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        if (e) e.preventDefault();
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  useEffect(() => {
    // Initial scroll
    handleHashScroll();

    // Listen for hash changes
    window.addEventListener('hashchange', () => handleHashScroll());
    return () => window.removeEventListener('hashchange', () => handleHashScroll());
  }, []);

  // Text Splitter Utility
  const splitTextToWords = (element: Element) => {
    const text = (element as HTMLElement).innerText;
    const words = text.split(' ');
    element.innerHTML = '';
    words.forEach(word => {
      const wordWrap = document.createElement('span');
      wordWrap.classList.add('word-wrap');
      wordWrap.innerHTML = `<span class="word-inner">${word}</span>`;
      element.appendChild(wordWrap);
      element.appendChild(document.createTextNode(' '));
    });
  };

  useEffect(() => {
    // Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Initial text split
    document.querySelectorAll('.split-animate').forEach(el => {
      splitTextToWords(el);
    });

    // Loader Animation
    const loadTl = gsap.timeline({
      onComplete: () => {
        setIsLoaded(true);
        initSite();
      }
    });

    loadTl.to(loaderBarRef.current, { width: '100%', duration: 1.2, ease: 'power2.inOut' })
          .to(loaderTextRef.current, { y: -50, opacity: 0, duration: 0.5 })
          .to(loaderRef.current, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || services.length === 0) return;

    // Refresh ScrollTrigger when services change
    ScrollTrigger.refresh();

    // Card Stack Animation
    const cards = gsap.utils.toArray('.card-item') as HTMLElement[];
    
    cards.forEach((card, i) => {
        const nextCard = cards[i+1];
        if (nextCard) {
            gsap.to(card.querySelector('.card-inner'), {
                scale: 0.95,
                opacity: 0.5, 
                filter: 'blur(5px)',
                ease: "none",
                scrollTrigger: {
                    trigger: nextCard,
                    start: "top bottom", 
                    end: "top 10vh",    
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });
        }
    });

    // Text Reveal on Scroll for dynamic content
    const splitElements = document.querySelectorAll('.split-animate');
    splitElements.forEach(el => {
        // Only split if not already split
        if (el.querySelectorAll('.word-inner').length === 0) {
          splitTextToWords(el);
        }
        
        const words = el.querySelectorAll('.word-inner');
        gsap.to(words, {
            y: "0%",
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.015,
            scrollTrigger: {
                trigger: el,
                start: "top 90%", 
                toggleActions: "play none none reverse"
            }
        });
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger && (st.trigger as HTMLElement).classList.contains('card-item')) {
          st.kill();
        }
      });
    };
  }, [services, isLoaded]);

  function initSite() {
    // Hero Animations
    gsap.to('.hero-text span', { 
        y: 0, 
        stagger: 0.1, 
        duration: 1.5, 
        ease: 'power4.out' 
    });
    gsap.to('.hero-fade', { opacity: 1, y: 0, stagger: 0.1, duration: 1, delay: 0.5 });
    
    // Hero Parallax
    gsap.to('.hero-img', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero-img',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    // Footer Reveal Effect
    gsap.from('.footer-sticky > div', {
        y: 50,
        opacity: 0,
        scale: 0.95,
        scrollTrigger: {
            trigger: '.footer-sticky',
            start: 'top 90%', 
            end: 'bottom bottom',
            scrub: true
        }
    });

    // Handle hash navigation after load
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }

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
    <div className="antialiased selection:bg-sky-800 selection:text-white" style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s' }}>
      
      {/* OVERLAYS */}
      <div className="noise-overlay"></div>

      {/* PRELOADER */}
      {!isLoaded && (
        <div ref={loaderRef} className="loader">
          <div ref={loaderTextRef} className="loader-text">RF TECH SOLUTIONS</div>
          <div ref={loaderBarRef} className="loader-bar"></div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full px-6 py-6 md:px-12 flex justify-between items-center z-50 text-white bg-[var(--c-bg)]/80 backdrop-blur-md md:bg-transparent md:backdrop-blur-none">
        <div className="flex items-center gap-2">
          <Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            {generalSettings.websiteLogo ? (
              <img src={generalSettings.websiteLogo} alt="RF Tech Solutions" className="h-8 md:h-10 w-auto" />
            ) : (
              <Logo className="text-[12px] md:text-[16px]" light />
            )}
          </Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-xs font-medium uppercase tracking-widest text-white/80">
          <Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-white transition-colors">Home</Link>
          <Link to="/#about" onClick={(e) => handleHashScroll(e, '#about')} className="hover:text-white transition-colors">About</Link>
          <Link to="/#services" onClick={(e) => handleHashScroll(e, '#services')} className="hover:text-white transition-colors">Services</Link>
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
            <Link to="/" onClick={() => { window.scrollTo({top: 0, behavior: 'smooth'}); setIsMobileMenuOpen(false); }} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Home</Link>
            <Link to="/#about" onClick={(e) => { handleHashScroll(e, '#about'); setIsMobileMenuOpen(false); }} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">About</Link>
            <Link to="/#services" onClick={(e) => { handleHashScroll(e, '#services'); setIsMobileMenuOpen(false); }} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Services</Link>
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Blog</Link>
            <Link to="/our-work" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Our Work</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white py-2">Contact</Link>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT WRAPPER */}
      <div className="wrapper">
        
        {/* HERO SECTION */}
        <section className="h-screen relative flex items-center justify-center overflow-hidden bg-[#050505]">
          <img 
            src={generalSettings.heroBackgroundImage || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop"} 
            className="absolute inset-0 w-full h-full object-cover hero-img opacity-70" 
            alt="Digital Agency Workspace"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0a6ba0] z-0"></div>
          
          <div className="relative z-10 text-center text-white w-full px-4 flex flex-col items-center">
            
            <h1 className="display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] leading-[1.1] font-medium tracking-tight-custom hero-text overflow-hidden text-white drop-shadow-lg w-full text-center px-4">
              <span className="block translate-y-full whitespace-nowrap" dangerouslySetInnerHTML={{ __html: generalSettings.heroTitle.replace(/\n/g, '<br/>') }}></span>
            </h1>
            
            <p className="mt-8 text-base md:text-lg lg:text-xl font-semibold text-white max-w-3xl mx-auto hero-fade opacity-0 leading-relaxed drop-shadow-lg">
              {generalSettings.heroSubtitle}
            </p>

            {/* Core Pillars Representation */}
            <div className="mt-12 flex flex-wrap justify-center gap-4 hero-fade opacity-0">
              <button className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-white/80 border border-white/20 px-6 py-3 rounded bg-black/40 hover:bg-white hover:text-black transition-colors backdrop-blur-sm">
                <Code size={14} /> Web Dev
              </button>
              <button className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-white/80 border border-white/20 px-6 py-3 rounded bg-black/40 hover:bg-white hover:text-black transition-colors backdrop-blur-sm">
                <Smartphone size={14} /> Mobile Apps
              </button>
              <button className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-white/80 border border-white/20 px-6 py-3 rounded bg-black/40 hover:bg-white hover:text-black transition-colors backdrop-blur-sm">
                <Monitor size={14} /> Desktop Apps
              </button>
              <button className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-white/80 border border-white/20 px-6 py-3 rounded bg-black/40 hover:bg-white hover:text-black transition-colors backdrop-blur-sm">
                <Search size={14} /> SEO & Marketing
              </button>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hero-fade opacity-0 animate-bounce">
            <ArrowDown size={24} className="text-white/50" />
          </div>
        </section>

        {/* INTRO / ABOUT SECTION */}
        <section id="about" className="py-32 px-6 md:px-20 grid md:grid-cols-2 gap-16 max-w-[1600px] mx-auto bg-[var(--c-bg)]">
          <div className="md:sticky md:top-32 self-start z-10 bg-[var(--c-bg)] md:bg-transparent px-1 md:px-0" style={{ background: 'var(--c-bg)' }}>
            <h2 className="display text-3xl md:text-5xl font-medium tracking-tight-custom leading-tight split-animate text-white break-words md:break-normal">
              Building the <br/>Digital <span className="text-white/70">Solutions.</span>
            </h2>
            <div className="mt-8 flex flex-col md:flex-row gap-2 md:gap-4 text-xs font-medium uppercase tracking-widest text-white/70">
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
              <p className="mb-8 split-animate whitespace-pre-line">
                {generalSettings.aboutUs}
              </p>
            ) : (
              <>
                <p className="mb-8 split-animate">
                  RF Tech Solutions is a trusted partner for digital transformation projects. Our experienced developers, designers, and marketers ensure high-quality, scalable solutions that power your business growth.
                </p>
                <p className="mb-8 split-animate">
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
        </section>

        {/* SERVICES STACK */}
        <section id="services" className="stack-section">
          <div className="text-center mb-24 px-6">
            <div className="text-xs uppercase tracking-[0.2em] mb-4 text-white/60">Capabilities</div>
            <h2 className="display text-4xl md:text-6xl font-medium tracking-tight-custom text-white">OUR EXPERTISE</h2>
          </div>

          <div className="stack-container">
            
            {services.map((service, index) => (
              <div className="card-item" key={service.id}>
                <Link to={`/service/${service.id}`} className="card-inner border-white/10 block hover:border-sky-500/50 transition-colors">
                  <div className="card-content">
                    <div>
                      <div className="text-sm font-mono mb-6 text-white border border-white/30 inline-block px-2 py-1 rounded">0{index + 1}</div>
                      <h3 className="text-2xl md:text-3xl font-medium display tracking-tight-custom text-white">{service.title}</h3>
                      <p className="text-sm mt-2 text-white/70 uppercase tracking-widest">{service.subtitle}</p>
                    </div>
                    <div className="text-white/80 font-light text-sm md:text-base leading-relaxed line-clamp-3">
                      {service.description}
                    </div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest pt-2 border-t border-white/10 text-sky-400 group">
                      Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <div className="card-img-wrap">
                    <img src={getDirectImgurUrl(service.imageUrl || (service as any).image)} className="card-img" alt={service.title} referrerPolicy="no-referrer" />
                  </div>
                </Link>
              </div>
            ))}

          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 bg-sky-400 text-center flex flex-col items-center justify-center relative z-10 border-b border-white/10">
          <h2 className="display text-3xl md:text-4xl font-medium tracking-tight-custom mb-6 text-white">Ready to Get Started?</h2>
          <div className="max-w-xl text-white/90 font-light mb-10 leading-relaxed px-6">
            Our expert team is standing by to discuss your digital project and provide customized, scalable solutions tailored to your business needs.
          </div>
          <div className="flex flex-col items-center gap-2">
            <Link to="/contact" className="border border-white/20 px-8 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-sky-600 transition-colors rounded-sm text-white font-medium">
              Contact Us
            </Link>
          </div>
        </section>

      </div> 
      {/* END WRAPPER */}

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
              <li><a href="#about" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> About Us</a></li>
              <li><a href="#services" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Services</a></li>
              <li><Link to="/blog" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Blog</Link></li>
              <li><Link to="/our-work" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Our Work</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Contact</Link></li>
              <li><Link to="/sitemap" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Sitemap</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Our Services</h4>
            <ul className="space-y-4 text-sm font-light">
              {services.map(service => (
                <li key={service.id}><a href="#services" className="hover:text-white transition-colors">{service.title}</a></li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-6 text-sm font-light">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#00d084] shrink-0 mt-1" />
                <span>{generalSettings.contactAddress}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00d084] shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <a href={`tel:${generalSettings.contactPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{generalSettings.contactPhone}</a>
                  </div>
                  <a href="https://wa.me/2348134332534" target="_blank" rel="noopener noreferrer" className="text-[#00d084] text-xs mt-1 ml-7 hover:underline">WhatsApp Us</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-[#00d084] shrink-0 mt-1" />
                <a href={`mailto:${generalSettings.contactEmail}`} className="hover:text-white transition-colors">{generalSettings.contactEmail}</a>
              </li>
            </ul>
          </div>
          
          {/* Copyright */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 border-t border-white/10 pt-8 mt-4 text-center text-sm font-light text-white/60">
            {generalSettings.footerText.split('RF').map((part, i, arr) => (
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
