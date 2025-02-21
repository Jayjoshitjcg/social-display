import React, { useEffect, useContext } from 'react';
import { AppContext } from '../../Context/AppContext';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaFacebook } from 'react-icons/fa';

const HeaderComponent = () => {
    const navigate = useNavigate();
    const { user, setUser, setAccessToken, setUserPages } = useContext(AppContext);

    const CONFIGURATION_ID = "1839322333474319"; // Replace with your actual Configuration ID
    const AppId = "1144156470487645";

    useEffect(() => {
        if (window.FB && window.FB.__initialized) {
            console.log("Facebook SDK already initialized");
            return;
        }

        // Initialize Facebook SDK
        window.fbAsyncInit = () => {
            window.FB.init({
                appId: AppId, // Your App ID
                cookie: true, // Enable cookies
                xfbml: true, // Parse social plugins
                version: "v21.0", // API version
            });
            window.FB.__initialized = true;
            console.log("Facebook SDK initialized");
        };

        // Add Facebook SDK script if not already added
        const fbScriptId = "facebook-jssdk";
        if (!document.getElementById(fbScriptId)) {
            const script = document.createElement("script");
            script.id = fbScriptId;
            script.src = "https://connect.facebook.net/en_US/sdk.js";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }
    }, []); // Run only once


    const handleLogOut = () => {
        localStorage.removeItem("LOGIN_USER");
        setUser("");
        setAccessToken("");
        navigate("/");
    };

    const handleFacebookLogin = () => {
        if (window.FB) {
            window.FB.login(
                (response) => {
                    if (response.authResponse) {
                        const { accessToken } = response.authResponse;

                        // Fetch user info
                        window.FB.api("/me", { fields: "id,name,email,picture" }, (userData) => {
                            setUser(userData);
                            setAccessToken(accessToken);
                            localStorage.setItem(
                                "LOGIN_USER",
                                JSON.stringify({
                                    userEmail: userData.email,
                                    userName: userData.name,
                                })
                            );
                            Cookies.set("accessToken", accessToken, {
                                expires: 1,
                                secure: true,
                                sameSite: "strict",
                            });

                            // Fetch user's pages
                            fetchAllPages("/me/accounts");
                        });

                        const fetchAllPages = (url, pages = []) => {
                            window.FB.api(url, { fields: "access_token,id,name,email,picture" }, (response) => {
                                if (response && response.data) {
                                    const allPages = [...pages, ...response.data];

                                    // Fetch Instagram accounts for all pages
                                    const pagesWithInstagram = [];
                                    let completedRequests = 0;

                                    allPages.forEach((page) => {
                                        // Check if the page has an Instagram account linked
                                        fetchInstagramAccount(page, (instagramAccount) => {
                                            const pageWithType = {
                                                ...page,
                                                type: instagramAccount ? 'Instagram' : 'Facebook', // Add type based on Instagram account presence
                                                instagramAccount, // Add the Instagram account details if present
                                            };

                                            pagesWithInstagram.push(pageWithType);

                                            // Check if all requests are complete
                                            completedRequests++;
                                            if (completedRequests === allPages.length) {
                                                setUserPages(pagesWithInstagram);
                                            }
                                        });
                                    });

                                    // Check for more pages using pagination
                                    if (response.paging && response.paging.next) {
                                        fetchAllPages(response.paging.next, allPages);
                                    } else {
                                        if (allPages.length === 0) {
                                            console.log("No pages found for this user.");
                                        }
                                    }
                                } else {
                                    console.error("Error fetching user's pages:", response);
                                }
                            });
                        };

                        const fetchInstagramAccount = (page, callback) => {
                            window.FB.api(
                                `/${page.id}?fields=instagram_business_account`,
                                (response) => {
                                    if (response && response.instagram_business_account) {
                                        // If Instagram account exists, return the Instagram business account
                                        callback(response.instagram_business_account);
                                    } else {
                                        // No Instagram account linked, return null
                                        callback(null);
                                    }
                                }
                            );
                        };

                        navigate("/");
                    } else {
                        console.error("Facebook login failed:", response);
                        alert("Login failed. Please try again.");
                    }
                },
                {
                    scope: "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts",
                    auth_type: "rerequest",
                    configuration_id: CONFIGURATION_ID,
                }
            );
        }
    };

    return (
        <header className="w-[100%] flex justify-between p-4 bg-slate-900 text-white px-[10rem] sticky top-0 z-10">
            <div className="font-semibold text-[1.5rem]">
                {user?.name ? `Welcome, ${user?.name}` : "Social Display"}
            </div>
            <div>
                {user?.name ? (
                    <button
                        className="bg-transparent border-none text-white text-[1.5rem] font-medium hover:underline cursor-pointer"
                        onClick={handleLogOut}
                    >
                        Log out
                    </button>
                ) : (
                    <div
                        onClick={handleFacebookLogin}
                        aria-label="Login with Facebook"
                        className="cursor-pointer flex flex-col items-center"
                    >
                        {/* <FaFacebook className="text-3xl mb-2" />
                        <span className="text-xs font-medium">Facebook</span> */}
                    </div>
                )}
            </div>
        </header>
    );
};

export default HeaderComponent;
