import { useState } from 'react';

export default function BulkUpload({ onBulkCreate }) {
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });

  const sampleData = `[
  {
    "username": "gojo_sensei",
    "userImageUrl": "https://randomuser.me/api/portraits/men/10.jpg",
    "content": "gojo epic",
    "imageUrl": "https://m.media-amazon.com/images/I/71NnDjm816L._AC_UF1000,1000_QL80_.jpg",
    "videoUrl": null
  },
  {
    "username": "luffy_d_joyboy",
    "userImageUrl": "https://randomuser.me/api/portraits/men/20.jpg",
    "content": "one piece luffy yey",
    "imageUrl": "https://images.indianexpress.com/2024/10/One-Anime.jpg",
    "videoUrl": null
  }
]`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const postData = JSON.parse(jsonInput);
      const result = await onBulkCreate(postData);
      
      if (result.success) {
        setJsonInput(''); // Clear the input on success
      }
      
      setMessage({
        text: result.success ? `${result.data.length} posts created successfully!` : 'Failed to create posts',
        isError: !result.success
      });
      setTimeout(() => setMessage({ text: '', isError: false }), 3000);
    } catch (error) {
      setMessage({
        text: 'Invalid JSON format: ' + error.message,
        isError: true
      });
    }
  };

  const loadSample = () => {
    setJsonInput(sampleData);
  };

  const validateJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error('Input must be a JSON array');
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const isJsonValid = validateJson(jsonInput);

  return (
    <div className="bulk-upload">
      <h3>Bulk Create Posts</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`Paste JSON array of posts here...\n\nSample format:\n${sampleData}`}
          rows={10}
          className={jsonInput && !isJsonValid ? 'invalid' : ''}
        />
        {jsonInput && !isJsonValid && (
          <div className="validation-error">Invalid JSON format</div>
        )}
        <div className="bulk-actions">
          <button type="button" onClick={loadSample}>Load Sample</button>
          <button 
            type="submit" 
            disabled={!jsonInput || !isJsonValid}
          >
            Upload Posts
          </button>
        </div>
      </form>
      {message.text && (
        <div className={`message ${message.isError ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}