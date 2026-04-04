import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Users, ArrowLeft, Plus, Edit2, Trash2, X, AlertTriangle, Briefcase, LogOut, Upload, MessageSquare, Check, Trash } from 'lucide-react';
import { auth, storage, db } from '../firebase';
import { signOut, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { onSnapshot, doc, updateDoc, deleteDoc, collection, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { cleanFirebaseError } from '../lib/errorUtils';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // State for Comments
  const [allComments, setAllComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoadingComments(false);
        return;
      }
      
      setUser(firebaseUser);
      console.log("Auth State Change:", {
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        uid: firebaseUser.uid
      });
      const adminEmail = 'kenwem@yahoo.com';
      const userEmail = firebaseUser.email?.toLowerCase().trim();
      if (userEmail !== adminEmail.toLowerCase().trim()) {
        console.warn("User is not admin:", userEmail);
        setLoadingComments(false);
        return;
      }

      console.log("Fetching comments for admin:", firebaseUser.email);
      
      const fetchCommentsManually = async () => {
        try {
          const postsRef = collection(db, 'sites/siteA/posts');
          const postsSnapshot = await getDocs(postsRef);
          const allFetchedComments: any[] = [];
          
          for (const postDoc of postsSnapshot.docs) {
            const commentsRef = collection(db, `sites/siteA/posts/${postDoc.id}/comments`);
            try {
              const commentsSnapshot = await getDocs(commentsRef);
              commentsSnapshot.docs.forEach(cDoc => {
                allFetchedComments.push({
                  id: cDoc.id,
                  postId: postDoc.id,
                  path: cDoc.ref.path,
                  ...cDoc.data()
                });
              });
            } catch (postErr: any) {
              console.warn(`Failed to fetch comments for post ${postDoc.id}:`, postErr);
            }
          }
          
          const sortedComments = allFetchedComments.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate() || new Date(0);
            const dateB = b.createdAt?.toDate() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
          
          setAllComments(sortedComments);
          setLoadingComments(false);
        } catch (err: any) {
          console.error("Manual fetch failed:", err);
          setLoadingComments(false);
          toast.error("Failed to load comments: " + err.message);
        }
      };

      fetchCommentsManually();
      
      // Fetch Posts
      const unsubscribePosts = onSnapshot(collection(db, 'sites/siteA/posts'), (snapshot) => {
        const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(fetchedPosts);
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

      // Fetch General Settings
      const unsubscribeSettings = onSnapshot(doc(db, 'sites/siteA/settings/general'), (docSnap) => {
        if (docSnap.exists()) {
          setGeneralSettings(docSnap.data());
        }
      });

      // We'll also set up a simple interval or just rely on manual refresh for now 
      // as the user requested "simple logic like posts fetching"
      const interval = setInterval(fetchCommentsManually, 30000); // Refresh every 30s

      return () => {
        clearInterval(interval);
        unsubscribePosts();
        unsubscribeServices();
        unsubscribeProjects();
        unsubscribeSettings();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  const handleApproveComment = async (commentPath: string) => {
    try {
      const commentRef = doc(db, commentPath);
      await updateDoc(commentRef, { status: 'approved' });
      toast.success('Comment approved!');
    } catch (error) {
      console.error("Error approving comment:", error);
      toast.error(cleanFirebaseError(error instanceof Error ? error.message : 'Failed to approve comment'));
    }
  };

  const handleDeleteComment = async (commentPath: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const commentRef = doc(db, commentPath);
      await deleteDoc(commentRef);
      toast.success('Comment deleted!');
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(cleanFirebaseError(error instanceof Error ? error.message : 'Failed to delete comment'));
    }
  };

  // State for Posts
  const [posts, setPosts] = useState<any[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postFormData, setPostFormData] = useState({ 
    title: '', 
    slug: '',
    image: '', 
    content: '',
    status: 'Draft',
    publishDate: '',
    featured: false,
    category: '',
    tags: ''
  });
  const [activePostTab, setActivePostTab] = useState('content');

  // State for Services
  const [services, setServices] = useState<any[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceFormData, setServiceFormData] = useState({ title: '', description: '', image: '' });

  // State for Projects (Our Work)
  const [projects, setProjects] = useState<any[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectFormData, setProjectFormData] = useState({ title: '', category: '', description: '', image: '', link: '', type: 'web' });

  // State for General Settings
  const [generalSettings, setGeneralSettings] = useState<any>({
    heroTitle: 'Powering\nBusiness Growth',
    heroSubtitle: 'We build powerful websites, mobile apps, and digital solutions that help businesses grow, reach more customers, and succeed in the digital world.',
    email: 'contact@rftechsolutions.com',
    phone: '+234 813 433 2534',
    address: '98 Adatan Abeokuta, Ogun State Nigeria',
    copyright: '© 2026 RF Tech Solutions. All Rights Reserved.',
    heroBgUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop',
    logoUrl: ''
  });

  const [uploadingState, setUploadingState] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'heroBgUrl' | 'logoUrl') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 1MB.');
      return;
    }
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error('You must be logged in to upload images.');
      return;
    }

    setUploadingState(field);
    try {
      const sanitizedFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const storageRef = ref(storage, `uploads/${userId}/images/${Date.now()}_${sanitizedFileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          null,
          (error) => reject(error),
          () => resolve(null)
        );
      });

      const downloadURL = await getDownloadURL(storageRef);
      
      setGeneralSettings({ ...generalSettings, [field]: downloadURL });
      toast.success('Image uploaded successfully! Remember to click Save Changes.');
    } catch (error: any) {
      console.error('Error uploading image (general):', error);
      if (error.serverResponse) {
        console.error('Server response:', error.serverResponse);
      }
      toast.error(`Failed to upload image: ${cleanFirebaseError(error.message)}`);
    } finally {
      setUploadingState(null);
    }
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 1MB.');
      return;
    }
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error('You must be logged in to upload images.');
      return;
    }

    setUploadingState('project');
    try {
      const sanitizedFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const storageRef = ref(storage, `uploads/${userId}/images/projects/${Date.now()}_${sanitizedFileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          null,
          (error) => reject(error),
          () => resolve(null)
        );
      });

      const downloadURL = await getDownloadURL(storageRef);
      
      setProjectFormData({ ...projectFormData, image: downloadURL });
    } catch (error: any) {
      console.error('Error uploading image (project):', error);
      if (error.serverResponse) {
        console.error('Server response:', error.serverResponse);
      }
      toast.error(`Failed to upload image: ${cleanFirebaseError(error.message)}`);
    } finally {
      setUploadingState(null);
    }
  };

  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 1MB.');
      return;
    }
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error('You must be logged in to upload images.');
      return;
    }

    setUploadingState('post');
    try {
      const sanitizedFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const storageRef = ref(storage, `uploads/${userId}/images/posts/${Date.now()}_${sanitizedFileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          null,
          (error) => reject(error),
          () => resolve(null)
        );
      });

      const downloadURL = await getDownloadURL(storageRef);
      
      setPostFormData({ ...postFormData, image: downloadURL });
    } catch (error: any) {
      console.error('Error uploading image (post):', error);
      if (error.serverResponse) {
        console.error('Server response:', error.serverResponse);
      }
      toast.error(`Failed to upload image: ${cleanFirebaseError(error.message)}`);
    } finally {
      setUploadingState(null);
    }
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 1MB.');
      return;
    }
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error('You must be logged in to upload images.');
      return;
    }

    setUploadingState('service');
    try {
      const sanitizedFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const storageRef = ref(storage, `uploads/${userId}/images/services/${Date.now()}_${sanitizedFileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          null,
          (error) => reject(error),
          () => resolve(null)
        );
      });

      const downloadURL = await getDownloadURL(storageRef);
      
      setServiceFormData({ ...serviceFormData, image: downloadURL });
    } catch (error: any) {
      console.error('Error uploading image (service):', error);
      if (error.serverResponse) {
        console.error('Server response:', error.serverResponse);
      }
      toast.error(`Failed to upload image: ${cleanFirebaseError(error.message)}`);
    } finally {
      setUploadingState(null);
    }
  };

  const handleSaveGeneralSettings = async () => {
    try {
      await setDoc(doc(db, 'sites/siteA/settings/general'), generalSettings);
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(cleanFirebaseError(error.message));
    }
  };

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'post' | 'service' | 'project'} | null>(null);

  // Post Handlers
  const handleOpenPostModal = (post: any = null) => {
    if (post) {
      setEditingPost(post);
      setPostFormData({ 
        title: post.title || '', 
        slug: post.slug || '',
        image: post.image || '',
        content: post.content || '',
        status: post.status || 'Draft',
        publishDate: post.publishDate || post.date || '',
        featured: post.featured || false,
        category: post.category || '',
        tags: post.tags || ''
      });
    } else {
      setEditingPost(null);
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setPostFormData({ 
        title: '', 
        slug: '',
        image: '',
        content: '',
        status: 'Draft',
        publishDate: today,
        featured: false,
        category: '',
        tags: ''
      });
    }
    setActivePostTab('content');
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await setDoc(doc(db, 'sites/siteA/posts', editingPost.id), postFormData);
        toast.success('Post updated successfully!');
      } else {
        const newPostRef = doc(collection(db, 'sites/siteA/posts'));
        await setDoc(newPostRef, { ...postFormData, createdAt: serverTimestamp() });
        toast.success('Post created successfully!');
      }
      setIsPostModalOpen(false);
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast.error(cleanFirebaseError(error.message));
    }
  };

  // Service Handlers
  const handleOpenServiceModal = (service: any = null) => {
    if (service) {
      setEditingService(service);
      setServiceFormData({ 
        title: service.title, 
        description: service.description, 
        image: service.image || '' 
      });
    } else {
      setEditingService(null);
      setServiceFormData({ title: '', description: '', image: '' });
    }
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await setDoc(doc(db, 'sites/siteA/services', editingService.id), serviceFormData);
        toast.success('Service updated successfully!');
      } else {
        const newServiceRef = doc(collection(db, 'sites/siteA/services'));
        await setDoc(newServiceRef, { ...serviceFormData, createdAt: serverTimestamp() });
        toast.success('Service created successfully!');
      }
      setIsServiceModalOpen(false);
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(cleanFirebaseError(error.message));
    }
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

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await setDoc(doc(db, 'sites/siteA/projects', editingProject.id), projectFormData);
        toast.success('Project updated successfully!');
      } else {
        const newProjectRef = doc(collection(db, 'sites/siteA/projects'));
        await setDoc(newProjectRef, { ...projectFormData, createdAt: serverTimestamp() });
        toast.success('Project created successfully!');
      }
      setIsProjectModalOpen(false);
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error(cleanFirebaseError(error.message));
    }
  };

  // Delete Handlers
  const confirmDelete = (id: string, type: 'post' | 'service' | 'project') => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete) {
      try {
        const collectionName = itemToDelete.type === 'post' ? 'posts' : 
                             itemToDelete.type === 'service' ? 'services' : 'projects';
        await deleteDoc(doc(db, `sites/siteA/${collectionName}`, itemToDelete.id));
        toast.success(`${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} deleted successfully!`);
      } catch (error: any) {
        console.error('Error deleting item:', error);
        toast.error(cleanFirebaseError(error.message));
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
          <button 
            onClick={() => setActiveTab('comments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'comments' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageSquare size={18} />
            <div className="flex-1 flex items-center justify-between">
              <span>Comments</span>
              {allComments.filter(c => c.status === 'pending').length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {allComments.filter(c => c.status === 'pending').length}
                </span>
              )}
            </div>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600 transition-colors px-4 py-2">
            <ArrowLeft size={16} />
            Back to Website
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors px-4 py-2 rounded-lg"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {user && !user.emailVerified && (
            <div className="mb-8 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-800">Email Not Verified</h3>
                  <p className="text-xs text-rose-600">Please verify your email to ensure full admin access to Firestore.</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  try {
                    await sendEmailVerification(user);
                    toast.success("Verification email sent!");
                  } catch (err: any) {
                    toast.error(cleanFirebaseError(err.message));
                  }
                }}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
              >
                Resend Verification Email
              </button>
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium mb-2">Pending Comments</div>
                  <div className={`text-3xl font-bold ${allComments.filter(c => c.status === 'pending').length > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                    {allComments.filter(c => c.status === 'pending').length}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium mb-2">Active Services</div>
                  <div className="text-3xl font-bold text-gray-800">{services.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium mb-2">Blog Posts</div>
                  <div className="text-3xl font-bold text-gray-800">{posts.length}</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Comments</h3>
                <div className="space-y-4">
                  {allComments.length > 0 ? (
                    allComments.slice(0, 5).map((comment) => (
                      <div key={comment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{comment.userName}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{comment.text}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${comment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {comment.status}
                          </span>
                          <div className="text-xs text-gray-400">
                            {comment.createdAt?.toDate().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
                  )}
                </div>
                {allComments.length > 5 && (
                  <button 
                    onClick={() => setActiveTab('comments')}
                    className="w-full mt-4 text-center text-sm text-sky-600 font-medium hover:text-sky-700"
                  >
                    View All Comments
                  </button>
                )}
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
                      <textarea 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-none" 
                        rows={2}
                        value={generalSettings.heroTitle}
                        onChange={(e) => setGeneralSettings({...generalSettings, heroTitle: e.target.value})}
                      ></textarea>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Background Image</label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          {generalSettings.heroBgUrl && (
                            <div className="relative">
                              <img src={generalSettings.heroBgUrl} alt="Hero Background" className="w-24 h-16 object-cover rounded border border-gray-200" />
                              <button 
                                type="button" 
                                onClick={() => setGeneralSettings({ ...generalSettings, heroBgUrl: '' })}
                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 transition-colors"
                                title="Remove Image"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          <label className="cursor-pointer flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Upload size={16} />
                            {uploadingState === 'heroBgUrl' ? 'Uploading...' : 'Upload Image'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'heroBgUrl')}
                              disabled={uploadingState === 'heroBgUrl'}
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">OR</span>
                          <input 
                            type="url" 
                            value={generalSettings.heroBgUrl}
                            onChange={(e) => setGeneralSettings({...generalSettings, heroBgUrl: e.target.value})}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                            placeholder="Paste Hero Background URL here..."
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website Logo</label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          {generalSettings.logoUrl && (
                            <div className="relative">
                              <img src={generalSettings.logoUrl} alt="Logo" className="w-auto h-8 object-contain bg-black p-1 rounded" />
                              <button 
                                type="button" 
                                onClick={() => setGeneralSettings({ ...generalSettings, logoUrl: '' })}
                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 transition-colors"
                                title="Remove Logo"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          <label className="cursor-pointer flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Upload size={16} />
                            {uploadingState === 'logoUrl' ? 'Uploading...' : 'Upload Logo'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'logoUrl')}
                              disabled={uploadingState === 'logoUrl'}
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">OR</span>
                          <input 
                            type="url" 
                            value={generalSettings.logoUrl}
                            onChange={(e) => setGeneralSettings({...generalSettings, logoUrl: e.target.value})}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                            placeholder="Paste Logo URL here..."
                          />
                        </div>
                      </div>
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

          {activeTab === 'comments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Comment Moderation</h2>
                  {user && (
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-gray-400">
                        Logged in as: <span className="font-mono text-sky-600">{user.email}</span>
                      </p>
                      {!user.emailVerified && (
                        <div className="flex items-center gap-2">
                          <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle size={10} /> Not Verified
                          </span>
                          <button 
                            onClick={async () => {
                              try {
                                await sendEmailVerification(user);
                                toast.success("Verification email sent!");
                              } catch (err: any) {
                                toast.error(cleanFirebaseError(err.message));
                              }
                            }}
                            className="text-[10px] text-sky-600 hover:underline"
                          >
                            Resend Email
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> {allComments.filter(c => c.status === 'pending').length} Pending</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {allComments.filter(c => c.status === 'approved').length} Approved</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loadingComments ? (
                  <div className="p-12 text-center text-gray-500">Loading comments...</div>
                ) : allComments.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {allComments.map((comment) => (
                      <div key={comment.id} className={`p-6 transition-colors hover:bg-gray-50 ${comment.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                              <Users size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-800">{comment.userName || 'Anonymous'}</div>
                              <div className="text-xs text-gray-500">{comment.userEmail}</div>
                            </div>
                            {comment.status === 'pending' && (
                              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {comment.status === 'pending' && (
                              <button 
                                onClick={() => handleApproveComment(comment.path)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <Check size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteComment(comment.path)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed ml-13">
                          {comment.text}
                        </p>
                        <div className="mt-3 ml-13 flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest">
                          <span>{comment.createdAt?.toDate().toLocaleString()}</span>
                          <span>•</span>
                          <span className="font-bold text-sky-600">Post ID: {comment.path.split('/')[1]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500">No comments found.</div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1">
                  <ArrowLeft size={16} /> Back
                </button>
                <h3 className="text-2xl font-bold text-gray-800">{editingPost ? 'Edit Post' : 'New Post'}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500">{postFormData.status}</span>
                <button type="submit" form="postForm" className="px-6 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-2">
                  <FileText size={16} /> Save
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-100 px-6 shrink-0">
              <button 
                type="button" 
                onClick={() => setActivePostTab('content')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activePostTab === 'content' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Content
              </button>
              <button 
                type="button" 
                onClick={() => setActivePostTab('seo')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activePostTab === 'seo' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Seo
              </button>
              <button 
                type="button" 
                onClick={() => setActivePostTab('preview')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activePostTab === 'preview' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Preview
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <form id="postForm" onSubmit={handleSavePost} className="flex flex-col md:flex-row gap-6">
                
                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
                  {activePostTab === 'content' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                        <input 
                          type="text" 
                          value={postFormData.slug}
                          onChange={(e) => setPostFormData({...postFormData, slug: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-gray-50 text-gray-500"
                          placeholder="auto-generated-slug"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                        <div className="flex gap-2 mb-2">
                          <input 
                            type="text" 
                            value={postFormData.image}
                            onChange={(e) => setPostFormData({...postFormData, image: e.target.value})}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-gray-50"
                            placeholder="https://..."
                          />
                          <label className="cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300">
                            <Upload size={16} />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handlePostImageUpload}
                              disabled={uploadingState === 'post'}
                            />
                          </label>
                        </div>
                        {postFormData.image && (
                          <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 mt-2 relative">
                            <img src={postFormData.image} alt="Cover Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setPostFormData({ ...postFormData, image: '' })}
                              className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-red-50 transition-colors"
                              title="Remove Image"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML/Markdown)</label>
                        <textarea 
                          rows={12}
                          value={postFormData.content}
                          onChange={(e) => setPostFormData({...postFormData, content: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-mono text-sm bg-gray-800 text-gray-100 resize-y"
                          placeholder="Write your story here..."
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {activePostTab === 'seo' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <h4 className="font-medium text-gray-800 border-b pb-2">SEO Settings</h4>
                      <p className="text-sm text-gray-500">Configure how your post appears in search engine results.</p>
                      {/* Add SEO fields here if needed later */}
                    </div>
                  )}

                  {activePostTab === 'preview' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <h4 className="font-medium text-gray-800 border-b pb-2">Post Preview</h4>
                      <div className="prose max-w-none">
                        <h1>{postFormData.title || 'Untitled Post'}</h1>
                        {postFormData.image && <img src={postFormData.image} alt="Preview" className="w-full rounded-lg my-4" />}
                        <div dangerouslySetInnerHTML={{ __html: postFormData.content || '<p>No content yet.</p>' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Sidebar */}
                <div className="w-full md:w-80 space-y-6 shrink-0">
                  {/* Publishing Card */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Publishing</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select 
                        value={postFormData.status}
                        onChange={(e) => setPostFormData({...postFormData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                      <input 
                        type="text" 
                        value={postFormData.publishDate}
                        onChange={(e) => setPostFormData({...postFormData, publishDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                        placeholder="DD/MM/YYYY, HH:MM AM"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="featured"
                        checked={postFormData.featured}
                        onChange={(e) => setPostFormData({...postFormData, featured: e.target.checked})}
                        className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Mark as Featured
                      </label>
                    </div>
                  </div>

                  {/* Taxonomy Card */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Taxonomy</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        value={postFormData.category}
                        onChange={(e) => setPostFormData({...postFormData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                      >
                        <option value="">Select a category...</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Apps">Mobile Apps</option>
                        <option value="Destinations">Destinations</option>
                        <option value="Technology">Technology</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                      <input 
                        type="text" 
                        value={postFormData.tags}
                        onChange={(e) => setPostFormData({...postFormData, tags: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                        placeholder="e.g. react, seo, design"
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-gray-800">{editingService ? 'Edit Service' : 'New Service'}</h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="p-6 space-y-4 overflow-y-auto">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    {serviceFormData.image && (
                      <div className="relative">
                        <img src={serviceFormData.image} alt="Service Preview" className="w-16 h-16 object-cover rounded border border-gray-200" />
                        <button 
                          type="button" 
                          onClick={() => setServiceFormData({ ...serviceFormData, image: '' })}
                          className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 transition-colors"
                          title="Remove Image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <label className="cursor-pointer flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      <Upload size={16} />
                      {uploadingState === 'service' ? 'Uploading...' : 'Upload Image'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleServiceImageUpload}
                        disabled={uploadingState === 'service'}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">OR</span>
                    <input 
                      type="url" 
                      value={serviceFormData.image}
                      onChange={(e) => setServiceFormData({...serviceFormData, image: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                      placeholder="Paste Image URL here..."
                    />
                  </div>
                </div>
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
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Image</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      {projectFormData.image && (
                        <div className="relative">
                          <img src={projectFormData.image} alt="Project Preview" className="w-16 h-16 object-cover rounded border border-gray-200" />
                          <button 
                            type="button" 
                            onClick={() => setProjectFormData({ ...projectFormData, image: '' })}
                            className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 transition-colors"
                            title="Remove Image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      <label className="cursor-pointer flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Upload size={16} />
                        {uploadingState === 'project' ? 'Uploading...' : 'Upload Image'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleProjectImageUpload}
                          disabled={uploadingState === 'project'}
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">OR</span>
                      <input 
                        type="url" 
                        value={projectFormData.image}
                        onChange={(e) => setProjectFormData({...projectFormData, image: e.target.value})}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                        placeholder="Paste Image URL here..."
                      />
                    </div>
                  </div>
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
