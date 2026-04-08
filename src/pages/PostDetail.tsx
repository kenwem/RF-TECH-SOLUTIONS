import { useEffect, useState, useRef, Fragment } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, MapPin, Mail, Phone, Heart, MessageSquare, Send, LogIn, User, ChevronDown, ChevronUp, Trash2, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, setDoc, deleteDoc, getDocs, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from '../components/AuthModal';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Likes & Comments State
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Fetch Post from Firestore
    if (slug) {
      setLoading(true);
      
      // Try fetching by slug first
      const postsRef = collection(db, 'sites/siteA/posts');
      const q = query(postsRef, where('slug', '==', slug), limit(1));
      
      const unsubscribePost = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const postDoc = snapshot.docs[0];
          setPost({ id: postDoc.id, ...postDoc.data() });
          setLoading(false);
        } else {
          // If not found by slug, try fetching by ID (legacy support)
          getDocs(query(collection(db, 'sites/siteA/posts'), where('__name__', '==', slug))).then((idSnapshot) => {
            if (!idSnapshot.empty) {
              const postData = idSnapshot.docs[0].data();
              // If it has a slug, redirect to the slug URL
              if (postData.slug) {
                navigate(`/blog/${postData.slug}`, { replace: true });
              } else {
                setPost({ id: idSnapshot.docs[0].id, ...postData });
                setLoading(false);
              }
            } else {
              setPost(null);
              setLoading(false);
            }
          }).catch(() => {
            setPost(null);
            setLoading(false);
          });
        }
      }, (error) => {
        console.error("Error fetching post:", error);
        setLoading(false);
      });

      // Fetch General Settings from Firestore
      const settingsRef = doc(db, 'sites/siteA/settings/general');
      const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
          setGeneralSettings(docSnap.data() as any);
        }
      });

      window.scrollTo(0, 0);
      return () => {
        unsubscribeAuth();
        unsubscribePost();
        unsubscribeSettings();
      };
    }

    return () => unsubscribeAuth();
  }, [slug, navigate]);

  // Update SEO Meta Tags
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | RF Tech Solutions Blog`;
      
      // Update meta description if available
      const metaDesc = post.metaDescription || post.description;
      if (metaDesc) {
        let metaTag = document.querySelector('meta[name="description"]');
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', 'description');
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', metaDesc);
      }
    }
  }, [post]);

  // Real-time Likes
  useEffect(() => {
    if (!post?.id) return;
    const likesRef = collection(db, `sites/siteA/posts/${post.id}/likes`);
    const unsubscribe = onSnapshot(likesRef, (snapshot) => {
      setLikesCount(snapshot.size);
      if (user) {
        setHasLiked(snapshot.docs.some(doc => doc.id === user.uid));
      } else {
        setHasLiked(false);
      }
    });
    return () => unsubscribe();
  }, [post?.id, user]);

  // Real-time Comments
  useEffect(() => {
    if (!post?.id) return;
    const commentsRef = collection(db, `sites/siteA/posts/${post.id}/comments`);
    
    // Blog page only shows approved comments for everyone.
    // Admin moderates from the dashboard.
    const q = query(commentsRef, where('status', '==', 'approved'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedComments = await Promise.all(snapshot.docs.map(async (commentDoc) => {
        const commentData = commentDoc.data();
        const repliesRef = collection(db, `sites/siteA/posts/${post.id}/comments/${commentDoc.id}/replies`);
        const repliesQuery = query(repliesRef, where('status', '==', 'approved'));
        
        const repliesSnap = await getDocs(repliesQuery);
        const replies = repliesSnap.docs.map(rDoc => ({
          id: rDoc.id,
          ...rDoc.data()
        })).sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateA.getTime() - dateB.getTime();
        });

        return {
          id: commentDoc.id,
          ...commentData,
          replies
        };
      }));

      const sortedComments = fetchedComments.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setComments(sortedComments);
    }, (error: any) => {
      console.error("Error fetching comments:", error);
    });
    return () => unsubscribe();
  }, [post?.id]);

  const siteAdminEmail = 'kenwem@yahoo.com';

  const handleLike = async () => {
    if (!user || !post?.id) {
      setIsAuthModalOpen(true);
      return;
    }

    const likeRef = doc(db, `sites/siteA/posts/${post.id}/likes`, user.uid);
    try {
      if (hasLiked) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post?.id) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const userEmail = user.email?.toLowerCase().trim();
      const isAdmin = userEmail === siteAdminEmail;
      
      await addDoc(collection(db, `sites/siteA/posts/${post.id}/comments`), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0],
        text: newComment,
        createdAt: serverTimestamp(),
        status: isAdmin ? 'approved' : 'pending'
      });
      setNewComment('');
      toast.success(isAdmin ? 'Comment posted!' : 'Comment submitted for approval');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!user || !post?.id) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const userEmail = user.email?.toLowerCase().trim();
      const isAdmin = userEmail === siteAdminEmail;
      
      await addDoc(collection(db, `sites/siteA/posts/${post.id}/comments/${commentId}/replies`), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0],
        text: replyText,
        createdAt: serverTimestamp(),
        status: isAdmin ? 'approved' : 'pending'
      });
      setReplyText('');
      setReplyingTo(null);
      toast.success(isAdmin ? 'Reply posted!' : 'Reply submitted for approval');
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteItem = async (commentId: string, replyId?: string) => {
    if (!post?.id) return;
    try {
      let itemRef;
      const isAdmin = user?.email?.toLowerCase().trim() === siteAdminEmail;
      
      if (replyId) {
        itemRef = doc(db, `sites/siteA/posts/${post.id}/comments/${commentId}/replies`, replyId);
      } else {
        itemRef = doc(db, `sites/siteA/posts/${post.id}/comments`, commentId);
      }
      
      // Frontend only check for delete
      const itemSnap = await getDocs(query(collection(db, `sites/siteA/posts/${post.id}/comments${replyId ? `/${commentId}/replies` : ''}`), where('__name__', '==', replyId || commentId)));
      const itemData = itemSnap.docs[0]?.data();
      
      if (isAdmin || user?.uid === itemData?.userId) {
        await deleteDoc(itemRef);
        toast.success('Deleted successfully');
      } else {
        toast.error('You do not have permission to delete this');
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldShowExpand, setShouldShowExpand] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      if (height > 400) {
        setShouldShowExpand(true);
      }
    }
  }, [post]);

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
      <div className="min-h-screen bg-[var(--c-bg)] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--c-bg)] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-medium mb-4">Post not found</h2>
          <Link to="/" className="text-sky-400 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased selection:bg-sky-100 selection:text-sky-900">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full px-6 py-4 md:px-12 flex justify-between items-center z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Link to="/">
            {generalSettings.websiteLogo ? (
              <img src={generalSettings.websiteLogo} alt="RF Tech Solutions" className="h-8 md:h-10 w-auto" />
            ) : (
              <Logo className="text-[12px] md:text-[16px]" />
            )}
          </Link>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-zinc-900">{user.displayName || user.email?.split('@')[0]}</div>
                <div className="text-[10px] text-zinc-500">{user.email}</div>
              </div>
              <button 
                onClick={() => auth.signOut()}
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-600 hover:text-sky-600 transition-colors font-bold"
            >
              <LogIn size={16} /> Login
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-600 hover:text-sky-600 transition-colors font-bold">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 md:px-12 max-w-[850px] mx-auto relative z-10">
        {/* Post Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-sky-600 mb-6 font-bold">
            <span className="bg-sky-50 px-3 py-1 rounded border border-sky-100">{post.category}</span>
            <span className="flex items-center gap-1 text-zinc-400">
              <Calendar size={14} /> {post.date || post.publishDate || 'Recent'}
            </span>
          </div>
          <h1 className="display text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-8 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-between border-y border-zinc-100 py-6">
            <div className="flex items-center gap-3 text-zinc-600">
              <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-200">
                RF
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">RF Tech Solutions Team</div>
                <div className="text-xs font-medium text-zinc-500">Digital Strategy Experts</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${hasLiked ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm' : 'border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 hover:bg-zinc-50'}`}
              >
                <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
                <span className="text-sm font-bold">{likesCount}</span>
              </button>
              <div className="flex items-center gap-2 text-zinc-400 bg-zinc-50 px-4 py-2.5 rounded-full border border-zinc-100">
                <MessageSquare size={20} />
                <span className="text-sm font-bold">{comments.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="mb-16 rounded-2xl overflow-hidden border border-zinc-200 aspect-video shadow-2xl shadow-zinc-200/50">
            <img 
              src={getDirectImgurUrl(post.image)} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Post Content Container */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-zinc-200 shadow-sm mb-20">
          <div className="relative">
            <div 
              ref={contentRef}
              className={`prose prose-zinc max-w-none transition-all duration-500 overflow-hidden ${shouldShowExpand && !isExpanded ? 'max-h-[600px]' : 'max-h-none'}`}
            >
              <div className="text-zinc-800 font-normal text-lg leading-relaxed blog-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl md:text-5xl font-bold mt-12 mb-6 text-zinc-900 display tracking-tight" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl md:text-4xl font-bold mt-10 mb-5 text-zinc-900 display tracking-tight" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl md:text-2xl font-bold mt-8 mb-4 text-sky-600 display tracking-tight" {...props} />,
                    p: ({node, ...props}) => <p className="mb-6 leading-relaxed text-zinc-700" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-6 space-y-2 text-zinc-700" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-6 space-y-2 text-zinc-700" {...props} />,
                    li: ({node, ...props}) => <li className="ml-4" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-sky-500 pl-6 py-4 my-8 italic text-zinc-600 bg-sky-50/50 rounded-r-2xl" {...props} />
                    ),
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-8 rounded-xl border border-zinc-200">
                        <table className="w-full text-sm text-left" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-zinc-50 text-zinc-900 uppercase text-xs font-bold" {...props} />,
                    th: ({node, ...props}) => <th className="px-6 py-4 border-b border-zinc-200" {...props} />,
                    td: ({node, ...props}) => <td className="px-6 py-4 border-b border-zinc-100 text-zinc-600" {...props} />,
                    img: ({node, ...props}) => (
                      <img 
                        className="w-full rounded-2xl my-10 border border-zinc-200 shadow-xl" 
                        referrerPolicy="no-referrer"
                        {...props} 
                      />
                    ),
                    a: ({node, ...props}) => (
                      <a className="text-sky-600 hover:text-sky-700 font-medium underline decoration-sky-500/30 underline-offset-4 transition-colors" {...props} />
                    ),
                  }}
                >
                  {post.content || post.description || 'No content available.'}
                </ReactMarkdown>
              </div>
            </div>
            
            {shouldShowExpand && (
              <div className={`absolute bottom-0 left-0 w-full flex justify-center pt-32 pb-4 bg-gradient-to-t from-white to-transparent transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-10 py-4 rounded-full shadow-2xl shadow-sky-200 transition-all transform hover:scale-105 active:scale-95"
                >
                  Read Full Article <ChevronDown size={18} />
                </button>
              </div>
            )}

            {isExpanded && shouldShowExpand && (
              <div className="flex justify-center mt-12 border-t border-zinc-100 pt-8">
                <button 
                  onClick={() => {
                    setIsExpanded(false);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors text-sm uppercase tracking-widest font-bold"
                >
                  Show Less <ChevronUp size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Share Section */}
        <div className="mb-12 flex items-center justify-between border-y border-zinc-100 py-8">
          <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Share this article</div>
          <div className="flex gap-4">
            {/* WhatsApp */}
            <button 
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${post.title} - ${window.location.href}`)}`, '_blank')}
              className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-all shadow-lg shadow-green-100"
              title="Share on WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </button>
            {/* Facebook */}
            <button 
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:bg-[#0c63d4] transition-all shadow-lg shadow-blue-100"
              title="Share on Facebook"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            {/* Twitter / X */}
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
              title="Share on X"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            {/* LinkedIn */}
            <button 
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="w-12 h-12 rounded-full bg-[#0077B5] flex items-center justify-center text-white hover:bg-[#005885] transition-all shadow-lg shadow-blue-100"
              title="Share on LinkedIn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </button>
          </div>
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="mt-16 pt-8 border-t border-zinc-200 flex flex-wrap gap-3">
            {post.tags.split(',').map((tag: string, i: number) => (
              <span key={i} className="flex items-center gap-1 text-xs uppercase tracking-widest text-zinc-500 bg-zinc-100 px-4 py-2 rounded-full font-bold border border-zinc-200">
                <Tag size={12} /> {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* COMMENTS SECTION */}
        <section className="mt-20 pt-20 border-t border-zinc-200">
          <div className="flex items-center gap-3 mb-12">
            <MessageSquare className="text-sky-600" size={28} />
            <h2 className="text-3xl font-bold display tracking-tight text-zinc-900">Comments ({comments.length})</h2>
          </div>

          {/* Comment Form */}
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 mb-12 shadow-sm">
            {user ? (
              <form onSubmit={handleCommentSubmit}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-sky-100">
                    {(user.displayName || user.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-zinc-900">{user.displayName || user.email?.split('@')[0]}</span>
                    {user.email?.toLowerCase().trim() !== siteAdminEmail && (
                      <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Posting as Guest</span>
                    )}
                  </div>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What are your thoughts on this?"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-none mb-6 min-h-[150px] text-lg"
                  rows={4}
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-10 py-4 rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-200 active:scale-95"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                    <Send size={20} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                <p className="text-zinc-500 mb-8 font-medium">Join the discussion and share your perspective.</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-lg shadow-sky-200"
                >
                  Log In to Comment
                </button>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-12">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="group">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold shrink-0 border border-zinc-200">
                      <User size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold text-zinc-900">{comment.userName}</h4>
                          {comment.userEmail?.toLowerCase().trim() === siteAdminEmail && (
                            <span className="text-[10px] bg-sky-100 text-sky-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-sky-200">Admin</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                            {comment.createdAt?.toDate().toLocaleDateString()}
                          </span>
                          {(user?.uid === comment.userId || user?.email?.toLowerCase().trim() === siteAdminEmail) && (
                            <button 
                              onClick={() => handleDeleteItem(comment.id)}
                              className="text-zinc-300 hover:text-red-500 transition-colors"
                              title="Delete Comment"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-zinc-200 mb-4 shadow-sm">
                        <p className="text-zinc-700 font-normal leading-relaxed text-lg">
                          {comment.text}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-2">
                        <button 
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare size={16} /> Reply
                        </button>
                      </div>

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <div className="mt-6 ml-6 pl-6 border-l-4 border-sky-100">
                          {user ? (
                            <div className="space-y-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a thoughtful reply..."
                                className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                                rows={3}
                              ></textarea>
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  className="text-sm font-bold text-zinc-400 hover:text-zinc-900 px-4 py-2 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleReplySubmit(comment.id)}
                                  disabled={submittingReply || !replyText.trim()}
                                  className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-sky-100"
                                >
                                  {submittingReply ? 'Replying...' : 'Post Reply'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-400 italic">Please log in to reply.</p>
                          )}
                        </div>
                      )}

                      {/* Replies List */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-8 ml-6 pl-6 border-l-4 border-zinc-100 space-y-8">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 font-bold shrink-0 border border-zinc-100">
                                <User size={20} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-sm font-bold text-zinc-900">{reply.userName}</h5>
                                    {reply.userEmail?.toLowerCase().trim() === siteAdminEmail && (
                                      <span className="text-[8px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-sky-200">Admin</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                                      {reply.createdAt?.toDate().toLocaleDateString()}
                                    </span>
                                    {(user?.uid === reply.userId || user?.email?.toLowerCase().trim() === siteAdminEmail) && (
                                      <button 
                                        onClick={() => handleDeleteItem(comment.id, reply.id)}
                                        className="text-zinc-200 hover:text-red-500 transition-colors"
                                        title="Delete Reply"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                                  <p className="text-base text-zinc-600 font-normal leading-relaxed">
                                    {reply.text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-[2rem] bg-zinc-50">
                <p className="text-zinc-400 font-medium italic">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section / Internal Links */}
        <div className="mt-20 p-8 md:p-12 rounded-[2rem] bg-zinc-900 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 display tracking-tight">Need help with your digital strategy?</h3>
            <p className="text-white/70 mb-8 max-w-xl font-light">
              At RF Tech Solutions, we specialize in building high-performance websites and digital experiences that drive growth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20">
                Get a Free Consultation <ArrowRight size={18} />
              </Link>
              <Link to="/services" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl border border-white/10 transition-all">
                Explore Services
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-20 pt-12 border-t border-zinc-200 flex justify-between items-center">
          <Link to="/blog" className="flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-widest">
            <ArrowLeft size={18} /> More Articles
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white text-zinc-600 py-20 px-6 md:px-12 relative z-10 border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          
          {/* Column 1: Logo & About */}
          <div className="space-y-8">
            <Link to="/">
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
              <li><Link to="/" className="hover:text-sky-600 transition-colors flex items-center gap-2">Home</Link></li>
              <li><Link to="/about" className="hover:text-sky-600 transition-colors flex items-center gap-2">About Us</Link></li>
              <li><Link to="/services" className="hover:text-sky-600 transition-colors flex items-center gap-2">Services</Link></li>
              <li><Link to="/blog" className="hover:text-sky-600 transition-colors flex items-center gap-2">Blog</Link></li>
              <li><Link to="/our-work" className="hover:text-sky-600 transition-colors flex items-center gap-2">Our Work</Link></li>
              <li><Link to="/contact" className="hover:text-sky-600 transition-colors flex items-center gap-2">Contact</Link></li>
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
    </div>
  );
}
