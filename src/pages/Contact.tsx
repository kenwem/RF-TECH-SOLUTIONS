import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { MapPin, Clock, Mail, Phone, Send, MessageCircle, Menu, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

export default function Contact() {
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

    return () => {
      unsubscribeSettings();
      unsubscribeServices();
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      // In a real app, this would be sent via a backend service
      console.log(`Form submitted to ${generalSettings.contactEmail}`);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-white antialiased selection:bg-sky-800 selection:text-white">
      {/* OVERLAYS */}
      <div className="noise-overlay"></div>

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full px-6 py-6 md:px-12 flex justify-between items-center z-50 text-white bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link to="/">
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
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/services" className="hover:text-white transition-colors">Services</Link>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link to="/our-work" className="hover:text-white transition-colors">Our Work</Link>
          <Link to="/contact" className="text-white transition-colors">Contact</Link>
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

      {/* MAIN CONTENT */}
      <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.2em] mb-4 text-white/60">Get In Touch</div>
          <h1 className="display text-4xl md:text-6xl font-medium tracking-tight-custom text-white mb-6">CONTACT US</h1>
          <p className="text-white/80 font-light max-w-2xl mx-auto text-lg">
            Ready to start your digital transformation? Reach out to our team of experts to discuss your project requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-medium display tracking-tight-custom mb-6">Contact Information</h3>
              <p className="text-white/70 font-light leading-relaxed mb-8">
                Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-sky-400">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-widest text-white mb-1">Phone</h4>
                    <a href={`tel:${generalSettings.contactPhone.replace(/\s+/g, '')}`} className="text-white/70 hover:text-white transition-colors">{generalSettings.contactPhone}</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-green-400">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-widest text-white mb-1">WhatsApp</h4>
                    <a href="https://wa.me/2348134332534" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">Chat with us on WhatsApp</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-sky-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-widest text-white mb-1">Email</h4>
                    <a href={`mailto:${generalSettings.contactEmail}`} className="text-white/70 hover:text-white transition-colors">{generalSettings.contactEmail}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-sky-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-widest text-white mb-1">Headquarters</h4>
                    <p className="text-white/70">Lagos, Nigeria<br/>Serving Worldwide</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-sky-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-widest text-white mb-1">Business Hours</h4>
                    <p className="text-white/70">Mon-Fri: 9AM - 6PM WAT<br/>24/7 Support Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-lg backdrop-blur-sm">
            <h3 className="text-2xl font-medium display tracking-tight-custom mb-6">Send us a Message</h3>
            
            {isSubmitted ? (
              <div className="bg-green-500/20 border border-green-500/30 text-green-200 p-6 rounded-md text-center">
                <h4 className="text-xl font-medium mb-2">Thank You!</h4>
                <p className="font-light">Your message has been sent successfully to {generalSettings.contactEmail}. We will get back to you shortly.</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-sm uppercase tracking-widest border border-green-500/50 px-6 py-2 rounded hover:bg-green-500/20 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-widest text-white/70 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/20 border border-white/10 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-sky-400 transition-colors"
                    placeholder="Ken Wensons"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-widest text-white/70 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/20 border border-white/10 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-sky-400 transition-colors"
                    placeholder="ade@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-xs uppercase tracking-widest text-white/70 mb-2">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/20 border border-white/10 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-sky-400 transition-colors"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-widest text-white/70 mb-2">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-black/20 border border-white/10 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-sky-400 transition-colors resize-none"
                    placeholder="Ken Wensons"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-4 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Send Message <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer id="contact" className="bg-[var(--c-bg)] text-white/80 py-16 px-6 md:px-12 relative z-10 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Logo & About */}
          <div className="space-y-6">
            <Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <Logo className="text-[8px]" light />
            </Link>
            <p className="text-sm leading-relaxed font-light mt-4">
              Bridging the gap between enterprise-level IT services and small business affordability. Reliable, secure, and cost-effective technology solutions.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm font-light">
              <li><Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Services</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Blog</Link></li>
              <li><Link to="/our-work" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Our Work</Link></li>
              <li><Link to="/contact" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Contact</Link></li>
              <li><Link to="/sitemap" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Sitemap</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Our Services</h4>
            <ul className="space-y-4 text-sm font-light">
              {services.map((service) => (
                <li key={service.id}><Link to={`/service/${service.id}`} className="hover:text-white transition-colors">{service.title}</Link></li>
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
