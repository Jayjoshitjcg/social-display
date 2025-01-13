// Feed.js
import React, { useEffect, useContext } from 'react';
import Post from './Post';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../../Context/AppContext';
import { AppUtils } from '../../../AppUtils/Utils';

const Feed = () => {

    const { posts, setPosts, user } = useContext(AppContext)

    console.table(posts)

    const accessToken = AppUtils.getCookie('accessToken')

    const navigate = useNavigate()

    const fetchPageData = (userAccessToken) => {
        // Fetch the data the user manages
        fetch(`https://graph.facebook.com/me/photos?type=uploaded&fields=picture,images,created_time,name,likes.summary(true)&access_token=${userAccessToken}`)
            .then((res) => res.json())
            .then((data) => {
                if (data?.data && data?.data?.length > 0) {
                    // Extract posts with likes summary
                    const postsWithLikes = data.data.map(post => ({
                        ...post,
                        likes: post.likes?.summary?.total_count || 0 // Default to 0 if likes are undefined
                    }));
                    setPosts(postsWithLikes);
                }
            })
            .catch((error) => console.error('Error fetching pages:', error));
    };

    useEffect(() => {
        fetchPageData(accessToken);
    }, [accessToken, setPosts])

    const handleNewPost = () => {
        navigate(`/create-post`)
    }

    return (
        <div className="h-[100dvh] scroll-auto max-w-2xl mx-auto p-4">
            <div>
                <p className='text-center text-[1.5rem] font-bold text-gray-800 mb-8' >Your Feed</p>
            </div>
            <div>
                <p
                    onClick={handleNewPost}
                    className='text-right text-[1rem] text-decoration-line: underline cursor-pointer text-gray-800 hover:text-blue-700 mb-8'
                >
                    Make a new Post
                </p>
            </div>
            {posts?.map(post => (
                <Post key={post?.id} post={post} />
            ))}

        </div>
    );
};

export default Feed;
