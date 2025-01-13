// Post.js
import React, { useEffect, useState } from 'react';
const Post = ({ post }) => {
    const [likes, setLikes] = useState(0);

    // const { posts } = useContext(AppContext)

    const handleLike = () => {
        setLikes(likes + 1); // Simulate a like action
    };

    useEffect(() => {
        setLikes(post?.likes)
    }, [])

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center space-x-3">
                <div className="font-semibold text-xl">{post?.user}</div>
            </div>
            <div className="mt-2">
                <p>{post?.name ? post?.name : "Photo"}</p>
                <img src={post?.images?.[0]?.source} alt="Post media" className="w-full h-auto rounded-lg" />
                {post?.type === 'video' ? (
                    <video controls className="w-full h-auto rounded-lg">
                        <source src={post?.picture?.images[0]?.source} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : null}
            </div>
            <div className="flex justify-between mt-4 items-center">
                <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={handleLike}
                >
                    Like {likes}
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                    Share
                </button>
            </div>
        </div>
    );
};

export default Post;
