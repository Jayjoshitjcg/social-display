import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from "@iconify/react";
import Cookies from 'js-cookie';
import { gapi } from "gapi-script";

const SocialMediaSelection = () => {

  const location = useLocation()
  const navigate = useNavigate()

  const { user, userPages, mediaItem, setUser, setAccessToken, setUserPages } = useContext(AppContext)

  const [logedInUser, setLogedInUser] = useState()

  useEffect(() => {
    const storedUser = localStorage.getItem("LOGIN_USER");
    setLogedInUser(storedUser ? JSON.parse(storedUser) : {});
    // console.log("Logged in User====>>>>", logedInUser);
  }, [])

  // Meta/Insta
  const CONFIGURATION_ID = "1839322333474319";


  // Function to decode JWT and extract user data
  const extractUserDataFromJWT = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    return {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
  };


  const authenticate = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();

      // Check if the user is not signed in, and initiate sign-in if needed
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      // Get the authenticated user's details
      const authResponse = authInstance.currentUser.get().getAuthResponse();

      // Log success message with authResponse
      // console.log("User authenticated successfully:", authResponse);
      const jwt_Token = authResponse?.id_token;
      console.log("Google JWT Token:", authResponse)

      const extractedUserData = extractUserDataFromJWT(jwt_Token);
      console.log("User Data::", extractedUserData);
      setUser({ ...extractedUserData, accessToken: authResponse?.access_token })
      localStorage.setItem(
        "LOGIN_USER",
        JSON.stringify({
          userEmail: extractedUserData?.email,
          userName: extractedUserData?.name,

        })
      );

      return authResponse;
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };


  const fetchLinkedYouTubeAccounts = async () => {
    try {
      const response = await gapi.client.youtube.channels.list({
        part: "snippet,contentDetails",
        mine: true, // Retrieves channels owned by the authenticated user
      });

      if (response.result.items && response.result.items.length > 0) {
        const channels = response.result.items;
        console.log("Linked YouTube Accounts:", channels);
        return channels;
      } else {
        console.log("No channels found for this account");
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch linked YouTube accounts:", error);
      throw error; // Re-throw the error for further handling
    }
  };


  const handleYoutubeShorts = async () => {
    if (mediaItem) {
      if (mediaItem.type !== 'video') {
        alert("The selected media is not a video. Please select a video file.");
        return;
      }
      await authenticate();
      const linkedAccounts = await fetchLinkedYouTubeAccounts();
      const allChennals = linkedAccounts?.map((account) => ({
        id: account?.id,
        name: account?.snippet?.localized?.title,
        accessToken: account?.etag,
        picture: account?.snippet?.thumbnails?.default?.url,
        type: "Youtube"
      }))
      setUserPages(allChennals || []);
      navigate("/postpage");
    }
  }


  const handleFacebookLogin = () => {
    if (!logedInUser) {
      navigate("/postpage");
    } else {
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
                    // Add type "Facebook" to each page
                    console.log("response in fetchall pages==>", response.data)
                    const allPages = response.data.map((page) => ({
                      id: page?.id,
                      name: page?.name,
                      accessToken: page?.access_token,
                      picture: page?.picture,
                      type: "Facebook", // Add type field
                    }));

                    // Filter out pages already in localStorage
                    const storedPages = JSON.parse(localStorage.getItem("USER_PAGES")) || [];
                    const newPages = [
                      ...storedPages,
                      ...allPages.filter((page) => !storedPages.some((storedPage) => storedPage.id === page.id)),
                    ];

                    // Store only new pages
                    setUserPages(newPages);
                    localStorage.setItem("USER_PAGES", JSON.stringify(newPages));

                    // Check for more pages using pagination
                    if (response.paging && response.paging.next) {
                      fetchAllPages(response.paging.next, allPages);
                    } else if (allPages.length === 0) {
                      console.log("No pages found for this user.");
                    }
                  } else {
                    console.error("Error fetching user's pages:", response);
                  }
                });
              };

              navigate("/postpage");
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
    }
  };

  const handleInstagramLogin = () => {
    if (!logedInUser) {
      navigate("/postpage");
    } else {
      if (window.FB) {
        // Initiate Facebook Login for Instagram
        window.FB.login(
          (response) => {
            if (response.authResponse) {
              const { accessToken } = response.authResponse;

              // Fetch user info
              window.FB.api("/me", { fields: "id,name,email, picture" }, (userData) => {
                setUser(userData);
                setAccessToken(accessToken);

                // Fetch Instagram Business Accounts linked to Facebook Pages
                fetchInstagramPages(accessToken);
              });

              const fetchInstagramPages = (accessToken) => {
                window.FB.api(
                  "/me/accounts",
                  { fields: "id,name,instagram_business_account,access_token,picture" },
                  (response) => {
                    if (response && response.data) {
                      const pagesWithInstagram = response.data.filter(
                        (page) => page.instagram_business_account
                      );
                      // console.log("pagesWithInstagram==>", pagesWithInstagram)
                      const instagramPages = pagesWithInstagram.map((page) => ({
                        id: page.instagram_business_account.id,
                        name: page.name,
                        accessToken: page.access_token,
                        picture: page?.picture,
                        type: "Instagram", // Add the type field as "Instagram"
                      }));



                      // Filter out Instagram pages already in localStorage
                      const storedPages = JSON.parse(localStorage.getItem("USER_PAGES")) || [];
                      const newPages = [
                        ...storedPages,
                        ...instagramPages.filter((page) => !storedPages.some((storedPage) => storedPage.id === page.id)),
                      ];

                      // Store only new Instagram pages
                      localStorage.setItem("USER_PAGES", JSON.stringify(newPages));
                      setUserPages(newPages);
                    } else {
                      console.error("Error fetching Instagram pages:", response);
                    }
                  }
                );
              };

              navigate("/postpage");
            } else {
              console.error("Instagram login failed:", response);
              alert("Login failed. Please try again.");
            }
          },
          {
            scope: "instagram_basic,instagram_manage_insights,pages_show_list,pages_manage_metadata,pages_read_engagement,instagram_content_publish",
            auth_type: "rerequest",
          }
        );
      }
    }
  };





  return (
    <div>
      <div className={`flex gap-6 w-full justify-start px-[20%] py-10`}>
        <div className="w-[50%] p-4 h-[100%]">
          <div className="flex flex-col w-[20rem]">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 mr-4" />
              <div>
                <div className='w-[15rem] h-[1rem] mb-2 rounded-sm bg-gray-300' />
                <div className='w-[10rem] h-[1rem] rounded-sm bg-gray-300' />
              </div>
            </div>

            <div className="flex flex-wrap justify-start gap-5 mt-10">
              <div onClick={handleFacebookLogin} className="w-auto h-12 flex items-center gap-2 rounded-lg border-[1px] border-gray-400 hover:border-blue-500 mr-4 px-4 cursor-pointer">
                <Icon icon="logos:facebook" />
                <span>Facebook</span>
              </div>
              <div onClick={handleInstagramLogin} className="w-auto h-12 flex items-center gap-2 rounded-lg border-[1px] border-gray-400 hover:border-pink-400 mr-4 px-4 cursor-pointer">
                <Icon icon="skill-icons:instagram" />
                <span>Instagram</span>
              </div>
              <div onClick={handleYoutubeShorts} className="w-auto h-12 flex items-center gap-2 rounded-lg border-[1px] border-gray-400 hover:border-red-400 mr-4 px-4 cursor-pointer">
                <Icon icon="logos:youtube-icon" />
                <span>Youtube Shorts</span>
              </div>
            </div>

          </div>
        </div>

        <div className="w-[50%] max-w-xl bg-white border-l rounded-lg shadow-md p-6 relative">
          {/* Facebook Post Skeleton */}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-4" />
            <div>
              <div className='w-[15rem] h-[1rem] mb-2 rounded-sm bg-gray-300' />
              <div className='w-[10rem] h-[1rem] rounded-sm bg-gray-300' />
            </div>
          </div>

          {/* Media Content */}
          <div className="w-full h-[full] bg-gray-100 rounded-lg overflow-hidden">
            {mediaItem?.type === 'video' ? (
              <video
                src={mediaItem?.src}
                className="w-full h-full object-cover"
                autoPlay
                loop
              />
            ) : (
              <img
                src={mediaItem?.src}
                alt="Selected Media"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialMediaSelection
