// CreatePost.js
import React, { useState } from 'react';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setMediaType(file.type.includes('image') ? 'image' : 'video');
    }
  };

  const handlePost = () => {
    // Post the content here (API call)
    console.log('Post created with content:', content, 'and media:', media);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-2xl mx-auto mb-6">
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        placeholder="What's on your mind?" 
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg" 
      />
      <div className="flex items-center space-x-4">
        <input 
          type="file" 
          accept="image/*,video/*" 
          onChange={handleFileChange} 
          className="file:border-0 file:px-4 file:py-2 file:rounded-lg file:bg-blue-500 file:text-white" 
        />
        {media && (mediaType === 'image' ? (
          <img src={URL.createObjectURL(media)} alt="Post preview" className="w-32 h-32 object-cover rounded-lg" />
        ) : (
          <video controls className="w-32 h-32 rounded-lg">
            <source src={URL.createObjectURL(media)} />
          </video>
        ))}
      </div>
      <button 
        onClick={handlePost} 
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg w-full"
      >
        Post
      </button>
    </div>
  );
};

export default CreatePost;
