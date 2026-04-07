import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Briefcase, Calendar, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const defaultServicesData: Record<string, any> = {
    'web-dev': { title: 'Web Development', subtitle: 'Scalable & Responsive', description: 'Custom web applications, e-commerce platforms, and corporate websites built with modern technologies. We deliver fast, secure, and scalable solutions tailored to your business needs.', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2672&auto=format&fit=crop', heroTitle: 'Web Development', heroSubtitle: 'Scalable & Responsive Solutions', whyNeedsThis: 'In today\'s digital-first world, your website is your most important asset. We build high-performance web applications that convert visitors into customers.', benefits: ['Fast Loading Speeds', 'SEO Optimized', 'Mobile Responsive', 'Secure & Scalable'], offers: ['Custom Web Apps', 'E-commerce Solutions', 'Corporate Websites', 'CMS Integration'], pricing: 'Starting from $1,500', ctaText: 'Get a Quote', ctaLink: '/contact' },
    'mobile-dev': { title: 'Mobile App Development', subtitle: 'iOS & Android', description: 'Native and cross-platform mobile applications that provide seamless user experiences. From concept to app store launch, we build apps that engage and retain users.', imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2670&auto=format&fit=crop', heroTitle: 'Mobile App Development', heroSubtitle: 'Native & Cross-Platform Apps', whyNeedsThis: 'Mobile apps provide a direct channel to your customers. We create engaging mobile experiences that drive loyalty and growth.', benefits: ['Seamless UX', 'High Performance', 'Offline Capabilities', 'Push Notifications'], offers: ['iOS Development', 'Android Development', 'React Native Apps', 'Flutter Solutions'], pricing: 'Starting from $3,000', ctaText: 'Start Building', ctaLink: '/contact' },
    'desktop-dev': { title: 'Desktop Application Development', subtitle: 'Windows, macOS & Linux', description: 'Robust and high-performance desktop applications tailored for your enterprise needs. We build secure, cross-platform software that integrates seamlessly with your existing infrastructure.', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop', heroTitle: 'Desktop Development', heroSubtitle: 'Enterprise Software Solutions', whyNeedsThis: 'Powerful desktop applications offer performance and integration that web apps can\'t match. We build tools that power your business operations.', benefits: ['Native Performance', 'System Integration', 'Offline Access', 'Enhanced Security'], offers: ['Windows Apps', 'macOS Solutions', 'Cross-Platform Tools', 'Legacy Migration'], pricing: 'Starting from $2,500', ctaText: 'Consult Now', ctaLink: '/contact' },
    'ui-ux': { title: 'UI/UX Design', subtitle: 'User-Centric Interfaces', description: 'Intuitive and visually stunning designs that enhance user satisfaction. We focus on user research, wireframing, prototyping, and creating engaging digital experiences.', imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop', heroTitle: 'UI/UX Design', heroSubtitle: 'User-Centric Digital Experiences', whyNeedsThis: 'Great design is more than just looks; it\'s about how it works. We create interfaces that are both beautiful and easy to use.', benefits: ['Improved Conversion', 'User Satisfaction', 'Brand Consistency', 'Reduced Churn'], offers: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design'], pricing: 'Starting from $800', ctaText: 'View Portfolio', ctaLink: '/our-work' },
    'marketing': { title: 'Digital Marketing', subtitle: 'SEO, Social & Content', description: 'Comprehensive digital marketing strategies including Search Engine Optimization (SEO), Social Media Management, and compelling Content Writing to boost your online visibility.', imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2674&auto=format&fit=crop', heroTitle: 'Digital Marketing', heroSubtitle: 'Grow Your Online Presence', whyNeedsThis: 'Building a great product is only half the battle. We help you reach your target audience and grow your business through data-driven marketing.', benefits: ['Increased Traffic', 'Better Lead Quality', 'Brand Awareness', 'Measurable Results'], offers: ['SEO Optimization', 'Social Media Management', 'Content Marketing', 'PPC Campaigns'], pricing: 'Starting from $500/mo', ctaText: 'Grow Now', ctaLink: '/contact' }
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'sites/siteA/services', id), (docSnap) => {
      if (docSnap.exists()) {
        setService({ id: docSnap.id, ...docSnap.data() });
        setLoading(false);
      } else if (defaultServicesData[id]) {
        // Fallback to default data if it's a default ID
        setService({ id, ...defaultServicesData[id] });
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const getDirectImgurUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      if (id) return `https://i.imgur.com/${id}.png`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="text-sky-500 text-xs uppercase tracking-widest font-bold">Loading Service...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-6">
        <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
        <p className="text-gray-400 mb-8">The service you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="bg-sky-600 text-white px-8 py-3 rounded-full font-bold hover:bg-sky-700 transition-all flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-sky-500/30">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center pt-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[40vh]">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-20 py-8"
            >
              <Link to="/#services" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors mb-8 group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest">Back to Services</span>
              </Link>

              <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight tracking-tighter">
                {service.heroTitle || service.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl font-light mb-8">
                {service.heroSubtitle || service.description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a href="#get-started" className="bg-sky-600 text-white px-8 py-4 rounded-full font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2 text-sm">
                  Get Started <ArrowRight size={18} />
                </a>
                <Link to="/our-work" className="bg-white/5 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2 text-sm">
                  View Portfolio
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-[21/9] lg:aspect-[16/7] rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/10"
            >
              <img 
                src={getDirectImgurUrl(service.imageUrl || service.image)} 
                alt={service.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-transparent"></div>
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2rem]"></div>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-500/5 blur-[120px] -mr-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-emerald-500/5 blur-[120px] -ml-32 pointer-events-none"></div>
      </section>

      {/* Why Needs This & Benefits */}
      <section className="py-12 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-32"
            >
              <div className="inline-block px-4 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                The Challenge
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Why Your Business <br /> <span className="text-sky-500">Needs This</span>
              </h2>
              <div className="text-gray-400 text-base leading-relaxed space-y-4 font-light">
                <ReactMarkdown>
                  {service.whyNeedsThis || "We provide top-tier solutions tailored to your business needs, ensuring growth and efficiency in the digital landscape."}
                </ReactMarkdown>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                The Solution
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Key <span className="text-emerald-500">Benefits</span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {(service.benefits && service.benefits.length > 0 ? service.benefits : ["Enhanced performance", "Scalable solutions", "24/7 Support", "Expert guidance"]).map((benefit: string, index: number) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="text-emerald-500" size={16} />
                    </div>
                    <span className="text-gray-200 text-base font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-12 bg-[#050505] relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                Our Services
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">What We <span className="text-sky-500">Offer</span></h2>
              <p className="text-gray-400 text-lg font-light">Comprehensive solutions designed to take your business to the next level.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(service.offers && service.offers.length > 0 ? service.offers : ["Custom Development", "UI/UX Design", "Cloud Infrastructure", "Security Audits"]).map((offer: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/60 hover:border-sky-500/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-sky-500/10 transition-colors"></div>
                
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                  <Briefcase className="text-sky-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 relative z-10">{offer}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light relative z-10">
                  High-quality delivery focused on meeting your specific requirements and exceeding expectations.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages & Pricing */}
      <section id="get-started" className="py-12 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/5 blur-[100px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] -ml-48 -mb-48"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4">
                  Investment
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Packages & <br /><span className="text-sky-500">Pricing</span></h2>
                <div className="prose prose-invert max-w-none text-gray-300 text-base font-light leading-relaxed">
                  <ReactMarkdown>
                    {service.pricing || "Contact us for a custom quote tailored to your specific project requirements. We offer flexible pricing models to suit businesses of all sizes."}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-4">Next Steps</h4>
                  <div className="space-y-4">
                    <Link to="/contact" className="flex items-center justify-between group p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center">
                          <Calendar className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Book Consultation</p>
                          <p className="text-[10px] text-gray-400">15-min discovery call</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </Link>
                    
                    <Link to="/our-work" className="flex items-center justify-between group p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <Briefcase className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">View Portfolio</p>
                          <p className="text-[10px] text-gray-400">See our latest work</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-sky-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">Ready to transform <br /> your business?</h2>
            <p className="text-sky-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-light">
              Let's discuss how we can help you grow with our {service.title} solutions.
            </p>
            <Link 
              to={service.ctaLink || "/contact"} 
              className="inline-flex items-center gap-2 bg-white text-sky-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 active:scale-95"
            >
              {service.ctaText || "Get Started Now"}
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
