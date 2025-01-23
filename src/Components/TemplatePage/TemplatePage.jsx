import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../Context/AppContext';

const template1 = require(`../../Assets/images/Template-1.jpg`);
const template2 = require(`../../Assets/images/Template-2.jpg`);
const template3 = require(`../../Assets/images/Template-3.jpg`);
const template4 = require(`../../Assets/images/Template-4.jpg`);
const template5 = require(`../../Assets/images/Template-5.jpg`);
const template6 = require(`../../Assets/images/Template-6.jpg`);
const template7 = require(`../../Assets/images/Template-7.jpg`);
const templateVideo1 = require(`../../Assets/images/Template-video1.mp4`);
const templateVideo2 = require(`../../Assets/images/Template-video2.mp4`);

const TemplatePage = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const navigate = useNavigate();
    const { setMediaItem } = useContext(AppContext)

    useEffect(() => {
        const fetchMediaItems = async () => {
            const images = [
                { id: 1, src: template1, type: 'image' },
                { id: 2, src: template2, type: 'image' },
                { id: 3, src: template3, type: 'image' },
                { id: 4, src: template4, type: 'image' },
                { id: 5, src: template5, type: 'image' },
                { id: 6, src: template6, type: 'image' },
                { id: 7, src: template7, type: 'image' },
            ];

            const videos = [
                { id: 'v1', src: templateVideo1, type: 'video' },
                { id: "v2", src: templateVideo2, type: 'video' },
            ];

            setMediaItems([...images, ...videos]);
        };

        fetchMediaItems();
    }, []);
    // Handle click on an image or video
    const handleMediaClick = (mediaItem) => {
        setMediaItem(mediaItem)
        navigate('/socialmedia');
    };

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
            {/* Post Button in the top-right corner */}
            <button className="absolute top-5 right-10 px-5 py-3 text-white bg-blue-500 rounded-md hover:bg-blue-600">
                Post
            </button>

            {/* Centered template text */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold">Choose a Template</h1>
            </div>

            {/* Masonry layout for images and videos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full p-5 overflow-auto">
                {mediaItems?.map((item, index) => (
                    <div
                        key={index}
                        className="relative flex justify-center items-center cursor-pointer"
                        onClick={() => handleMediaClick(item)}
                    >
                        {item?.type === 'video' ? (
                            <video
                                src={item?.src}
                                className="w-full h-auto object-cover rounded-lg shadow-lg"
                                autoPlay
                                loop
                            />
                        ) : (
                            <img
                                src={item?.src}
                                alt={`media-${index}`}
                                className="w-[25rem] h-auto object-cover rounded-lg shadow-lg"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplatePage;
