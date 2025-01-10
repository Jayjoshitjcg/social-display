import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaGoogle, FaLinkedin, FaGithub } from 'react-icons/fa';
import SocialLogin from 'react-social-login';
import FacebookLogin from 'react-facebook-login';

const SocialMediaLoginPage = () => {
    const [selectedPlatform, setSelectedPlatform] = useState(null);

    const handleLogin = (platform) => {
        setSelectedPlatform(platform);
        console.log(`Logging in with ${platform}`);
    };
    const handleFacebookResponse = (response) => {
        console.log('Facebook response:', response);
        if (response.accessToken) {
            setSelectedPlatform('Facebook');
            fetchPageData(response?.accessToken);
        }
    };

    const fetchPageData = (userAccessToken) => {
        // Fetch the pages the user manages
        fetch(`https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`)
            .then((res) => res?.json())
            .then((data) => {
                if (data?.data && data?.data?.length > 0) {
                    const page = data?.data[0];
                    const pageAccessToken = page?.access_token;
                    const pageId = page?.id;

                    // Post to the selected page
                    postToPage(pageAccessToken, pageId, 'Hello from my app!');
                }
            })
            .catch((error) => console.error('Error fetching pages:', error));
    };

    const postToPage = (pageAccessToken, pageId, message) => {
        // Post a message to the page
        fetch(`https://graph.facebook.com/${pageId}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                access_token: pageAccessToken,
            }),
        })
            .then((response) => response?.json())
            .then((data) => {
                console.log('Post Success:', data);
            })
            .catch((error) => console.error('Error posting to page:', error));
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="flex items-center justify-center space-x-4 p-4 pb-6">

                <FacebookLogin
                    appId="1627558811169298"
                    autoLoad={false}
                    fields="id,name,email,picture,birthday,first_name,last_name,gender,link,locale,timezone,updated_time,verified"
                    callback={handleFacebookResponse}
                    // scope="pages_manage_posts,pages_read_engagement"
                    render={(renderProps) => (
                        <div onClick={renderProps.onClick}>
                            <FaFacebook className="text-3xl mb-2" />
                            <span className="text-xs font-medium">Facebook</span>
                        </div>
                    )}
                />

                <div
                    onClick={() => handleLogin('Instagram')}
                    className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl cursor-pointer transform transition-all hover:scale-105 bg-pink-500 text-white ${selectedPlatform === 'Instagram' ? 'ring-4 ring-offset-2 ring-blue-300' : ''
                        }`}
                >
                    <FaInstagram className="text-3xl mb-2" />
                    <span className="text-xs font-medium">Instagram</span>
                </div>

                <div
                    onClick={() => handleLogin('Twitter')}
                    className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl cursor-pointer transform transition-all hover:scale-105 bg-blue-400 text-white ${selectedPlatform === 'Twitter' ? 'ring-4 ring-offset-2 ring-blue-300' : ''
                        }`}
                >
                    <FaTwitter className="text-3xl mb-2" />
                    <span className="text-xs font-medium">Twitter</span>
                </div>

                <div
                    onClick={() => handleLogin('Google')}
                    className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl cursor-pointer transform transition-all hover:scale-105 bg-red-500 text-white ${selectedPlatform === 'Google' ? 'ring-4 ring-offset-2 ring-blue-300' : ''
                        }`}
                >
                    <FaGoogle className="text-3xl mb-2" />
                    <span className="text-xs font-medium">Google</span>
                </div>

                <div
                    onClick={() => handleLogin('LinkedIn')}
                    className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl cursor-pointer transform transition-all hover:scale-105 bg-blue-700 text-white ${selectedPlatform === 'LinkedIn' ? 'ring-4 ring-offset-2 ring-blue-300' : ''
                        }`}
                >
                    <FaLinkedin className="text-3xl mb-2" />
                    <span className="text-xs font-medium">LinkedIn</span>
                </div>

                <div
                    onClick={() => handleLogin('GitHub')}
                    className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl cursor-pointer transform transition-all hover:scale-105 bg-gray-800 text-white ${selectedPlatform === 'GitHub' ? 'ring-4 ring-offset-2 ring-blue-300' : ''
                        }`}
                >
                    <FaGithub className="text-3xl mb-2" />
                    <span className="text-xs font-medium">GitHub</span>
                </div>
            </div>
        </div>
    );
};

export default SocialMediaLoginPage;
