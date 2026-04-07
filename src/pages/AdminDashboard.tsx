import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Users, ArrowLeft, Plus, Edit2, Trash2, X, AlertTriangle, Briefcase, LogOut, Upload, MessageSquare, Check, Trash, Minus, Layout, Database } from 'lucide-react';
import { auth, storage, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
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
        uid: firebaseUser.uid
      });
      const adminEmail = 'kenwem@yahoo.com';
      const userEmail = firebaseUser.email?.toLowerCase().trim();
      if (!userEmail || userEmail !== adminEmail) {
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
              for (const cDoc of commentsSnapshot.docs) {
                const commentData = cDoc.data();
                allFetchedComments.push({
                  id: cDoc.id,
                  postId: postDoc.id,
                  path: cDoc.ref.path,
                  type: 'comment',
                  ...commentData
                });

                // Fetch replies for this comment
                const repliesRef = collection(db, `sites/siteA/posts/${postDoc.id}/comments/${cDoc.id}/replies`);
                const repliesSnapshot = await getDocs(repliesRef);
                repliesSnapshot.docs.forEach(rDoc => {
                  allFetchedComments.push({
                    id: rDoc.id,
                    commentId: cDoc.id,
                    postId: postDoc.id,
                    path: rDoc.ref.path,
                    type: 'reply',
                    ...rDoc.data()
                  });
                });
              }
            } catch (postErr: any) {
              console.warn(`Failed to fetch comments for post ${postDoc.id}:`, postErr);
            }
          }
          
          const sortedComments = allFetchedComments.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate?.() || (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0));
            const dateB = b.createdAt?.toDate?.() || (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0));
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
      }, (err) => {
        console.error("Posts snapshot failed:", err);
        toast.error("Failed to load posts: " + err.message);
      });

      // Fetch Services
      const unsubscribeServices = onSnapshot(collection(db, 'sites/siteA/services'), (snapshot) => {
        const fetchedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedServices = fetchedServices.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setServices(sortedServices);
      }, (err) => {
        console.error("Services snapshot failed:", err);
        toast.error("Failed to load services: " + err.message);
      });

      // Fetch Projects
      const unsubscribeProjects = onSnapshot(collection(db, 'sites/siteA/projects'), (snapshot) => {
        const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(fetchedProjects);
      }, (err) => {
        console.error("Projects snapshot failed:", err);
        toast.error("Failed to load projects: " + err.message);
      });

      // Fetch General Settings
      const unsubscribeSettings = onSnapshot(doc(db, 'sites/siteA/settings/general'), (docSnap) => {
        if (docSnap.exists()) {
          setGeneralSettings(docSnap.data());
        }
      }, (err) => {
        console.error("Settings snapshot failed:", err);
        toast.error("Failed to load settings: " + err.message);
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

  const getDirectImgurUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      if (id) return `https://i.imgur.com/${id}.png`;
    }
    return url;
  };

  const handleApproveComment = async (commentPath: string) => {
    console.log("Approving comment at path:", commentPath);
    try {
      const commentRef = doc(db, commentPath);
      await updateDoc(commentRef, { status: 'approved' });
      toast.success('Comment approved!');
      // Refresh comments after approval
      setAllComments(prev => prev.map(c => c.path === commentPath ? { ...c, status: 'approved' } : c));
    } catch (error) {
      console.error("Error approving comment:", error);
      toast.error(cleanFirebaseError(error instanceof Error ? error.message : 'Failed to approve comment'));
    }
  };

  const handleDeleteComment = async (commentPath: string) => {
    // Removed window.confirm as it can be blocked in iframes
    try {
      const commentRef = doc(db, commentPath);
      await deleteDoc(commentRef);
      toast.success('Comment deleted!');
      // Refresh comments
      setAllComments(prev => prev.filter(c => c.path !== commentPath));
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
  const [serviceFormData, setServiceFormData] = useState({ 
    title: '', 
    subtitle: '',
    description: '', 
    imageUrl: '',
    heroTitle: '',
    heroSubtitle: '',
    whyNeedsThis: '',
    benefits: [] as string[],
    offers: [] as string[],
    pricing: '',
    ctaText: '',
    ctaLink: '',
    order: 0
  });

  // State for Projects (Our Work)
  const [projects, setProjects] = useState<any[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectFormData, setProjectFormData] = useState({ title: '', category: '', description: '', imageUrl: '', projectLink: '', type: 'web' });

  // State for General Settings
  const [generalSettings, setGeneralSettings] = useState<any>({
    heroTitle: 'Powering\nBusiness Growth',
    heroSubtitle: 'We build powerful websites, mobile apps, and digital solutions that help businesses grow, reach more customers, and succeed out in the digital world.',
    heroBackgroundImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop',
    websiteLogo: '',
    aboutUs: 'RF Tech Solutions is a trusted partner for digital transformation projects. Our experienced developers, designers, and marketers ensure high-quality, scalable solutions that power your business growth.',
    contactEmail: 'contact@rftech.ng',
    contactPhone: '+234 813 433 2534',
    contactAddress: '98 Adatan Abeokuta, Ogun State Nigeria',
    footerText: '© 2026 RF Tech Solutions. All Rights Reserved.'
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'heroBackgroundImage' | 'websiteLogo') => {
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
      
      setProjectFormData({ ...projectFormData, imageUrl: downloadURL });
    } catch (error: any) {
      console.error('Error uploading image (project):', error);
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
      
      setServiceFormData({ ...serviceFormData, imageUrl: downloadURL });
    } catch (error: any) {
      console.error('Error uploading image (service):', error);
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
        title: service.title || '',
        subtitle: service.subtitle || '',
        description: service.description || '',
        imageUrl: service.imageUrl || service.image || '',
        heroTitle: service.heroTitle || '',
        heroSubtitle: service.heroSubtitle || '',
        whyNeedsThis: service.whyNeedsThis || '',
        benefits: service.benefits || [],
        offers: service.offers || [],
        pricing: service.pricing || '',
        ctaText: service.ctaText || '',
        ctaLink: service.ctaLink || '',
        order: service.order || 0
      });
    } else {
      setEditingService(null);
      setServiceFormData({ 
        title: '', 
        subtitle: '',
        description: '', 
        imageUrl: '',
        heroTitle: '',
        heroSubtitle: '',
        whyNeedsThis: '',
        benefits: [],
        offers: [],
        pricing: '',
        ctaText: '',
        ctaLink: '',
        order: services.length
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleMoveService = async (service: any, direction: 'up' | 'down') => {
    const currentIndex = services.findIndex(s => s.id === service.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === services.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetService = services[targetIndex];

    try {
      const batch: Promise<void>[] = [];
      batch.push(updateDoc(doc(db, 'sites/siteA/services', service.id), { order: targetIndex }));
      batch.push(updateDoc(doc(db, 'sites/siteA/services', targetService.id), { order: currentIndex }));
      
      await Promise.all(batch);
      toast.success('Order updated');
    } catch (error: any) {
      console.error('Error reordering services:', error);
      toast.error('Failed to reorder services');
    }
  };

  const handleAddBenefit = () => {
    setServiceFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const handleUpdateBenefit = (index: number, value: string) => {
    const newBenefits = [...serviceFormData.benefits];
    newBenefits[index] = value;
    setServiceFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const handleRemoveBenefit = (index: number) => {
    setServiceFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleAddOffer = () => {
    setServiceFormData(prev => ({
      ...prev,
      offers: [...prev.offers, '']
    }));
  };

  const handleUpdateOffer = (index: number, value: string) => {
    const newOffers = [...serviceFormData.offers];
    newOffers[index] = value;
    setServiceFormData(prev => ({ ...prev, offers: newOffers }));
  };

  const handleRemoveOffer = (index: number) => {
    setServiceFormData(prev => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index)
    }));
  };

  const handleSeedServices = async () => {
    const defaultServices = [
      { title: 'Web Development', subtitle: 'Scalable & Responsive', description: 'Custom web applications, e-commerce platforms, and corporate websites built with modern technologies. We deliver fast, secure, and scalable solutions tailored to your business needs.', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2672&auto=format&fit=crop', heroTitle: 'Web Development', heroSubtitle: 'Scalable & Responsive Solutions', whyNeedsThis: 'In today\'s digital-first world, your website is your most important asset. We build high-performance web applications that convert visitors into customers.', benefits: ['Fast Loading Speeds', 'SEO Optimized', 'Mobile Responsive', 'Secure & Scalable'], offers: ['Custom Web Apps', 'E-commerce Solutions', 'Corporate Websites', 'CMS Integration'], pricing: '150,000', ctaText: 'Get a Quote', ctaLink: '/contact' },
      { title: 'Mobile App Development', subtitle: 'iOS & Android', description: 'Native and cross-platform mobile applications that provide seamless user experiences. From concept to app store launch, we build apps that engage and retain users.', imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2670&auto=format&fit=crop', heroTitle: 'Mobile App Development', heroSubtitle: 'Native & Cross-Platform Apps', whyNeedsThis: 'Mobile apps provide a direct channel to your customers. We create engaging mobile experiences that drive loyalty and growth.', benefits: ['Seamless UX', 'High Performance', 'Offline Capabilities', 'Push Notifications'], offers: ['iOS Development', 'Android Development', 'React Native Apps', 'Flutter Solutions'], pricing: '300,000', ctaText: 'Start Building', ctaLink: '/contact' },
      { title: 'Desktop Application Development', subtitle: 'Windows, macOS & Linux', description: 'Robust and high-performance desktop applications tailored for your enterprise needs. We build secure, cross-platform software that integrates seamlessly with your existing infrastructure.', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop', heroTitle: 'Desktop Development', heroSubtitle: 'Enterprise Software Solutions', whyNeedsThis: 'Powerful desktop applications offer performance and integration that web apps can\'t match. We build tools that power your business operations.', benefits: ['Native Performance', 'System Integration', 'Offline Access', 'Enhanced Security'], offers: ['Windows Apps', 'macOS Solutions', 'Cross-Platform Tools', 'Legacy Migration'], pricing: '250,000', ctaText: 'Consult Now', ctaLink: '/contact' },
      { title: 'UI/UX Design', subtitle: 'User-Centric Interfaces', description: 'Intuitive and visually stunning designs that enhance user satisfaction. We focus on user research, wireframing, prototyping, and creating engaging digital experiences.', imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop', heroTitle: 'UI/UX Design', heroSubtitle: 'User-Centric Digital Experiences', whyNeedsThis: 'Great design is more than just looks; it\'s about how it works. We create interfaces that are both beautiful and easy to use.', benefits: ['Improved Conversion', 'User Satisfaction', 'Brand Consistency', 'Reduced Churn'], offers: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design'], pricing: '80,000', ctaText: 'View Portfolio', ctaLink: '/our-work' },
      { title: 'Digital Marketing', subtitle: 'SEO, Social & Content', description: 'Comprehensive digital marketing strategies including Search Engine Optimization (SEO), Social Media Management, and compelling Content Writing to boost your online visibility.', imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2674&auto=format&fit=crop', heroTitle: 'Digital Marketing', heroSubtitle: 'Grow Your Online Presence', whyNeedsThis: 'Building a great product is only half the battle. We help you reach your target audience and grow your business through data-driven marketing.', benefits: ['Increased Traffic', 'Better Lead Quality', 'Brand Awareness', 'Measurable Results'], offers: ['SEO Optimization', 'Social Media Management', 'Content Marketing', 'PPC Campaigns'], pricing: '50,000', ctaText: 'Grow Now', ctaLink: '/contact' }
    ];

    try {
      const batch = defaultServices.map(async (s) => {
        const newRef = doc(collection(db, 'sites/siteA/services'));
        return setDoc(newRef, { ...s, createdAt: serverTimestamp() });
      });
      await Promise.all(batch);
      toast.success('Default services seeded successfully!');
    } catch (error: any) {
      console.error('Error seeding services:', error);
      toast.error('Failed to seed services: ' + error.message);
    }
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
        imageUrl: project.imageUrl || '',
        projectLink: project.projectLink || '',
        type: project.type
      });
    } else {
      setEditingProject(null);
      setProjectFormData({ title: '', category: '', description: '', imageUrl: '', projectLink: '', type: 'web' });
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
            <Layout size={18} />
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
                <div className="flex gap-3">
                  {services.length === 0 && (
                    <button 
                      onClick={handleSeedServices}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                      <Database size={16} /> Seed Defaults
                    </button>
                  )}
                  <button 
                    onClick={() => handleOpenServiceModal()}
                    className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-sky-700 transition-colors"
                  >
                    <Plus size={16} /> Add Service
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {services.map((service: any, index: number) => (
                  <div key={service.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => handleMoveService(service, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-sky-600'}`}
                        >
                          <Plus className="rotate-45 scale-75" size={16} style={{ transform: 'rotate(-135deg)' }} />
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                        </button>
                        <button 
                          onClick={() => handleMoveService(service, 'down')}
                          disabled={index === services.length - 1}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === services.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-sky-600'}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
                        <p className="text-xs text-gray-500">Order: {service.order ?? index}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                          {generalSettings.heroBackgroundImage && (
                            <div className="relative">
                              <img src={generalSettings.heroBackgroundImage} alt="Hero Background" className="w-24 h-16 object-cover rounded border border-gray-200" />
                              <button 
                                type="button" 
                                onClick={() => setGeneralSettings({ ...generalSettings, heroBackgroundImage: '' })}
                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 transition-colors"
                                title="Remove Image"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          <label className="cursor-pointer flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Upload size={16} />
                            {uploadingState === 'heroBackgroundImage' ? 'Uploading...' : 'Upload Image'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'heroBackgroundImage')}
                              disabled={uploadingState === 'heroBackgroundImage'}
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">OR</span>
                          <input 
                            type="url" 
                            value={generalSettings.heroBackgroundImage}
                            onChange={(e) => setGeneralSettings({...generalSettings, heroBackgroundImage: e.target.value})}
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
                          {generalSettings.websiteLogo && (
                            <div className="relative">
                              <img src={generalSettings.websiteLogo} alt="Logo" className="w-auto h-8 object-contain bg-black p-1 rounded" />
                              <button 
                                type="button" 
                                onClick={() => setGeneralSettings({ ...generalSettings, websiteLogo: '' })}
                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 transition-colors"
                                title="Remove Logo"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          <label className="cursor-pointer flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Upload size={16} />
                            {uploadingState === 'websiteLogo' ? 'Uploading...' : 'Upload Logo'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'websiteLogo')}
                              disabled={uploadingState === 'websiteLogo'}
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">OR</span>
                          <input 
                            type="url" 
                            value={generalSettings.websiteLogo}
                            onChange={(e) => setGeneralSettings({...generalSettings, websiteLogo: e.target.value})}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                            placeholder="Paste Logo URL here..."
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">About Us</label>
                      <textarea 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-y" 
                        rows={4}
                        value={generalSettings.aboutUs}
                        onChange={(e) => setGeneralSettings({...generalSettings, aboutUs: e.target.value})}
                        placeholder="Describe your company..."
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
                        value={generalSettings.contactEmail}
                        onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" 
                        value={generalSettings.contactPhone}
                        onChange={(e) => setGeneralSettings({...generalSettings, contactPhone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" 
                        value={generalSettings.contactAddress}
                        onChange={(e) => setGeneralSettings({...generalSettings, contactAddress: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Footer & Copyright</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" 
                        value={generalSettings.footerText}
                        onChange={(e) => setGeneralSettings({...generalSettings, footerText: e.target.value})}
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
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${comment.type === 'reply' ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'}`}>
                              {comment.type === 'reply' ? <MessageSquare size={16} /> : <Users size={20} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-bold text-gray-800">{comment.userName || 'Anonymous'}</div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${comment.type === 'reply' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {comment.type === 'reply' ? 'Reply' : 'Comment'}
                                </span>
                              </div>
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
            <form onSubmit={handleSaveService} className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (e.g. Full-stack solutions)</label>
                  <input 
                    type="text" 
                    value={serviceFormData.subtitle}
                    onChange={(e) => setServiceFormData({...serviceFormData, subtitle: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Brief tagline"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title (Optional)</label>
                  <input 
                    type="text" 
                    value={serviceFormData.heroTitle}
                    onChange={(e) => setServiceFormData({...serviceFormData, heroTitle: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Strong Value Proposition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle / Description</label>
                <textarea 
                  rows={2}
                  value={serviceFormData.heroSubtitle}
                  onChange={(e) => setServiceFormData({...serviceFormData, heroSubtitle: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
                  placeholder="Detailed subtitle for the hero section..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Image URL</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={serviceFormData.imageUrl}
                    onChange={(e) => setServiceFormData({...serviceFormData, imageUrl: e.target.value})}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-gray-50"
                    placeholder="https://..."
                  />
                  <label className="cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300">
                    <Upload size={16} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleServiceImageUpload}
                      disabled={uploadingState === 'service'}
                    />
                  </label>
                </div>
                {serviceFormData.imageUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 mt-2 relative">
                    <img src={serviceFormData.imageUrl} alt="Service Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setServiceFormData({ ...serviceFormData, imageUrl: '' })}
                      className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 transition-colors"
                      title="Remove Image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description (for Home Cards)</label>
                <textarea 
                  required
                  rows={2}
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({...serviceFormData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
                  placeholder="Brief summary..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Why Your Business Needs This</label>
                <textarea 
                  rows={3}
                  value={serviceFormData.whyNeedsThis}
                  onChange={(e) => setServiceFormData({...serviceFormData, whyNeedsThis: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
                  placeholder="Explain the importance..."
                ></textarea>
              </div>

              {/* Benefits List */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Benefits (What you gain)</label>
                  <button 
                    type="button" 
                    onClick={handleAddBenefit}
                    className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Benefit
                  </button>
                </div>
                <div className="space-y-2">
                  {serviceFormData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        type="text" 
                        value={benefit}
                        onChange={(e) => handleUpdateBenefit(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        placeholder="e.g. Increased ROI"
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveBenefit(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offers List */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">What We Offer</label>
                  <button 
                    type="button" 
                    onClick={handleAddOffer}
                    className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Offer
                  </button>
                </div>
                <div className="space-y-2">
                  {serviceFormData.offers.map((offer, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        type="text" 
                        value={offer}
                        onChange={(e) => handleUpdateOffer(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        placeholder="e.g. 24/7 Support"
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveOffer(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pricing / Amount (e.g. 150,000)</label>
                  <input 
                    type="text"
                    value={serviceFormData.pricing}
                    onChange={(e) => setServiceFormData({...serviceFormData, pricing: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Enter amount or pricing details..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order (1 = First, 2 = Second, etc.)</label>
                  <input 
                    type="number"
                    value={serviceFormData.order}
                    onChange={(e) => setServiceFormData({...serviceFormData, order: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                  <input 
                    type="text" 
                    value={serviceFormData.ctaText}
                    onChange={(e) => setServiceFormData({...serviceFormData, ctaText: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="e.g. Get Started"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                  <input 
                    type="text" 
                    value={serviceFormData.ctaLink}
                    onChange={(e) => setServiceFormData({...serviceFormData, ctaLink: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="e.g. /contact"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white py-2 border-t border-gray-100">
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
                      value={projectFormData.projectLink}
                      onChange={(e) => setProjectFormData({...projectFormData, projectLink: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Image URL</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      {projectFormData.imageUrl && (
                        <div className="relative">
                          <img src={getDirectImgurUrl(projectFormData.imageUrl)} alt="Project Preview" className="w-16 h-16 object-cover rounded border border-gray-200" />
                          <button 
                            type="button" 
                            onClick={() => setProjectFormData({ ...projectFormData, imageUrl: '' })}
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
                        value={projectFormData.imageUrl}
                        onChange={(e) => setProjectFormData({...projectFormData, imageUrl: e.target.value})}
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
