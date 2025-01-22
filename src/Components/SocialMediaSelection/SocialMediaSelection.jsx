import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from "@iconify/react";
import Cookies from 'js-cookie';

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

  const CONFIGURATION_ID = "1839322333474319";

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
              <div onClick={handleFacebookLogin} className="w-[40%] h-12 flex items-center gap-2 rounded-lg border-[1px] border-gray-400 hover:border-blue-500 mr-4 px-4 cursor-pointer">
                <Icon icon="logos:facebook" />
                <span>Facebook</span>
              </div>
              <div onClick={handleInstagramLogin} className="w-[40%] h-12 flex items-center gap-2 rounded-lg border-[1px] border-gray-400 hover:border-pink-400 mr-4 px-4 cursor-pointer">
                <Icon icon="skill-icons:instagram" />
                <span>Instagram</span>
              </div>
              <div className="w-[40%] h-12 flex items-center gap-2 rounded-lg border-[1px] border-gray-400 hover:border-red-300 mr-4 px-4 cursor-pointer">
                <Icon icon="logos:youtube-icon" />
                <span>Youtube</span>
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
            {mediaItem?.src?.endsWith(".mp4") ? (
              <video
                src={mediaItem?.src}
                className="w-full h-full object-cover"
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
