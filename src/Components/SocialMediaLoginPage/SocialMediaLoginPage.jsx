import React, { useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { FaFacebook, FaInstagram, FaTwitter, FaGoogle, FaLinkedin, FaGithub } from 'react-icons/fa';
import FacebookLogin from 'react-facebook-login';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../Context/AppContext';

const SocialMediaLoginPage = () => {

    const { accessToken, setAccessToken, setUser } = useContext(AppContext)

    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const navigate = useNavigate()
    const location = useLocation(); // Correct usage of useLocation hook

    const handleLogin = (platform) => {
        setSelectedPlatform(platform);
    };

    //Facebook Login
    const handleFacebookResponse = (response) => {
        if (response?.accessToken) {
            setUser(response)
            setSelectedPlatform('Facebook');
            navigate(`/home`)

            setAccessToken(response?.accessToken)
            localStorage.setItem("LOGIN_USER", JSON.stringify({
                userEmail: response?.email,
                userName: response?.name
            }))
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

    const handleInstagramLogin = () => {
        const clientId = '1985482418624364';
        const redirectUri = `${window.location.origin}/instagram-callback`;
        const scope = 'instagram_basic, instagram_manage_insights, public_profile';

        const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

        window.open(authUrl, '_blank', 'width=600,height=700');
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className='flex flex-col items-center'>
                <div className='flex flex-col items-center justify-center mb-10'>
                    <h3 className='text-[1.5rem] mb-1 text-gray-700 font-bold'>This is the App that allows you to manage Your Facebook account without getting any distractions</h3>

                    <h2 className='text-gray-800'>So let's go!! and manage your Accout with Ease</h2>
                    <h1 className='text-[0.6rem] text-gray-800'>You can login with facebook credentials only to get access</h1>
                </div>
                <div className='flex items-center gap-5'>

                    <FacebookLogin
                        appId="1627558811169298"
                        autoLoad={false}
                        fields="id,name,email,picture,birthday,first_name,last_name,gender,link,locale,timezone,updated_time,verified"
                        callback={handleFacebookResponse}
                        // scope="pages_manage_posts,pages_read_engagement"
                        scope="publish_to_groups,publish_pages,user_photos,user_likes"
                        render={(renderProps) => (
                            <div onClick={renderProps.onClick}>
                                <FaFacebook className="text-3xl mb-2" />
                                <span className="text-xs font-medium">Facebook</span>
                            </div>
                        )}
                    />

                    {/* Instagram Login */}
                    <div onClick={handleInstagramLogin} className="flex flex-col items-center bg-pink-400 text-white cursor-pointer rounded-lg p-2">
                        <FaInstagram className="text-4xl text-white" />
                        <span>Instagram</span>
                    </div>

                    {/*<div
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
        </div >
    );
};

export default SocialMediaLoginPage;
