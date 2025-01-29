//React Imports
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { Icon } from "@iconify/react";
import DatePicker from "react-datepicker";
import styled from "styled-components";
import "react-datepicker/dist/react-datepicker.css";
import { gapi } from "gapi-script";


const StyledDatePickerWrapper = styled.div`
  .custom-datepicker-width {
    width: 500px !important; /* Set your desired width */
  }

  /* Ensure the time selector fits inside the date picker */
  .custom-datepicker-width .react-datepicker__time-container {
    width: 120px !important; /* Adjust width as needed */
  }

  /* Optional: Center-align the time selector or make it responsive */
  .custom-datepicker-width .react-datepicker__time {
    max-width: 100%;
    margin: 0 auto;
  }
`;


const PostPage = () => {

    const navigate = useNavigate();
    const { user, userPages, setUserPages, mediaItem } = useContext(AppContext)

    const [showCaptionInput, setShowCaptionInput] = useState(false);
    const [captions, setCaptions] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [scheduledTime, setScheduledTime] = useState(null);
    const [isScheduling, setIsScheduling] = useState(null);


    useEffect(() => {
        const allPages = JSON.parse(localStorage.getItem("USER_PAGES")) || [];
        setUserPages((prevPages) => {
            // Ensure prevPages is an array before merging
            return Array.isArray(prevPages) ? [...prevPages, ...allPages] : allPages;
        });
    }, []);


    // console.log("user=========>", user)
    // console.log("userPages==>", userPages)
    // console.log("selectedAccounts==>", selectedAccounts)
    // console.log("Media Items==>", mediaItem)


    if (!mediaItem) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-xl">No media selected. Please go back and select an image or video.</p>
                <button
                    onClick={() => navigate("/")}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen flex mt-20 justify-center">
                <p className="text-2xl font-bold">Login to facebook to post</p>

            </div>
        )
    }

    const PostTypeSelector = ({ id, account, handleRadioChange }) => {
        const isBothChecked = account?.isPost && account?.isStory;

        return (
            <div className="flex items-center justify-center mb-4 bg-gray-300 rounded-lg p-2">
                <label className="mr-4">
                    <input
                        type="radio"
                        name={`postType-${id}`}
                        value="post"
                        checked={account?.isPost && !isBothChecked} // "Post" should only be checked if it's post and not both
                        onChange={() => handleRadioChange(account?.page?.id, "post")}
                        className="mr-2"
                    />
                    Post
                </label>
                <label className="mr-4">
                    <input
                        type="radio"
                        name={`postType-${id}`}
                        value="story"
                        checked={account?.isStory && !isBothChecked} // "Story" should only be checked if it's story and not both
                        onChange={() => handleRadioChange(account?.page?.id, "story")}
                        className="mr-2"
                    />
                    Story
                </label>
                <label>
                    <input
                        type="radio"
                        name={`postType-${id}`}
                        value="both"
                        checked={isBothChecked} // "Both" is checked when both is true
                        onChange={() => handleRadioChange(account?.page?.id, "both")}
                        className="mr-2"
                    />
                    Both
                </label>
            </div>
        );
    };

    const handleCheckboxChange = (page) => {
        setSelectedAccounts((prev) => {
            // Check if the page is already selected
            const isSelected = prev.some((account) => account?.page?.id === page?.id);

            if (isSelected) {
                // Remove the deselected page
                return prev.filter((account) => account?.page?.id !== page?.id);
            } else {
                // Add the newly selected page
                return [
                    ...prev,
                    {
                        page: page, // Save the whole page object
                        pagePlatformType: page?.type,
                        isPost: true,
                        isStory: false,
                    },
                ];
            }
        });
    };

    const handleRadioChange = (id, type) => {
        setSelectedAccounts((prevAccounts) =>
            prevAccounts.map((account) => {
                if (account?.page?.id === id) {
                    let updatedAccount = { ...account };

                    if (type === "post") {
                        updatedAccount = {
                            ...updatedAccount,
                            isPost: true,
                            isStory: false,
                        };
                    } else if (type === "story") {
                        updatedAccount = {
                            ...updatedAccount,
                            isPost: false,
                            isStory: true,
                        };
                    } else if (type === "both") {
                        updatedAccount = {
                            ...updatedAccount,
                            isPost: true,
                            isStory: true,
                        };
                    }

                    return updatedAccount;
                }
                return account;
            })
        );
    };

    const handleNextClick = () => {
        setShowCaptionInput(true);
    };

    const handlePublishClick = async () => {
        if (selectedAccounts.length === 0) {
            alert("Please select at least one page to publish.");
            return;
        }

        setLoading(true);

        for (const account of selectedAccounts) {
            const { page, pagePlatformType, isPost, isStory } = account;
            const pageId = page.id;

            const foundPage = userPages.find((p) => p.id === pageId);

            if (!foundPage) {
                console.error(`Page not found for ID: ${pageId}`);
                alert(`Cannot post to page with ID: ${pageId}`);
                setLoading(false);
                return;
            }

            const imageURL = `${window.location.origin}/images/${mediaItem.src}`;
            // console.log("Image URL:", imageURL);

            function uploadAndPublishVideo(videoUrl, caption, accessToken, pageId) {
                console.log(`Uploading video to Instagram page ${pageId}...`);

                window.FB.api(
                    `/${pageId}/media`,
                    "POST",
                    {
                        media_type: "REELS",
                        video_url: videoUrl,
                        caption: caption || "",
                        access_token: accessToken,
                    },
                    (mediaResponse) => {
                        if (mediaResponse && !mediaResponse.error) {
                            console.log("Video upload started:", mediaResponse);
                            const mediaId = mediaResponse.id;

                            // Wait for processing to complete
                            checkMediaStatusAndPublish(mediaId, accessToken, pageId);
                        } else {
                            console.error("Error uploading video:", mediaResponse.error);
                        }
                    }
                );
            }

            function checkMediaStatusAndPublish(mediaId, accessToken, pageId, attempt = 0) {
                setLoading(true)
                if (attempt > 20) {  // Increase max attempts to 20 (100 seconds max)
                    console.error("Max attempts reached. Media is not ready.");
                    alert("Failed to publish video. Please try again later.");
                    return;
                }

                setTimeout(() => {
                    console.log(`${attempt + 1}`);

                    window.FB.api(
                        `/${mediaId}?fields=status`,
                        "GET",
                        { access_token: accessToken },
                        (statusResponse) => {
                            console.log("Status Response:", statusResponse);

                            if (statusResponse && statusResponse.status && statusResponse.status.includes("Finished")) {
                                console.log("Media processing finished. Publishing now...");

                                window.FB.api(
                                    `/${pageId}/media_publish`,
                                    "POST",
                                    {
                                        creation_id: mediaId,
                                        access_token: accessToken,
                                    },
                                    (publishResponse) => {
                                        if (publishResponse && !publishResponse.error) {
                                            setLoading(false)
                                            // console.log(`Successfully posted video to Instagram page ${pageId}`);
                                            alert(`Successfully posted to Instagram ${pageId}`);
                                            navigate("/")
                                        } else {
                                            console.error("Error publishing video:", publishResponse.error);
                                        }
                                    }
                                );
                            } else {
                                // console.log("Media still processing, checking again in 5 seconds...");
                                checkMediaStatusAndPublish(mediaId, accessToken, pageId, attempt + 1);
                            }
                        }
                    );
                }, 5000);
            }


            if (foundPage && foundPage?.accessToken) {
                // If the platform is Facebook
                if (pagePlatformType === "Facebook") {
                    // Publish post if isPost is true or if both is true
                    if (isPost || (isPost && isStory)) {
                        if (mediaItem.type === "video") {
                            // Post a video to Facebook
                            window.FB.api(
                                `/${pageId}/videos`,
                                "POST",
                                {
                                    file_url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // URL of the video to post
                                    description: captions[account?.page?.id] || "", // Description/caption for the video
                                    access_token: foundPage.accessToken, // Page access token
                                },
                                (response) => {
                                    if (response && !response.error) {
                                        console.log(`Successfully posted video to page ${foundPage.name}`);
                                        alert(`Successfully posted video to ${foundPage.name}`);
                                        navigate("/");
                                    } else {
                                        console.error(
                                            `Error posting video to page ${foundPage.name}:`,
                                            response.error
                                        );
                                        alert(
                                            `Failed to post video to ${foundPage.name}. Please check the console for details.`
                                        );
                                    }
                                }
                            );
                        } else if (mediaItem.type === "image") {
                            // Post an image to Facebook
                            window.FB.api(
                                `/${pageId}/photos`,
                                "POST",
                                {
                                    url: "https://1roos.com/api/v1/uploads/user/1736913776159MUgI6mk2.jpg", // URL of the image to post
                                    caption: captions[account?.page?.id] || "", // Caption to post with the image
                                    access_token: foundPage.accessToken, // Page access token
                                },
                                (response) => {
                                    if (response && !response.error) {
                                        console.log(`Successfully posted image to page ${foundPage.name}`);
                                        alert(`Successfully posted image to ${foundPage.name}`);
                                        navigate("/");
                                    } else {
                                        console.error(
                                            `Error posting image to page ${foundPage.name}:`,
                                            response.error
                                        );
                                        alert(
                                            `Failed to post image to ${foundPage.name}. Please check the console for details.`
                                        );
                                    }
                                }
                            );
                        }
                    }


                    // Publish story if isStory is true or if both is true
                    if (isStory || (isPost && isStory)) {
                        // Step 1: Upload the photo
                        window.FB.api(
                            `/${pageId}/photos`,
                            "POST",
                            {
                                url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // URL of the photo to upload
                                access_token: foundPage.accessToken, // Page access token
                                published: false,
                            },
                            (uploadResponse) => {
                                if (uploadResponse && !uploadResponse.error) {
                                    console.log("Photo uploaded successfully:", uploadResponse);

                                    // Step 2: Use the photo_id to create a story
                                    const photoId = uploadResponse.id; // Extract the photo ID
                                    window.FB.api(
                                        `/${pageId}/photo_stories`,
                                        "POST",
                                        {
                                            photo_id: photoId, // Use the photo ID from the upload response
                                            access_token: foundPage.accessToken // Page access token
                                        },
                                        (storyResponse) => {
                                            if (storyResponse && !storyResponse.error) {
                                                console.log(`Successfully posted a story to page ${foundPage.name}`);
                                                alert(`Successfully posted a story to ${foundPage.name}`);
                                            } else {
                                                console.error(
                                                    `Error posting a story to page ${foundPage.name}:`,
                                                    storyResponse.error
                                                );
                                                alert(
                                                    `Failed to post a story to ${foundPage.name}. Please check the console for details.`
                                                );
                                            }
                                        }
                                    );
                                } else {
                                    console.error("Error uploading photo:", uploadResponse.error);
                                    alert("Failed to upload photo. Please check the console for details.");
                                }
                            }
                        );
                    }

                }

                // If the platform is Instagram
                else if (pagePlatformType === "Instagram") {
                    // Instagram post and story logic
                    if (isPost || (isPost && isStory)) {
                        console.log(`Posting to Instagram page ${foundPage.name} as post with ${foundPage.accessToken}`);

                        const mediaPayload = {
                            caption: captions[account?.page?.id] || "", // Caption to post with the media
                            access_token: foundPage.accessToken,
                        };

                        // Check if it's a video or image
                        if (mediaItem.type === "video") {
                            console.log("Posting a video (Reel) to Instagram");

                            uploadAndPublishVideo(
                                "https://1roos.com/videos/video-4.mp4",  // Replace with your video URL
                                captions[account?.page?.id] || "",
                                foundPage.accessToken,
                                foundPage.id
                            );
                        } else if (mediaItem.type === "image") {
                            console.log("Posting an image to Instagram");

                            window.FB.api(
                                `/${foundPage.id}/media`,
                                "POST",
                                {
                                    caption: captions[account?.page?.id] || "",
                                    media_type: "IMAGE",
                                    image_url: "https://cdn.menuonline.com/preview/mycircle-digital-signage-2/mycircle-user-media/61efe5065c01e6626a7b6d68/demo%20viral_31386379.jpeg",
                                    access_token: foundPage.accessToken,
                                },
                                (mediaResponse) => {
                                    if (mediaResponse && !mediaResponse.error) {
                                        console.log("Successfully created media container for image:", mediaResponse);

                                        setTimeout(() => {
                                            window.FB.api(
                                                `/${foundPage.id}/media_publish`,
                                                "POST",
                                                {
                                                    creation_id: mediaResponse.id,
                                                    access_token: foundPage.accessToken,
                                                },
                                                (publishResponse) => {
                                                    if (publishResponse && !publishResponse.error) {
                                                        console.log(`Successfully posted image to Instagram page ${foundPage.name}`);
                                                        alert(`Successfully posted image to Instagram ${foundPage.name}`);
                                                    } else {
                                                        console.error(`Error posting image to Instagram page ${foundPage.name}:`, publishResponse.error);
                                                        alert(`Failed to post image to Instagram ${foundPage.name}. Please check the console for details.`);
                                                    }
                                                }
                                            );
                                        }, 5000);
                                    } else {
                                        console.error("Error creating image media container for Instagram:", mediaResponse.error);
                                        alert("Failed to create image media container for Instagram. Please check the console for details.");
                                    }
                                }
                            );
                        }

                    }

                    if (isStory || (isPost && isStory)) {
                        console.log(`📢 Posting a story to Instagram page ${foundPage.name}`);

                        const mediaPayload = {
                            access_token: foundPage.accessToken,
                        };

                        // Function to check media status
                        function checkMediaStatus(mediaId, callback) {
                            const checkInterval = 5000; // Check every 5 seconds
                            const maxAttempts = 20; // Max retries (100 seconds)

                            let attempts = 0;

                            console.log(`🔄 Checking media processing status for ID: ${mediaId}`);

                            const interval = setInterval(() => {
                                attempts++;

                                window.FB.api(
                                    `/${mediaId}?fields=status`,
                                    "GET",
                                    { access_token: foundPage.accessToken },
                                    (statusResponse) => {
                                        if (!statusResponse) {
                                            console.error(`❌ [Attempt ${attempts}] Failed to fetch media status - No Response`);
                                        } else if (statusResponse.error) {
                                            console.error(`❌ [Attempt ${attempts}] API Error:`, statusResponse.error);
                                        } else if (statusResponse.status) {
                                            console.log(`📌 [Attempt ${attempts}] Media Status: "${statusResponse.status}"`);

                                            if (statusResponse.status.includes("Finished")) {
                                                clearInterval(interval);
                                                console.log(`✅ Media processing completed in ${attempts * 5} seconds`);
                                                callback(true); // ✅ Media is ready
                                                return;
                                            }
                                        }

                                        if (attempts >= maxAttempts) {
                                            clearInterval(interval);
                                            console.error(`❌ Timeout: Media not processed within ${maxAttempts * 5} seconds`);
                                            callback(false); // ❌ Timeout reached
                                        }
                                    }
                                );
                            }, checkInterval);
                        }

                        // Function to publish media
                        function publishMedia(mediaId) {
                            console.log(`🚀 Publishing media with ID: ${mediaId}`);

                            window.FB.api(
                                `/${foundPage.id}/media_publish`,
                                "POST",
                                {
                                    creation_id: mediaId,
                                    access_token: foundPage.accessToken,
                                },
                                (publishResponse) => {
                                    if (publishResponse && !publishResponse.error) {
                                        console.log(`✅ Successfully posted a story to ${foundPage.name}`);
                                        alert(`Successfully posted a story to ${foundPage.name}`);
                                    } else {
                                        console.error("❌ Error posting story:", publishResponse.error);
                                        alert("Failed to post story. Check the console.");
                                    }
                                }
                            );
                        }

                        // Check if media type is video or image
                        if (mediaItem.type === "video") {
                            console.log("🎥 Uploading video story to Instagram");

                            window.FB.api(
                                `/${foundPage.id}/media`,
                                "POST",
                                {
                                    ...mediaPayload,
                                    media_type: "STORIES",
                                    video_url: "https://1roos.com/videos/story-video.mp4", // ✅ Replace with your video URL
                                },
                                (mediaResponse) => {
                                    if (mediaResponse && !mediaResponse.error) {
                                        console.log("✅ Video media container created:", mediaResponse);

                                        // Poll the media status before publishing
                                        checkMediaStatus(mediaResponse.id, (isReady) => {
                                            if (isReady) {
                                                publishMedia(mediaResponse.id);
                                            } else {
                                                console.error("❌ Media processing timeout. Could not publish.");
                                                alert("Failed to publish story: media processing took too long.");
                                            }
                                        });
                                    } else {
                                        console.error("❌ Error creating story video media:", mediaResponse.error);
                                        alert("Failed to create story video. Check the console.");
                                    }
                                }
                            );
                        } else {
                            console.log("🖼️ Uploading image story to Instagram");

                            window.FB.api(
                                `/${foundPage.id}/media`,
                                "POST",
                                {
                                    ...mediaPayload,
                                    media_type: "STORIES",
                                    image_url: "https://1roos.com/api/v1/uploads/user/1736913776159MUgI6mk2.jpg", // ✅ Replace with your image URL
                                },
                                (mediaResponse) => {
                                    if (mediaResponse && !mediaResponse.error) {
                                        console.log("✅ Image media container created:", mediaResponse);

                                        // Poll the media status before publishing
                                        checkMediaStatus(mediaResponse.id, (isReady) => {
                                            if (isReady) {
                                                publishMedia(mediaResponse.id);
                                            } else {
                                                console.error("❌ Media processing timeout. Could not publish.");
                                                alert("Failed to publish story: media processing took too long.");
                                            }
                                        });
                                    } else {
                                        console.error("❌ Error creating story image media:", mediaResponse.error);
                                        alert("Failed to create story image. Check the console.");
                                    }
                                }
                            );
                        }
                    }

                }

                // If the platform is YouTube
                else if (pagePlatformType === "Youtube") {
                    gapi.client.setToken({ access_token: user?.accessToken });

                    try {
                        const metadata = {
                            snippet: {
                                title: "My YouTube Short",
                                description: "This is a short uploaded via the API",
                                tags: ["shorts", "test"], // Optional: Add tags
                                categoryId: "22", // Category ID for People & Blogs
                            },
                            status: {
                                privacyStatus: "public",
                            },
                        };

                        // Fetch the video file through the proxy server
                        // const videoFile = await fetch("http://localhost:5000/proxy/video")
                        //     .then((res) => {
                        //         if (!res.ok) {
                        //             throw new Error("Failed to fetch video file through proxy server");
                        //         }
                        //         return res.blob();
                        //     })
                        //     .catch((error) => {
                        //         throw new Error("Failed to fetch video file through proxy server");
                        //     });

                        const videoFile = await fetch(mediaItem?.src)
                            .then((res) => {
                                if (!res.ok) {
                                    throw new Error("Failed to fetch video file");
                                }
                                return res.blob(); // Convert response to Blob
                            })
                            .catch((error) => {
                                console.error("Error fetching video:", error);
                                throw new Error("Failed to fetch video file");
                            });

                        console.log("Video File==>", videoFile)

                        // Create a file object to use with gapi
                        const file = new File([videoFile], "Template-videoSmall.mp4", { type: "video/mp4" });
                        console.log("jay File==>", file)
                        console.log("jay metadata==>", metadata)

                        // Use gapi client library to insert the video
                        const request = gapi.client.youtube.videos.insert({
                            part: "snippet,status",
                            resource: metadata,
                            media: {
                                body: file,
                            },
                        });

                        // Execute the API request
                        request.execute((response) => {
                            if (response && response.id) {
                                console.log("Video uploaded successfully:", response.id);
                                alert(`Video successfully uploaded to YouTube channel ${foundPage.name}`);
                            } else {
                                console.error("Error uploading video:", response);
                                alert(`Failed to upload video to YouTube channel ${foundPage.name}`);
                            }
                        });
                    } catch (error) {
                        console.error("Error uploading video to YouTube:", error);
                        alert(`Error uploading video to YouTube channel ${foundPage.name}`);
                    }
                }

                setLoading(false);
            } else {
                console.error(`No access token found for page ${foundPage?.name || pageId}`);
                alert(`Cannot post to page ${foundPage?.name || pageId}`);
                setLoading(false);
            }
        }
    };


    const handleDateChange = (date) => {
        setScheduledTime(date);
        console.log("Scheduled time updated:", date);
    };

    const handleScheduleClick = () => {
        console.log("Scheduled Time:", scheduledTime); // Debugging log
        if (!scheduledTime || isNaN(new Date(scheduledTime).getTime())) {
            alert("Please select a valid scheduled time.");
            return;
        }

        if (selectedAccounts.length === 0) {
            alert("Please select at least one page to schedule.");
            return;
        }

        setLoading(true);

        // Calculate delay based on the scheduled time
        const delay = new Date(scheduledTime).getTime() - new Date().getTime();

        if (delay <= 0) {
            alert("Scheduled time must be in the future.");
            setLoading(false);
            return;
        }

        // Alert the user for the scheduled post
        selectedAccounts.forEach((account) => {
            alert(`Your post for ${account.page?.name} has been scheduled for ${new Date(scheduledTime).toLocaleString()}`);
            navigate('/')
        });

        // Schedule the publish logic for all accounts
        setTimeout(() => {
            selectedAccounts.forEach((account) => {
                const { page, pagePlatformType, isPost, isStory } = account;
                const pageId = page.id; // Accessing pageId from the page object
                const foundPage = userPages.find((p) => p.id === pageId);

                if (!foundPage) {
                    console.error(`Page not found for ID: ${pageId}`);
                    alert(`Cannot post to page with ID: ${pageId}`);
                    return;
                }

                const imageURL = `${window.location.origin}/images/${mediaItem.src}`;

                if (foundPage && foundPage?.accessToken) {
                    // Facebook post logic
                    if (pagePlatformType === "Facebook") {
                        if (isPost || (isPost && isStory)) {
                            window.FB.api(
                                `/${pageId}/photos`,
                                "POST",
                                {
                                    url: "https://1roos.com/api/v1/uploads/user/1736913776159MUgI6mk2.jpg", // URL of the image to post
                                    // url: imageURL,
                                    caption: captions[account?.page?.id] || "",
                                    access_token: foundPage.accessToken,
                                },
                                (response) => {
                                    if (response && !response.error) {
                                        console.log(`Successfully posted to page ${foundPage.name}`);
                                    } else {
                                        console.error(`Error posting to page ${foundPage.name}:`, response.error);
                                    }
                                }
                            );
                        }
                        if (isStory || (isPost && isStory)) {
                            window.FB.api(
                                `/${pageId}/photos`,
                                "POST",
                                {
                                    url: "https://1roos.com/api/v1/uploads/user/1736913776159MUgI6mk2.jpg", // URL of the photo to upload
                                    access_token: foundPage.accessToken, // Page access token
                                    published: false,
                                },
                                (uploadResponse) => {
                                    if (uploadResponse && !uploadResponse.error) {
                                        console.log("Photo uploaded successfully:", uploadResponse);

                                        // Step 2: Use the photo_id to create a story
                                        const photoId = uploadResponse.id; // Extract the photo ID
                                        window.FB.api(
                                            `/${pageId}/photo_stories`,
                                            "POST",
                                            {
                                                photo_id: photoId, // Use the photo ID from the upload response
                                                access_token: foundPage.accessToken, // Page access token
                                            },
                                            (storyResponse) => {
                                                if (storyResponse && !storyResponse.error) {
                                                    console.log(`Successfully posted a story to page ${foundPage.name}`);
                                                    alert(`Successfully posted a story to ${foundPage.name}`);
                                                } else {
                                                    console.error(
                                                        `Error posting a story to page ${foundPage.name}:`,
                                                        storyResponse.error
                                                    );
                                                    alert(
                                                        `Failed to post a story to ${foundPage.name}. Please check the console for details.`
                                                    );
                                                }
                                            }
                                        );
                                    } else {
                                        console.error("Error uploading photo:", uploadResponse.error);
                                        alert("Failed to upload photo. Please check the console for details.");
                                    }
                                }
                            );
                        }
                    }

                    // Instagram post logic
                    if (pagePlatformType === "Instagram") {
                        if (isPost || (isPost && isStory)) {
                            console.log(`Posting to Instagram page ${foundPage.name} as post.`);
                        }
                        if (isStory || (isPost && isStory)) {
                            console.log(`Posting to Instagram page ${foundPage.name} as story.`);
                        }
                    }
                } else {
                    console.error(`No access token found for page ${foundPage?.name || pageId}`);
                    alert(`Cannot post to page ${foundPage?.name || pageId}`);
                }
            });

            setLoading(false); // End loading state after the scheduled post
        }, delay);

        setIsScheduling(false);
        setLoading(false);
    };

    const handleCaptionChange = (e, accountId) => {
        // Update the caption for the specific account
        const updatedCaptions = { ...captions, [accountId]: e.target.value };
        setCaptions(updatedCaptions);
    };


    return (
        <div className="w-[full] pt-12">
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Header */}
            <div className="w-[100%] flex justify-between gap-5 pr-5">
                <div onClick={() => navigate(-1)} className="ml-10 text-[2rem] cursor-pointer">
                    <Icon icon="famicons:arrow-back" />
                </div>
                <div>
                    {
                        !showCaptionInput ?
                            <button
                                onClick={handleNextClick}
                                disabled={selectedAccounts.length === 0}
                                className={`px-6 py-3 text-white text-lg rounded-md ${selectedAccounts.length > 0
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Next
                            </button>
                            :
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-5">
                                    <div>
                                        {
                                            !isScheduling ?
                                                <button
                                                    onClick={() => setIsScheduling(!isScheduling)}
                                                    className="px-3 py-3.5 text-white bg-yellow-500 rounded-md"
                                                >
                                                    Schedule
                                                </button> :
                                                <button
                                                    onClick={handleScheduleClick}
                                                    className="px-3 py-3.5 text-white bg-yellow-500 rounded-md"
                                                >
                                                    Confirm Schedule
                                                </button>
                                        }
                                    </div>

                                    <button
                                        onClick={handlePublishClick}
                                        disabled={isScheduling}
                                        className={`px-6 py-3 text-white text-lg rounded-md ${isScheduling ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                            }`}
                                    >
                                        Publish
                                    </button>
                                </div>
                                {isScheduling && (
                                    <div className="flex gap-2">
                                        {/* DatePicker Component */}
                                        <StyledDatePickerWrapper>
                                            <DatePicker
                                                id="schedule-time"
                                                selected={scheduledTime}
                                                onChange={handleDateChange}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                dateFormat="yyyy/MM/dd h:mm aa"
                                                placeholderText="Select a date and time"
                                                className="border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-999"
                                                popperClassName="custom-datepicker-width" // Use custom class for the dialog
                                            />
                                        </StyledDatePickerWrapper>
                                        <p onClick={() => setIsScheduling(!isScheduling)} className="cursor-pointer">X</p>
                                    </div>
                                )}
                            </div>
                    }
                </div>
            </div>

            {
                !showCaptionInput ?
                    // {/* page Selection */}
                    <div>
                        <div className={`flex gap-6 w-full justify-start px-[20%] py-10`}>
                            <div className="w-[50%] p-4 h-[100%]">
                                <div className="flex flex-col justify-start w-[25rem] gap-4 ">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                                            <img src={user?.picture?.data?.url} alt="" className="rounded-full" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{user?.name}</p>
                                            <p className="text-sm text-gray-500">Just now</p>
                                        </div>
                                    </div>
                                    <ul className="flex flex-col items-start gap-4">
                                        {userPages?.map((page, index) => (
                                            <li key={`${page?.id}-${index}`} className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    id={`social-${page?.id}`}
                                                    checked={selectedAccounts.some((account) => account?.page?.id === page?.id)}
                                                    onChange={() => handleCheckboxChange(page)}
                                                />
                                                <label htmlFor={`social-${page?.id}`} className="text-lg">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                                                            {/* Ensure you're fetching the correct profile picture for Facebook or Instagram */}
                                                            {
                                                                page?.type === "Youtube"
                                                                    ?
                                                                    <img
                                                                        src={
                                                                            page?.picture || "default-profile-pic-url.jpg" // Fallback URL if no picture is available
                                                                        }
                                                                        alt={page?.name}
                                                                        className="rounded-full"
                                                                    />
                                                                    :
                                                                    <img
                                                                        src={
                                                                            page?.instagramAccount?.profile_picture_url ||
                                                                            page?.picture?.data?.url ||
                                                                            "default-profile-pic-url.jpg" // Fallback URL if no picture is available
                                                                        }
                                                                        alt={page?.name}
                                                                        className="rounded-full"
                                                                    />
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{page?.name}</p>
                                                            <p className="text-sm text-gray-500">{page?.type}</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="w-[50%] max-w-xl bg-white border-l rounded-lg shadow-md p-6 relative">
                                {/* Post Skeleton */}
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                                        <img src={user?.picture?.data?.url} alt="" className="rounded-full" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{user?.name}</p>
                                        <p className="text-sm text-gray-500">Just now</p>
                                    </div>
                                </div>

                                {/* Media Content */}
                                <div className="w-full h-[full] bg-gray-100 rounded-lg overflow-hidden">
                                    {mediaItem?.src?.endsWith(".mp4") ? (
                                        <video
                                            src={mediaItem.src}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={mediaItem.src}
                                            alt="Selected Media"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    :

                    <>
                        {/* Make a Post */}
                        {
                            Array.isArray(selectedAccounts) &&
                            selectedAccounts?.length > 0 &&
                            selectedAccounts?.map((account, index) => (
                                <div key={index}>
                                    <div>
                                        {/* Post */}
                                        {account?.isPost ? (
                                            <div className={`flex gap-6 w-full justify-start px-[20%] py-10`}>
                                                <div className="w-[50%] p-4 h-[100%]">
                                                    <div className="flex items-left mb-4">
                                                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                                                            {
                                                                account?.page?.type === "Youtube"
                                                                    ? <img src={account?.page?.picture} alt="" className="rounded-full" />
                                                                    : <img src={account?.page?.picture?.data?.url} alt="" className="rounded-full" />
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{account?.page?.name}</p>
                                                            <p className="text-sm text-gray-500">{account?.page?.type}</p>
                                                        </div>
                                                    </div>

                                                    {
                                                        account?.page?.type !== "Youtube" &&
                                                        <PostTypeSelector
                                                            key={index}
                                                            id={account?.page?.id}
                                                            account={account}
                                                            handleRadioChange={handleRadioChange}
                                                        />
                                                    }

                                                    <textarea
                                                        className="w-[100%] h-40 p-4 border rounded-md text-gray-700"
                                                        placeholder="Write a caption for your post..."
                                                        value={captions[account?.page?.id] || ""}
                                                        onChange={(e) => handleCaptionChange(e, account?.page?.id)}
                                                    />
                                                </div>

                                                <div className="w-[50%] max-w-xl bg-white border-l rounded-lg shadow-md p-6 relative">
                                                    {/* Facebook/Instagram Post Preview */}
                                                    <div className="flex items-center mb-4">
                                                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                                                            {
                                                                account?.page?.type === "Youtube"
                                                                    ? <img src={account?.page?.picture} alt="" className="rounded-full" />
                                                                    : <img src={account?.page?.picture?.data?.url} alt="" className="rounded-full" />
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{account?.page?.name}</p>
                                                            <p className="text-sm text-gray-500">{account?.page?.type}</p>
                                                        </div>
                                                    </div>

                                                    {/* Live Caption */}
                                                    {showCaptionInput && (
                                                        <p className="mt-4 mb-5 text-gray-700 text-lg">
                                                            {captions[account?.page?.id] || "Your caption..."}
                                                        </p>
                                                    )}

                                                    {/* Media Content */}
                                                    <div className="w-full h-[full] bg-gray-100 rounded-lg overflow-hidden">
                                                        {mediaItem?.src?.endsWith(".mp4") ? (
                                                            <video
                                                                src={mediaItem.src}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={mediaItem.src}
                                                                alt="Selected Media"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Story */}
                                        {account?.isStory ? (
                                            <div className={`flex gap-6 w-full justify-start px-[20%] py-10`}>
                                                {/* Sidebar Options */}
                                                <div className="w-[50%] p-4 h-[100%]">
                                                    {/* User Info */}
                                                    <div className="flex items-left mb-4">
                                                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                                                            <img src={account?.page?.picture?.data?.url} alt="User" className="rounded-full" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{account?.page?.name}</p>
                                                            <p className="text-sm text-gray-500">{account?.page?.type}</p>
                                                        </div>
                                                    </div>

                                                    {/* Post Type Options */}
                                                    <PostTypeSelector
                                                        key={index}
                                                        id={account?.pageId}
                                                        account={account}
                                                        handleRadioChange={handleRadioChange}
                                                    />


                                                    <p className=" text-gray-600">
                                                        "Saddle up and share your story. No need for captions, partner.👌🤩"
                                                    </p>
                                                </div>

                                                {/* Story UI */}
                                                <div className="w-[50%] max-w-sm bg-black rounded-lg shadow-md relative flex flex-col items-center justify-center overflow-hidden">
                                                    {/* Progress Bar */}
                                                    <div className="absolute top-2 left-4 right-4 flex gap-1">
                                                        {[...Array(3)].map((_, index) => (
                                                            <div
                                                                key={index}
                                                                className={`flex-1 h-1 rounded-full ${index === 0 ? "bg-white" : "bg-gray-500"}`}
                                                            ></div>
                                                        ))}
                                                    </div>

                                                    {/* Story Content */}
                                                    <div className="w-full h-[500px] relative">
                                                        {mediaItem?.src?.endsWith(".mp4") ? (
                                                            <video
                                                                src={mediaItem.src}
                                                                className="w-full h-full object-cover"
                                                                autoPlay
                                                                muted
                                                                loop
                                                            />
                                                        ) : (
                                                            <img
                                                                src={mediaItem.src}
                                                                alt="Selected Story Media"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}

                                                        {/* User Info on Story */}
                                                        <div className="absolute top-4 left-4 flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3">
                                                                <img src={account?.page?.picture?.data?.url} alt="User" className="rounded-full" />
                                                            </div>
                                                            <p className="text-white text-sm font-bold">{account?.page?.name}</p>
                                                        </div>
                                                    </div>

                                                    {/* Comment Section */}
                                                    <div className="w-full p-4 bg-gray-800">
                                                        <div className="flex items-center">
                                                            <div className="flex-1 p-3 rounded-lg bg-gray-700 text-gray-400 placeholder-gray-400 cursor-text">
                                                                <p>Send a message...</p>
                                                            </div>
                                                            <div className="ml-3 flex gap-2 text-white text-lg">
                                                                <span>😊</span>
                                                                <span>🙌</span>
                                                                <span>❤️</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        ) : null}
                                    </div>
                                </div>
                            ))
                        }

                    </>

            }
        </div >
    );
};

export default PostPage;
