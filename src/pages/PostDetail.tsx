import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, MapPin, Mail, Phone, Heart, MessageSquare, Send, LogIn, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Logo } from '../components/Logo';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from '../components/AuthModal';
import { toast } from 'sonner';
import { cleanFirebaseError } from '../lib/errorUtils';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Likes & Comments State
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Fetch Post from Firestore
    if (id) {
      const postRef = doc(db, 'sites/siteA/posts', id);
      const unsubscribePost = onSnapshot(postRef, (docSnap) => {
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setPost(null);
        }
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
  }, [id]);

  // Real-time Likes
  useEffect(() => {
    if (!id) return;
    const likesRef = collection(db, `sites/siteA/posts/${id}/likes`);
    const unsubscribe = onSnapshot(likesRef, (snapshot) => {
      setLikesCount(snapshot.size);
      if (user) {
        setHasLiked(snapshot.docs.some(doc => doc.id === user.uid));
      } else {
        setHasLiked(false);
      }
    });
    return () => unsubscribe();
  }, [id, user]);

  // Real-time Comments
  useEffect(() => {
    if (!id) return;
    const commentsRef = collection(db, `sites/siteA/posts/${id}/comments`);
    
    // Blog page only shows approved comments for everyone.
    // Admin moderates from the dashboard.
    const q = query(commentsRef, where('status', '==', 'approved'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setComments(fetchedComments);
    }, (error: any) => {
      console.error("Error fetching comments:", error);
      if (error.code === 'failed-precondition') {
        toast.error("Comments require a Firestore Index.");
      } else {
        toast.error(cleanFirebaseError(error.message));
      }
    });
    return () => unsubscribe();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const likeRef = doc(db, `sites/siteA/posts/${id}/likes`, user.uid);
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
      toast.error(cleanFirebaseError(error instanceof Error ? error.message : "Failed to update like"));
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const adminEmail = 'kenwem@yahoo.com';
      const userEmail = user.email?.toLowerCase().trim();
      const isAdmin = userEmail === adminEmail.toLowerCase().trim();
      
      await addDoc(collection(db, `sites/siteA/posts/${id}/comments`), {
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
      toast.error(cleanFirebaseError(error instanceof Error ? error.message : "Failed to post comment"));
    } finally {
      setSubmittingComment(false);
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
    <div className="min-h-screen bg-[var(--c-bg)] text-white antialiased selection:bg-sky-800 selection:text-white">
      <div className="noise-overlay"></div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full px-6 py-6 md:px-12 flex justify-between items-center z-50 text-white bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Logo className="text-[12px] md:text-[16px]" light />
          </Link>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-white">{user.displayName || user.email?.split('@')[0]}</div>
                <div className="text-[10px] text-white/50">{user.email}</div>
              </div>
              <button 
                onClick={() => auth.signOut()}
                className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest hover:text-sky-400 transition-colors"
            >
              <LogIn size={16} /> Login
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest hover:text-sky-400 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 md:px-12 max-w-[900px] mx-auto relative z-10">
        {/* Post Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-sky-400 mb-6 font-bold">
            <span className="bg-sky-400/10 px-3 py-1 rounded">{post.category}</span>
            <span className="flex items-center gap-1 text-white/50">
              <Calendar size={14} /> {post.date || post.publishDate || 'Recent'}
            </span>
          </div>
          <h1 className="display text-4xl md:text-6xl font-medium tracking-tight-custom text-white mb-8 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold">
                RF
              </div>
              <div>
                <div className="text-sm font-medium text-white">RF Tech Solutions Team</div>
                <div className="text-xs font-light">Digital Strategy Experts</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${hasLiked ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'}`}
              >
                <Heart size={18} fill={hasLiked ? "currentColor" : "none"} />
                <span className="text-sm font-bold">{likesCount}</span>
              </button>
              <div className="flex items-center gap-2 text-white/50">
                <MessageSquare size={18} />
                <span className="text-sm font-bold">{comments.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="mb-12 rounded-xl overflow-hidden border border-white/10 aspect-video">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="relative mb-20">
          <div 
            ref={contentRef}
            className={`prose prose-invert max-w-none transition-all duration-500 overflow-hidden ${shouldShowExpand && !isExpanded ? 'max-h-[400px]' : 'max-h-none'}`}
          >
            <div 
              className="text-white/90 font-light text-lg leading-relaxed space-y-6 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: post.content || post.description || 'No content available.' }}
            />
          </div>
          
          {shouldShowExpand && (
            <div className={`absolute bottom-0 left-0 w-full flex justify-center pt-20 pb-4 bg-gradient-to-t from-[var(--c-bg)] to-transparent transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <button 
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-3 rounded-full shadow-xl transition-all transform hover:scale-105"
              >
                Read Full Article <ChevronDown size={18} />
              </button>
            </div>
          )}

          {isExpanded && shouldShowExpand && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => {
                  setIsExpanded(false);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest"
              >
                Show Less <ChevronUp size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-3">
            {post.tags.split(',').map((tag: string, i: number) => (
              <span key={i} className="flex items-center gap-1 text-xs uppercase tracking-widest text-white/50 bg-white/5 px-3 py-1.5 rounded-full">
                <Tag size={12} /> {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* COMMENTS SECTION */}
        <section className="mt-20 pt-20 border-t border-white/10">
          <div className="flex items-center gap-3 mb-12">
            <MessageSquare className="text-sky-400" size={24} />
            <h2 className="text-2xl font-bold display tracking-tight-custom">Comments ({comments.length})</h2>
          </div>

          {/* Comment Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
            {user ? (
              <form onSubmit={handleCommentSubmit}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs">
                    {(user.displayName || user.email)[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white/70">Posting as {user.displayName || user.email}</span>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none mb-4"
                  rows={4}
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                    <Send size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/50 mb-6">Please log in to join the discussion.</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-3 rounded-xl transition-all"
                >
                  Log In to Comment
                </button>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-8">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 font-bold shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">{comment.userName}</h4>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest">
                        {comment.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white/70 font-light leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-white/30 font-light italic">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-20 pt-12 border-t border-white/10 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors">
            <ArrowLeft size={18} /> Previous Articles
          </Link>
          <div className="flex gap-4">
            {/* Social Share Placeholders */}
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[var(--c-bg)] text-white/80 py-16 px-6 md:px-12 relative z-10 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Logo & About */}
          <div className="space-y-6">
            <Link to="/">
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
              <li><Link to="/" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Home</Link></li>
              <li><Link to="/our-work" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Our Work</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Contact</Link></li>
              <li><Link to="/sitemap" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">→</span> Sitemap</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Us */}
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
                    <Phone size={18} className="text-[#00d084] shrink-0 mt-1" />
                    <a href={`tel:${generalSettings.phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{generalSettings.phone}</a>
                  </div>
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
            {generalSettings.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
