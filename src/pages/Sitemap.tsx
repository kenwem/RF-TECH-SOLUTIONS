import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Sitemap() {
  const [generalSettings, setGeneralSettings] = useState({
    heroTitle: 'Powering\nBusiness Growth',
    heroSubtitle: 'We build powerful websites, mobile apps, and digital solutions that help businesses grow, reach more customers, and succeed in the digital world.',
    email: 'contact@rftechsolutions.com',
    phone: '+234 813 433 2534',
    address: '98 Adatan Abeokuta, Ogun State Nigeria',
    copyright: '© 2026 RF Tech Solutions. All Rights Reserved.',
    heroBgUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop'
  });

  useEffect(() => {
    // Fetch General Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'sites/siteA/settings/general'), (docSnap) => {
      if (docSnap.exists()) {
        setGeneralSettings(docSnap.data() as any);
      }
    });

    window.scrollTo(0, 0);
    return () => unsubscribeSettings();
  }, []);

  const links = [
    {
      title: 'Main Pages',
      items: [
        { name: 'Home', path: '/' },
        { name: 'Our Work', path: '/our-work' },
        { name: 'Contact', path: '/contact' },
      ]
    },
    {
      title: 'Sections',
      items: [
        { name: 'About Us', path: '/#about' },
        { name: 'Services', path: '/#services' },
        { name: 'Blog / Insights', path: '/#blog' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-white antialiased selection:bg-sky-800 selection:text-white">
      <div className="noise-overlay"></div>
      
      <nav className="fixed top-0 w-full px-6 py-6 md:px-12 flex justify-between items-center z-50 text-white bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Logo className="text-[12px] md:text-[16px]" light />
          </Link>
        </div>
        <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest hover:text-sky-400 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1000px] mx-auto relative z-10">
        <div className="mb-16">
          <h1 className="display text-4xl md:text-6xl font-medium tracking-tight-custom text-white mb-6 uppercase">Sitemap</h1>
          <p className="text-white/70 font-light text-lg">
            A complete list of all pages and sections available on RF Tech Solutions website.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {links.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-sky-400 text-xs uppercase tracking-[0.2em] font-bold mb-6 border-b border-white/10 pb-2">{group.title}</h3>
              <ul className="space-y-4">
                {group.items.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.path.startsWith('/#') ? (
                      <a href={link.path} className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full group-hover:bg-sky-400 transition-colors"></span>
                        {link.name}
                      </a>
                    ) : (
                      <Link to={link.path} className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full group-hover:bg-sky-400 transition-colors"></span>
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-24 pt-12 border-t border-white/10">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Contact Details</h3>
              <div className="space-y-4 text-sm text-white/70 font-light">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-sky-400" />
                  {generalSettings.phone}
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-sky-400" />
                  {generalSettings.email}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-sky-400" />
                  {generalSettings.address}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end items-end">
              <p className="text-xs text-white/40 font-light">
                {generalSettings.copyright}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
