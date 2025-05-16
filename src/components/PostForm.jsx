import { useState, useEffect } from 'react';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';

export default function PostForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    content: '',
    imageUrl: '',
    videoUrl: ''
  });
  const [showMediaInputs, setShowMediaInputs] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        content: initialData.content || '',
        imageUrl: initialData.imageUrl || '',
        videoUrl: initialData.videoUrl || ''
      });
      if (initialData.imageUrl || initialData.videoUrl) {
        setShowMediaInputs(true);
      }
    } else {
      setFormData({ content: '', imageUrl: '', videoUrl: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.content.trim() && !formData.imageUrl && !formData.videoUrl) {
      setValidationError('Post must contain content, image, or video');
      return;
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      setValidationError('Please enter a valid image URL');
      return;
    }

    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      setValidationError('Please enter a valid video URL');
      return;
    }

    const success = await onSubmit(
      initialData
        ? { ...initialData, ...formData }
        : {
            ...formData,
            imageUrl: formData.imageUrl || null,
            videoUrl: formData.videoUrl || null
          }
    );

    if (success && !initialData) {
      setFormData({ content: '', imageUrl: '', videoUrl: '' });
      setShowMediaInputs(false);
    }
  };

  const clearMedia = (type) => {
    setFormData(prev => ({ ...prev, [type]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {validationError && (
        <div className="validation-error-message">
          {validationError}
        </div>
      )}
      
      <textarea
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder="What's on your mind?"
      />

      <div className="media-buttons">
        <button 
          type="button" 
          onClick={() => setShowMediaInputs(!showMediaInputs)}
          className={`media-button ${showMediaInputs ? 'active' : ''}`}
        >
          <FaImage /> Media
        </button>
      </div>

      {showMediaInputs && (
        <div className="media-inputs">
          {formData.imageUrl && (
            <div className="media-preview">
              <img src={formData.imageUrl} alt="Preview" className="preview-image" />
              <button 
                type="button" 
                onClick={() => clearMedia('imageUrl')}
                className="clear-media-btn"
              >
                <FaTimes />
              </button>
            </div>
          )}
          {formData.videoUrl && (
            <div className="media-preview">
              <video src={formData.videoUrl} controls className="preview-video" />
              <button 
                type="button" 
                onClick={() => clearMedia('videoUrl')}
                className="clear-media-btn"
              >
                <FaTimes />
              </button>
            </div>
          )}
          {(!formData.imageUrl && !formData.videoUrl) && (
            <>
              <div className="media-input-group">
                <FaImage className="media-icon" />
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="Image URL OPTIONAL"
                />
              </div>
              <div className="media-input-group">
                <FaVideo className="media-icon" />
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="Video URL OPTIONAL"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="form-actions">
        {initialData && (
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        )}
        <button type="submit" className="submit-btn">
          {initialData ? 'Update' : 'Post'}
        </button>
      </div>
    </form>
  );
}