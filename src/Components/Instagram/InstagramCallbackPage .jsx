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
                try {
                    const response = await fetch('http://localhost:5000/exchange-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code }),
                    });
                    console.log("Response==>", response)
                    const data = await response.json();
                    console.log("Data==>", data)
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
