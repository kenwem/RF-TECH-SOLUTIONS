import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Users, ArrowLeft, Plus, Edit2, Trash2, X, AlertTriangle, Briefcase } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // State for Posts
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('rftech_posts');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: '10 SEO Strategies to Dominate Search Rankings in 2026', category: 'Digital Marketing', date: 'Oct 24, 2024' },
      { id: 2, title: 'Why Your Business Needs a Custom Web Application', category: 'Web Development', date: 'Oct 18, 2024' },
      { id: 3, title: 'The Future of Cross-Platform Mobile Development', category: 'Mobile Apps', date: 'Oct 12, 2024' },
    ];
  });
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postFormData, setPostFormData] = useState({ title: '', category: '', date: '' });

  // State for Services
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('rftech_services');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: 'Web Development', description: 'Custom web applications, e-commerce platforms, and corporate websites built with modern technologies.' },
      { id: 2, title: 'Mobile App Development', description: 'Native and cross-platform mobile applications that provide seamless user experiences.' },
      { id: 3, title: 'Desktop Application Development', description: 'Robust and high-performance desktop applications tailored for your enterprise needs.' },
      { id: 4, title: 'UI/UX Design', description: 'Intuitive and visually stunning designs that enhance user satisfaction.' },
      { id: 5, title: 'Digital Marketing', description: 'Comprehensive digital marketing strategies including Search Engine Optimization (SEO), Social Media Management, and compelling Content Writing.' }
    ];
  });
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceFormData, setServiceFormData] = useState({ title: '', description: '' });

  // State for Projects (Our Work)
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('rftech_projects');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: 'E-Commerce Platform', category: 'Web Development', description: 'A full-featured e-commerce platform with inventory management, payment processing, and user analytics.', image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=2664&auto=format&fit=crop', link: 'https://example.com', type: 'web' },
      { id: 2, title: 'Fitness Tracking App', category: 'Mobile App', description: 'A cross-platform mobile application for tracking workouts, nutrition, and connecting with personal trainers.', image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=2670&auto=format&fit=crop', link: 'https://example.com', type: 'mobile' },
      { id: 3, title: 'Enterprise ERP System', category: 'Desktop App', description: 'A comprehensive desktop application for managing enterprise resources, HR, and financial reporting.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop', link: 'https://example.com', type: 'desktop' }
    ];
  });
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectFormData, setProjectFormData] = useState({ title: '', category: '', description: '', image: '', link: '', type: 'web' });

  // State for General Settings
  const [generalSettings, setGeneralSettings] = useState(() => {
    const saved = localStorage.getItem('rftech_general_settings');
    if (saved) return JSON.parse(saved);
    return {
      heroTitle: 'Empowering Your Digital Future',
      heroSubtitle: 'We build powerful websites, mobile apps, and digital solutions that help businesses grow, reach more customers, and succeed in the digital world.',
      email: 'contact@rftechsolutions.com',
      phone: '+234 813 433 2534',
      address: '98 Adatan Abeokuta, Ogun State Nigeria',
      copyright: '© 2026 RF Tech Solutions. All Rights Reserved.'
    };
  });

  const handleSaveGeneralSettings = () => {
    localStorage.setItem('rftech_general_settings', JSON.stringify(generalSettings));
    alert('Settings saved successfully!');
  };

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, type: 'post' | 'service' | 'project'} | null>(null);

  // Post Handlers
  const handleOpenPostModal = (post: any = null) => {
    if (post) {
      setEditingPost(post);
      setPostFormData({ title: post.title, category: post.category, date: post.date });
    } else {
      setEditingPost(null);
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setPostFormData({ title: '', category: '', date: today });
    }
    setIsPostModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedPosts;
    if (editingPost) {
      updatedPosts = posts.map((p: any) => p.id === editingPost.id ? { ...p, ...postFormData } : p);
    } else {
      updatedPosts = [...posts, { id: Date.now(), ...postFormData }];
    }
    setPosts(updatedPosts);
    localStorage.setItem('rftech_posts', JSON.stringify(updatedPosts));
    setIsPostModalOpen(false);
  };

  // Service Handlers
  const handleOpenServiceModal = (service: any = null) => {
    if (service) {
      setEditingService(service);
      setServiceFormData({ title: service.title, description: service.description });
    } else {
      setEditingService(null);
      setServiceFormData({ title: '', description: '' });
    }
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedServices;
    if (editingService) {
      updatedServices = services.map((s: any) => s.id === editingService.id ? { ...s, ...serviceFormData } : s);
    } else {
      updatedServices = [...services, { id: Date.now(), ...serviceFormData }];
    }
    setServices(updatedServices);
    localStorage.setItem('rftech_services', JSON.stringify(updatedServices));
    setIsServiceModalOpen(false);
  };

  // Project Handlers
  const handleOpenProjectModal = (project: any = null) => {
    if (project) {
      setEditingProject(project);
      setProjectFormData({ 
        title: project.title, 
        category: project.category, 
        description: project.description,
        image: project.image,
        link: project.link,
        type: project.type
      });
    } else {
      setEditingProject(null);
      setProjectFormData({ title: '', category: '', description: '', image: '', link: '', type: 'web' });
    }
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedProjects;
    if (editingProject) {
      updatedProjects = projects.map((p: any) => p.id === editingProject.id ? { ...p, ...projectFormData } : p);
    } else {
      updatedProjects = [...projects, { id: Date.now(), ...projectFormData }];
    }
    setProjects(updatedProjects);
    localStorage.setItem('rftech_projects', JSON.stringify(updatedProjects));
    setIsProjectModalOpen(false);
  };

  // Delete Handlers
  const confirmDelete = (id: number, type: 'post' | 'service' | 'project') => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'post') {
        const updatedPosts = posts.filter((p: any) => p.id !== itemToDelete.id);
        setPosts(updatedPosts);
        localStorage.setItem('rftech_posts', JSON.stringify(updatedPosts));
      } else if (itemToDelete.type === 'service') {
        const updatedServices = services.filter((s: any) => s.id !== itemToDelete.id);
        setServices(updatedServices);
        localStorage.setItem('rftech_services', JSON.stringify(updatedServices));
      } else if (itemToDelete.type === 'project') {
        const updatedProjects = projects.filter((p: any) => p.id !== itemToDelete.id);
        setProjects(updatedProjects);
        localStorage.setItem('rftech_projects', JSON.stringify(updatedProjects));
      }
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-sky-600">RF TECH Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'posts' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FileText size={18} />
            Blog Posts
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Briefcase size={18} />
            Our Work
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={18} />
            General
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'services' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={18} />
            Services
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users size={18} />
            Users
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600 transition-colors">
            <ArrowLeft size={16} />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium mb-2">Total Views</div>
                  <div className="text-3xl font-bold text-gray-800">12,450</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium mb-2">Active Services</div>
                  <div className="text-3xl font-bold text-gray-800">{services.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium mb-2">Blog Posts</div>
                  <div className="text-3xl font-bold text-gray-800">{posts.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium mb-2">Projects</div>
                  <div className="text-3xl font-bold text-gray-800">{projects.length}</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-800">New contact form submission</div>
                        <div className="text-xs text-gray-500">From: john@example.com</div>
                      </div>
                      <div className="text-xs text-gray-400">2 hours ago</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Blog Posts</h2>
                <button 
                  onClick={() => handleOpenPostModal()}
                  className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-sky-700 transition-colors"
                >
                  <Plus size={16} /> New Post
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                      <th className="p-4 font-medium">Title</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post: any) => (
                      <tr key={post.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="p-4 text-sm font-medium text-gray-800">{post.title}</td>
                        <td className="p-4 text-sm text-gray-500">{post.category}</td>
                        <td className="p-4 text-sm text-gray-500">{post.date}</td>
                        <td className="p-4 flex justify-end gap-2">
                          <button onClick={() => handleOpenPostModal(post)} className="p-2 text-gray-400 hover:text-sky-600 transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => confirmDelete(post.id, 'post')} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 text-sm">No blog posts found. Add one to get started.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Projects (Our Work)</h2>
                <button 
                  onClick={() => handleOpenProjectModal()}
                  className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-sky-700 transition-colors"
                >
                  <Plus size={16} /> Add Project
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                      <th className="p-4 font-medium">Title</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project: any) => (
                      <tr key={project.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="p-4 text-sm font-medium text-gray-800">{project.title}</td>
                        <td className="p-4 text-sm text-gray-500">{project.category}</td>
                        <td className="p-4 text-sm text-gray-500 capitalize">{project.type}</td>
                        <td className="p-4 flex justify-end gap-2">
                          <button onClick={() => handleOpenProjectModal(project)} className="p-2 text-gray-400 hover:text-sky-600 transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => confirmDelete(project.id, 'project')} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 text-sm">No projects found. Add one to get started.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Services</h2>
                <button 
                  onClick={() => handleOpenServiceModal()}
                  className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-sky-700 transition-colors"
                >
                  <Plus size={16} /> Add Service
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service: any) => (
                  <div key={service.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{service.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => handleOpenServiceModal(service)} className="p-2 text-gray-400 hover:text-sky-600 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => confirmDelete(service.id, 'service')} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="col-span-full bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
                    No services found. Add one to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">General Settings</h2>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Homepage Content</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" 
                        value={generalSettings.heroTitle}
                        onChange={(e) => setGeneralSettings({...generalSettings, heroTitle: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                      <textarea 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-none" 
                        rows={3} 
                        value={generalSettings.heroSubtitle}
                        onChange={(e) => setGeneralSettings({...generalSettings, heroSubtitle: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" 
                        value={generalSettings.email}
                        onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" 
                        value={generalSettings.phone}
                        onChange={(e) => setGeneralSettings({...generalSettings, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" 
                        value={generalSettings.address}
                        onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Footer & Copyright</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" 
                        value={generalSettings.copyright}
                        onChange={(e) => setGeneralSettings({...generalSettings, copyright: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSaveGeneralSettings}
                    className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h2>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">User Management</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  User management features will be available once authentication is fully integrated with the backend.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editingPost ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSavePost} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={postFormData.title}
                  onChange={(e) => setPostFormData({...postFormData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="Post title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  required
                  value={postFormData.category}
                  onChange={(e) => setPostFormData({...postFormData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="e.g. Digital Marketing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="text" 
                  required
                  value={postFormData.date}
                  onChange={(e) => setPostFormData({...postFormData, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="e.g. Oct 24, 2024"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors">
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editingService ? 'Edit Service' : 'New Service'}</h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
                <input 
                  type="text" 
                  required
                  value={serviceFormData.title}
                  onChange={(e) => setServiceFormData({...serviceFormData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="e.g. Web Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({...serviceFormData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
                  placeholder="Describe the service..."
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editingProject ? 'Edit Project' : 'New Project'}</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form id="projectForm" onSubmit={handleSaveProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                    <input 
                      type="text" 
                      required
                      value={projectFormData.title}
                      onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                      placeholder="e.g. E-Commerce Platform"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input 
                      type="text" 
                      required
                      value={projectFormData.category}
                      onChange={(e) => setProjectFormData({...projectFormData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                      placeholder="e.g. Web Development"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                    <select 
                      value={projectFormData.type}
                      onChange={(e) => setProjectFormData({...projectFormData, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    >
                      <option value="web">Web Application</option>
                      <option value="mobile">Mobile App</option>
                      <option value="desktop">Desktop App</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Link (Optional)</label>
                    <input 
                      type="url" 
                      value={projectFormData.link}
                      onChange={(e) => setProjectFormData({...projectFormData, link: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="url" 
                    required
                    value={projectFormData.image}
                    onChange={(e) => setProjectFormData({...projectFormData, image: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
                    placeholder="Describe the project..."
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" form="projectForm" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors">
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
