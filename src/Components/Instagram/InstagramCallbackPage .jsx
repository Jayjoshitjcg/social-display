import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../Context/AppContext';

const InstagramCallbackPage = () => {
    const navigate = useNavigate();
    const { setInstaAccessToken, instaAccessToken } = useContext(AppContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccessToken = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                console.log("Code===>", code)
                try {
                    console.log("<======Inside Try block======>")
                    const clientId = '1985482418624364';
                    const clientSecret = '4398a6f0dcb857ab8ecc766206e019ef';
                    const redirectUri = `${window.location.origin}/instagram-callback`;

                    const response = await fetch('https://graph.facebook.com/v17.0/oauth/access_token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, code }),
                    });

                    console.log("response ====>", response)
                    const data = await response.json();
                    if (data.access_token) {
                        setInstaAccessToken(data.access_token);
                        navigate('/home');
                    } else {
                        console.error('Failed to fetch access token', data);
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Error fetching Instagram access token', error);
                    navigate('/');
                }
            } else {
                navigate('/');
            }

            setLoading(false);
        };

        fetchAccessToken();
    }, [navigate, setInstaAccessToken]);

    return loading ? <div>Loading...</div> : null;
};

export default InstagramCallbackPage;
