import React, { useContext, useState } from 'react';
import Cookies from 'js-cookie';
import { FaFacebook, FaInstagram, FaTwitter, FaGoogle, FaLinkedin, FaGithub } from 'react-icons/fa';
import FacebookLogin from 'react-facebook-login';
import { InstagramLogin } from '@amraneze/react-instagram-login';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../Context/AppContext';

const SocialMediaLoginPage = () => {

    const { accessToken, setAccessToken, setUser } = useContext(AppContext)

    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const navigate = useNavigate()

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

    //Instagram Login

    const instagramClientId = '1557520368213094'; // Replace with your actual Instagram client ID
    const redirectUri = 'http://localhost:3000/'; // Replace with your actual redirect URI
    const scope = 'user_profile,user_media'; // Define the permissions you need


    const handleInstagramLogin = () => {
        const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramClientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

        window.location.href = instagramAuthUrl; // Redirect to Instagram login page
    };

    const handleInstagramResponse = async (code) => {
        // Exchange the code for an access token
        const tokenUrl = 'https://api.instagram.com/oauth/access_token';
        const params = new URLSearchParams();
        params.append('client_id', instagramClientId);
        params.append('client_secret', 'ae92d64d6eb6e891d5a3a0a27fe0b6cb'); // Replace with your client secret
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', redirectUri);
        params.append('code', code);

        const response = await fetch(tokenUrl, {
            method: 'POST',
            body: params,
        });

        const data = await response.json();
        if (data.access_token) {
            setAccessToken(data.access_token);
            setUser(data); // You can store user data as per your requirement
            navigate('/home');
        } else {
            console.error('Instagram login failed', data);
        }
    };

    const getUrlParameter = (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };

    // Handle the Instagram response after redirect
    React.useEffect(() => {
        const code = getUrlParameter('code');
        if (code) {
            handleInstagramResponse(code);
        }
    }, []);

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
                        scope="publish_to_groups,publish_pages,user_photos, user_likes"
                        render={(renderProps) => (
                            <div onClick={renderProps.onClick}>
                                <FaFacebook className="text-3xl mb-2" />
                                <span className="text-xs font-medium">Facebook</span>
                            </div>
                        )}
                    />

                    <div
                        onClick={handleInstagramLogin}
                        className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl cursor-pointer transform transition-all hover:scale-105 bg-pink-500 text-white ${selectedPlatform === 'Instagram' ? 'ring-4 ring-offset-2 ring-blue-300' : ''
                            }`}
                    >
                        <FaInstagram className="text-3xl mb-2" />
                        <span className="text-xs font-medium">Instagram</span>
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
