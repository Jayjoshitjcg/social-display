import React, { useContext, useState } from 'react';
import Cookies from 'js-cookie';
import { FaFacebook, FaInstagram, FaTwitter, FaGoogle, FaLinkedin, FaGithub } from 'react-icons/fa';
import SocialLogin from 'react-social-login';
import FacebookLogin from 'react-facebook-login';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../Context/AppContext';

const SocialMediaLoginPage = () => {

    const { accessToken, setAccessToken, setUser } = useContext(AppContext)

    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const navigate = useNavigate()

    const handleLogin = (platform) => {
        setSelectedPlatform(platform);
    };
    const handleFacebookResponse = (response) => {
        if (response?.accessToken) {
            // console.log('Facebook response===>', response);
            setUser(response)
            setSelectedPlatform('Facebook');
            navigate(`/home`)

            setAccessToken(response?.accessToken)

            // Store the accessToken in a cookie
            Cookies.set('accessToken', response.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
        }
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
            <div className="flex flex-col items-center justify-center space-x-4 p-4 pb-6">

                <div className='flex flex-col items-center justify-center mb-10'>
                    <h3 className='text-[1.5rem] mb-1 text-gray-700 font-bold'>This is the App that allows you to manage Your Facebook account without getting any distractions</h3>

                    <h2 className='text-gray-800'>So let's go!! and manage your Accout with Ease</h2>
                    <h1 className='text-[0.6rem] text-gray-800'>You can login with facebook credentials only to get access</h1>
                </div>

                <FacebookLogin
                    appId="1627558811169298"
                    autoLoad={false}
                    fields="id,name,email,picture,birthday,first_name,last_name,gender,link,locale,timezone,updated_time,verified"
                    callback={handleFacebookResponse}
                    // scope="pages_manage_posts,pages_read_engagement"
                    scope="user_photos, user_likes"
                    render={(renderProps) => (
                        <div onClick={renderProps.onClick}>
                            <FaFacebook className="text-3xl mb-2" />
                            <span className="text-xs font-medium">Facebook</span>
                        </div>
                    )}
                />

                {/* <div
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
                </div> */}
            </div>
        </div>
    );
};

export default SocialMediaLoginPage;
