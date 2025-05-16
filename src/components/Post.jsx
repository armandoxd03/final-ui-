import { useState } from 'react';
import { FaThumbsUp, FaShare, FaEdit, FaTrash, FaComment } from 'react-icons/fa';

// Helper functions for extracting video IDs
const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const extractVimeoId = (url) => {
  const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const renderVideoPlayer = (url) => {
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return (
      <div className="video-container">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="embedded-video"
          title="YouTube video player"
        />
      </div>
    );
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return (
      <div className="video-container">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="embedded-video"
          title="Vimeo video player"
        />
      </div>
    );
  }

  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <video controls className="embedded-video">
        <source src={url} type={`video/${url.split('.').pop()}`} />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div className="video-fallback">
      <p>This video platform doesn't support direct embedding</p>
      <a href={url} target="_blank" rel="noopener noreferrer">
        Watch on original site
      </a>
    </div>
  );
};

export default function Post({ 
  post, 
  currentUser,
  onEdit, 
  onDelete, 
  onLike, 
  onShare,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onLikeComment,
  onMediaPopup
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    id: post.id,
    content: post.content,
    username: post.username,
    userImageUrl: post.userImageUrl,
    imageUrl: post.imageUrl,
    videoUrl: post.videoUrl
  });
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [mediaError, setMediaError] = useState('');

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (editData.imageUrl && editData.videoUrl) {
      setMediaError('Please choose either image or video, not both');
      return;
    }
    
    setMediaError('');
    const success = await onEdit(editData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleAddCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const success = await onAddComment(post.id, newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleUpdateCommentSubmit = async (commentId, content) => {
    const success = await onUpdateComment(post.id, commentId, content);
    if (success) {
      setEditingCommentId(null);
    }
  };

  return (
    <div className="post">
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="post-edit-form">
          <div className="form-group">
            <label htmlFor="edit-username">Username:</label>
            <input
              id="edit-username"
              type="text"
              name="username"
              value={editData.username}
              onChange={handleEditChange}
              required
              className="username-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-image-url">Profile Image URL:</label>
            <input
              id="edit-image-url"
              type="url"
              name="userImageUrl"
              value={editData.userImageUrl}
              onChange={handleEditChange}
              required
              className="image-url-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-content">Post Content:</label>
            <textarea
              id="edit-content"
              name="content"
              value={editData.content}
              onChange={handleEditChange}
              rows="4"
              placeholder="Post content (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-post-image">Image URL:</label>
            <input
              id="edit-post-image"
              type="url"
              name="imageUrl"
              value={editData.imageUrl || ''}
              onChange={handleEditChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-post-video">Video URL:</label>
            <input
              id="edit-post-video"
              type="url"
              name="videoUrl"
              value={editData.videoUrl || ''}
              onChange={handleEditChange}
              placeholder="YouTube, Vimeo, or direct video link"
            />
          </div>

          {mediaError && <div className="error-message">{mediaError}</div>}

          <div className="post-edit-actions">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="post-header">
            <img src={post.userImageUrl} alt={post.username} className="post-profile-pic" />
            <span className="post-username">{post.username}</span>
          </div>
          <div className="post-content">
            {post.content}
            {(post.imageUrl || post.videoUrl) && (
              <div className="post-embedded-media">
                {post.imageUrl && (
                  <div className="embedded-media-block">
                    {post.imageTitle && (
                      <div className="embedded-media-title">{post.imageTitle}</div>
                    )}
                    <img
                      src={post.imageUrl}
                      alt={post.imageTitle || ""}
                      className="embedded-media-img"
                      style={{ cursor: "pointer" }}
                      onClick={() => onMediaPopup && onMediaPopup('image', post.imageUrl, post.imageTitle)}
                    />
                  </div>
                )}
                {post.videoUrl && (
                  <div className="embedded-media-block">
                    {post.videoTitle && (
                      <div className="embedded-media-title">{post.videoTitle}</div>
                    )}
                    {renderVideoPlayer(post.videoUrl)}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Updated section - always show edit/delete buttons */}
          <div className="post-actions">
            <button 
              onClick={() => {
                setEditData({
                  id: post.id,
                  content: post.content,
                  username: post.username,
                  userImageUrl: post.userImageUrl,
                  imageUrl: post.imageUrl,
                  videoUrl: post.videoUrl
                });
                setIsEditing(true);
              }} 
              className="edit-btn"
            >
              <FaEdit /> Edit
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="delete-btn">
              <FaTrash /> Delete
            </button>
          </div>
          
          <div className="post-stats">
            <button className="like-btn" onClick={() => onLike(post.id)}>
              <FaThumbsUp /> {post.likeCount > 0 && post.likeCount}
            </button>
            <button className="share-btn" onClick={() => onShare(post.id)}>
              <FaShare /> {post.shareCount > 0 && post.shareCount}
            </button>
            <button 
              className="comment-btn" 
              onClick={() => setShowComments(!showComments)}
            >
              <FaComment /> {post.comments?.length || 0}
            </button>
          </div>
        </>
      )}

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleAddCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="2"
              required
            />
            <button type="submit" className="comment-submit-btn">Post Comment</button>
          </form>

          <div className="comments-list">
            {post.comments?.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <img 
                    src={comment.userImageUrl} 
                    alt={comment.username} 
                    className="comment-profile-pic"
                  />
                  <span className="comment-username">{comment.username}</span>
                </div>
                
                {editingCommentId === comment.id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateCommentSubmit(comment.id, e.target.content.value);
                    }}
                    className="comment-edit-form"
                  >
                    <textarea
                      name="content"
                      defaultValue={comment.content}
                      required
                      rows="2"
                    />
                    <div className="comment-edit-actions">
                      <button type="submit" className="save-btn">Save</button>
                      <button type="button" onClick={() => setEditingCommentId(null)} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                      <button 
                        onClick={() => onLikeComment(post.id, comment.id)}
                        className="comment-like-btn"
                      >
                        <FaThumbsUp /> {comment.likeCount > 0 && comment.likeCount}
                      </button>
                      {comment.username === currentUser.username && (
                        <>
                          <button 
                            onClick={() => setEditingCommentId(comment.id)}
                            className="comment-edit-btn"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => onDeleteComment(post.id, comment.id)}
                            className="comment-delete-btn"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this post?</p>
            <div className="modal-actions">
              <button onClick={() => {
                onDelete(post.id);
                setShowDeleteModal(false);
              }}>Yes</button>
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}