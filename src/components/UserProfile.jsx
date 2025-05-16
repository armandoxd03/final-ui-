import { useState } from 'react';

export default function UserProfile({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    userImageUrl: user.userImageUrl
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="user-profile">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="user-profile-form">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Username"
          />
          <input
            type="url"
            name="userImageUrl"
            value={formData.userImageUrl}
            onChange={handleChange}
            required
            placeholder="Profile Image URL"
          />
          <div className="user-profile-form-actions">
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="edit-btn">
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-display" onClick={() => setIsEditing(true)}>
          <img 
            src={user.userImageUrl} 
            alt={user.username} 
            className="profile-pic"
          />
          <span className="username">{user.username}</span>
        </div>
      )}
    </div>
  );
}