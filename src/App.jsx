import { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfile from './components/UserProfile';
import Post from './components/Post';
import PostForm from './components/PostForm';
import BulkUpload from './components/BulkUpload';
import './styles.css';

export default function App() {
  const API_BASE = import.meta.env.VITE_API_URL || 'https://final-api-vbac.onrender.com';

  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [user, setUser] = useState({
    username: 'Anonymous',
    userImageUrl: 'https://randomuser.me/api/portraits/lego/1.jpg'
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showEmptyPostModal, setShowEmptyPostModal] = useState(false);
  const [popupMedia, setPopupMedia] = useState(null); // { type, src, title }

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      addAlert('Failed to fetch posts. Please try again later.', 'error');
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      if (!postData.content?.trim() && !postData.imageUrl?.trim() && !postData.videoUrl?.trim()) {
        setShowEmptyPostModal(true);
        return false;
      }

      const response = await axios.post(`${API_BASE}/api/posts`, {
        username: user.username,
        userImageUrl: user.userImageUrl,
        content: postData.content?.trim() || null,
        imageUrl: postData.imageUrl?.trim() || null,
        videoUrl: postData.videoUrl?.trim() || null
      });
      
      setPosts([response.data, ...posts]);
      addAlert('Post created successfully!');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to create post';
      console.error('Error creating post:', error.response?.data || error.message);
      addAlert(errorMessage, 'error');
      return false;
    }
  };

  const handleBulkCreate = async (postData) => {
    try {
      const postsWithUserInfo = postData.map(post => ({
        ...post,
        username: post.username?.trim() || user.username,
        userImageUrl: post.userImageUrl?.trim() || user.userImageUrl,
        imageUrl: post.imageUrl?.trim() || null,
        videoUrl: post.videoUrl?.trim() || null
      }));
      const response = await axios.post(`${API_BASE}/api/posts/bulk`, postsWithUserInfo);
      setPosts([...response.data, ...posts]);
      addAlert(`${response.data.length} posts created successfully!`);
      return { success: true };
    } catch (error) {
      console.error('Error bulk creating posts:', error);
      addAlert('Failed to create posts', 'error');
      return { success: false };
    }
  };

  const handleUpdatePost = async (updatedPost) => {
    try {
      const response = await axios.put(`${API_BASE}/api/posts/${updatedPost.id}`, {
        ...updatedPost,
        imageUrl: updatedPost.imageUrl?.trim() || null,
        videoUrl: updatedPost.videoUrl?.trim() || null
      });
      setPosts(posts.map(p => p.id === updatedPost.id ? response.data : p));
      addAlert('Post updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      addAlert('Failed to update post', 'error');
      return false;
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/posts/${id}`);
      setPosts(posts.filter(post => post.id !== id));
      addAlert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      addAlert('Failed to delete post', 'error');
    }
  };

  const handleLikePost = async (id) => {
    try {
      const response = await axios.post(`${API_BASE}/api/posts/${id}/like`);
      setPosts(posts.map(p => p.id === id ? response.data : p));
    } catch (error) {
      addAlert('Failed to like post', 'error');
    }
  };

  const handleSharePost = async (id) => {
    try {
      const response = await axios.post(`${API_BASE}/api/posts/${id}/share`);
      setPosts(posts.map(p => p.id === id ? response.data : p));
      addAlert('Post shared!');
    } catch (error) {
      addAlert('Failed to share post', 'error');
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const response = await axios.post(`${API_BASE}/api/posts/${postId}/comments`, {
        username: user.username,
        userImageUrl: user.userImageUrl,
        content: content?.trim()
      });
      setPosts(posts.map(post => post.id === postId ? response.data : post));
      addAlert('Comment added successfully!');
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      addAlert('Failed to add comment', 'error');
      return false;
    }
  };

  const handleUpdateComment = async (postId, commentId, content) => {
    try {
      const response = await axios.put(`${API_BASE}/api/posts/${postId}/comments/${commentId}`, {
        content: content?.trim()
      });
      setPosts(posts.map(post =>
        post.id === postId ? {
          ...post,
          comments: post.comments.map(comment =>
            comment.id === commentId ? response.data : comment
          )
        } : post
      ));
      addAlert('Comment updated successfully!');
      return true;
    } catch (error) {
      addAlert('Failed to update comment', 'error');
      return false;
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axios.delete(`${API_BASE}/api/posts/${postId}/comments/${commentId}`);
      setPosts(posts.map(post =>
        post.id === postId ? {
          ...post,
          comments: post.comments.filter(comment => comment.id !== commentId)
        } : post
      ));
      addAlert('Comment deleted successfully!');
    } catch (error) {
      addAlert('Failed to delete comment', 'error');
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      const response = await axios.post(`${API_BASE}/api/posts/${postId}/comments/${commentId}/like`);
      setPosts(posts.map(post =>
        post.id === postId ? {
          ...post,
          comments: post.comments.map(comment =>
            comment.id === commentId ? { ...comment, likeCount: response.data.likeCount } : comment
          )
        } : post
      ));
    } catch (error) {
      addAlert('Failed to like comment', 'error');
    }
  };

  const handleUserUpdate = (newUserData) => {
    setUser(newUserData);
    addAlert('Profile updated!');
  };

  const addAlert = (message, type = 'success') => {
    const id = Date.now();
    setAlerts(prevAlerts => {
      const newAlerts = [...prevAlerts, { id, message, type }];
      setTimeout(() => {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
      }, 5000);
      return newAlerts;
    });
  };

  // Handler to open popup
  const handleMediaPopup = (type, src, title) => {
    setPopupMedia({ type, src, title });
    // Prevent background scroll when popup is open
    document.body.style.overflow = 'hidden';
  };

  // Handler to close popup
  const closeMediaPopup = () => {
    setPopupMedia(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      {/* Popup rendered at root level */}
      {popupMedia && (
        <div className="media-popup-backdrop" onClick={closeMediaPopup}>
          <div className="media-popup-card" onClick={e => e.stopPropagation()}>
            <button className="media-popup-close" onClick={closeMediaPopup} aria-label="Close">&times;</button>
            {popupMedia.title && (
              <div className="media-popup-title">{popupMedia.title}</div>
            )}
            {popupMedia.type === 'image' && (
              <img src={popupMedia.src} alt={popupMedia.title || ""} className="media-popup-img" />
            )}
            {popupMedia.type === 'video' && (
              <video src={popupMedia.src} controls autoPlay className="media-popup-video" />
            )}
          </div>
        </div>
      )}

      <div className="app-container">
        <div className="app">
          <div className="alerts-container">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert ${alert.type}`}>
                {alert.message}
                <button 
                  onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="close-alert"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Only keep the empty post modal if needed */}
          {showEmptyPostModal && (
            <div className="modal-root">
              <div className="modal-overlay" onClick={() => setShowEmptyPostModal(false)} />
              <div className="empty-post-modal" onClick={e => e.stopPropagation()}>
                <p>Post must contain either content, image, or video</p>
                <button onClick={() => setShowEmptyPostModal(false)}>OK</button>
              </div>
            </div>
          )}

          <header className="app-header">
            <h1>Social Media App</h1>
            <UserProfile user={user} onUpdate={handleUserUpdate} />
          </header>

          <main className="app-main">
            <button 
              className="bulk-toggle-btn"
              onClick={() => setShowBulkUpload(!showBulkUpload)}
            >
              {showBulkUpload ? 'Hide Bulk Upload' : 'Bulk Upload Posts'}
            </button>

            {showBulkUpload && <BulkUpload onBulkCreate={handleBulkCreate} />}

            <PostForm 
              onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
              initialData={editingPost}
              onCancel={() => setEditingPost(null)}
            />

            <div className="posts-container">
              {posts.map(post => (
                <Post
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onEdit={handleUpdatePost}
                  onDelete={handleDeletePost}
                  onLike={handleLikePost}
                  onShare={handleSharePost}
                  onAddComment={handleAddComment}
                  onUpdateComment={handleUpdateComment}
                  onDeleteComment={handleDeleteComment}
                  onLikeComment={handleLikeComment}
                  onMediaPopup={handleMediaPopup}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}