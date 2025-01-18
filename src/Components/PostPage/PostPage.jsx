import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PostPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { mediaItem } = location.state || {};

    // const socialMediaAccounts = [
    //     { id: "fb", name: "Facebook Page", selected: false },
    //     { id: "insta", name: "Instagram Page", selected: false },
    // ]

    const { user, userPages } = useContext(AppContext)
    console.log("userPages==>", userPages)

    const [showCaptionInput, setShowCaptionInput] = useState(false);
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);
    const [postType, setPostType] = useState("post");
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [scheduledTime, setScheduledTime] = useState(null);
    const [isScheduling, setIsScheduling] = useState(null);


    console.log("selectedAccounts==>", selectedAccounts)

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
                        onChange={() => handleRadioChange(id, "post")}
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
                        onChange={() => handleRadioChange(id, "story")}
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
                        onChange={() => handleRadioChange(id, "both")}
                        className="mr-2"
                    />
                    Both
                </label>
            </div>
        );
    };



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

    const handleCheckboxChange = (accountId, pageType) => {
        setSelectedAccounts((prev) => {
            const isSelected = prev.some((account) => account.pageId === accountId);

            if (isSelected) {
                // Remove the deselected page
                return prev.filter((account) => account.pageId !== accountId);
            } else {
                // Add the newly selected page
                return [
                    ...prev,
                    {
                        pageId: accountId,
                        pagePlateformType: pageType,
                        isPost: true,
                        isStory: false,
                    },
                ];
            }
        });
    };

    const handleRadioChange = (id, type) => {
        console.log("Selected type==>", type);
        setSelectedAccounts((prevAccounts) =>
            prevAccounts.map((account) => {
                if (account?.pageId === id) {
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

    const handlePublishClick = () => {
        if (selectedAccounts.length === 0) {
            alert("Please select at least one page to publish.");
            return;
        }

        setLoading(true);

        selectedAccounts.forEach((account) => {
            const { pageId, pagePlateformType, isPost, isStory } = account;
            const page = userPages.find((p) => p.id === pageId);
            const imageURL = `${window.location.origin}/images/${mediaItem.src}`;
            console.log("Image URL:", imageURL);

            if (page && page.access_token) {
                // If the platform is Facebook
                if (pagePlateformType === "Facebook") {
                    // Publish post if isPost is true or if both is true
                    if (isPost || (isPost && isStory)) {
                        window.FB.api(
                            `/${pageId}/photos`,
                            "POST",
                            {
                                url: "https://1roos.com/api/v1/uploads/user/1736913776159MUgI6mk2.jpg", // URL of the image to post
                                caption: caption, // Caption to post with the image
                                access_token: page.access_token, // Page access token
                            },
                            (response) => {
                                if (response && !response.error) {
                                    console.log(`Successfully posted to page ${page.name}`);
                                    alert(`Successfully posted to ${page.name}`);
                                } else {
                                    console.error(
                                        `Error posting to page ${page.name}:`,
                                        response.error
                                    );
                                    alert(
                                        `Failed to post to ${page.name}. Please check the console for details.`
                                    );
                                }
                            }
                        );
                    }

                    // Publish story if isStory is true or if both is true
                    if (isStory || (isPost && isStory)) {
                        window.FB.api(
                            `/${pageId}/stories`,
                            "POST",
                            {
                                file_url: "https://1roos.com/api/v1/uploads/user/1736913776159MUgI6mk2.jpg", // URL of the media to post as a story
                                access_token: page.access_token, // Page access token
                            },
                            (response) => {
                                if (response && !response.error) {
                                    console.log(`Successfully posted a story to page ${page.name}`);
                                    alert(`Successfully posted a story to ${page.name}`);
                                } else {
                                    console.error(
                                        `Error posting a story to page ${page.name}:`,
                                        response.error
                                    );
                                    alert(
                                        `Failed to post a story to ${page.name}. Please check the console for details.`
                                    );
                                }
                            }
                        );
                    }
                }

                // If the platform is Instagram
                else if (pagePlateformType === "Instagram") {
                    // Here, you'd call Instagram's API, which works differently from Facebook's
                    if (isPost || (isPost && isStory)) {
                        // Instagram post logic (using Instagram API)
                        console.log(`Posting to Instagram page ${page.name} as post.`);
                        // You would need to replace this with actual Instagram API logic
                    }

                    if (isStory || (isPost && isStory)) {
                        // Instagram story logic (using Instagram API)
                        console.log(`Posting to Instagram page ${page.name} as story.`);
                        // You would need to replace this with actual Instagram API logic
                    }
                }

                setLoading(false);
            } else {
                console.error(
                    `No access token found for page ${page?.name || pageId}`
                );
                alert(`Cannot post to page ${page?.name || pageId}`);
                setLoading(false);
            }
        });
    };

    const handleScheduleClick = () => {
        if (!scheduledTime) {
            alert("Please select a scheduled time.");
            return;
        }

        if (selectedAccounts.length === 0) {
            alert("Please select at least one page to schedule.");
            return;
        }

        setLoading(true);

        // Store the scheduled post in localStorage or sessionStorage
        const postDetails = {
            platform: selectedAccounts[0].pagePlateformType, // Assuming one account selected for simplicity
            caption: caption,
            mediaUrl: mediaItem?.src,
            scheduledTime,
        };

        // Store the post details in localStorage
        localStorage.setItem('scheduledPost', JSON.stringify(postDetails));

        // Set a timeout to trigger the post when the scheduled time is reached
        const delay = new Date(scheduledTime).getTime() - new Date().getTime();
        if (delay > 0) {
            setTimeout(() => {
                publishScheduledPost();
            }, delay);
        } else {
            alert("Scheduled time must be in the future.");
        }

        setLoading(false);
    };

    const publishScheduledPost = () => {
        const storedPost = JSON.parse(localStorage.getItem('scheduledPost'));

        if (storedPost) {
            const { platform, caption, mediaUrl, scheduledTime } = storedPost;

            if (platform === "Facebook") {
                // Trigger Facebook post publishing
                const pageId = selectedAccounts[0].pageId; // Assuming one account selected
                const page = userPages.find((p) => p.id === pageId);

                if (page && page.access_token) {
                    window.FB.api(
                        `/${pageId}/photos`,
                        "POST",
                        {
                            url: mediaUrl, // Media URL of the image/video
                            caption: caption, // Caption to post with the media
                            access_token: page.access_token, // Page access token
                        },
                        (response) => {
                            if (response && !response.error) {
                                console.log(`Successfully posted to Facebook page ${page.name}`);
                                alert(`Successfully posted to ${page.name}`);
                            } else {
                                console.error(`Error posting to Facebook page ${page.name}:`, response.error);
                                alert(`Failed to post to ${page.name}. Please check the console for details.`);
                            }
                        }
                    );
                } else {
                    console.error(`No access token found for page ${page?.name || pageId}`);
                    alert(`Cannot post to page ${page?.name || pageId}`);
                }
            }

            else if (platform === "Instagram") {
                // Trigger Instagram post publishing (replace with actual Instagram API logic)
                console.log(`Publishing to Instagram page...`);
                alert(`Successfully posted to Instagram!`);

                // You would need to replace this with Instagram API logic
                // Instagram doesn't have direct photo upload API like Facebook does. You might need a service like Instagram Graph API or another method
            }

            localStorage.removeItem('scheduledPost'); // Clear the scheduled post after publishing
        }
    };




    return (
        <div className="w-[full] pt-12">
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {
                !showCaptionInput ?
                    // {/* page Selection */}
                    <div>
                        <button
                            onClick={handleNextClick}
                            disabled={selectedAccounts.length === 0}
                            className={`absolute top-[5rem] right-[10rem] px-6 py-3 text-white text-lg rounded-md ${selectedAccounts.length > 0
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-gray-400 cursor-not-allowed"
                                }`}
                        >
                            Next
                        </button>
                        <div className={`flex gap-6 w-full justify-start px-[20%] py-10`}>
                            <div className="w-[50%] p-4 h-[100%]">

                                <div className="flex flex-col w-[20rem]">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                                            <img src={user?.picture?.data?.url} alt="" className="rounded-full" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{user?.name}</p>
                                            <p className="text-sm text-gray-500">Just now</p>
                                        </div>
                                    </div>
                                    <ul>
                                        {userPages?.map((page) => (
                                            <li key={page?.id} className="flex items-center mb-4">
                                                <input
                                                    type="checkbox"
                                                    id={`social-${page?.id}`}
                                                    className="mr-2"
                                                    checked={selectedAccounts.some((account) => account.pageId === page?.id)}
                                                    onChange={() => handleCheckboxChange(page?.id, page?.type)}
                                                />
                                                <label htmlFor={`social-${page?.id}`} className="text-lg">
                                                    {page?.name}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="w-[50%] max-w-xl bg-white border-l rounded-lg shadow-md p-6 relative">
                                {/* Facebook Post Skeleton */}
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
                    // {/* Make a Post */}
                    Array.isArray(selectedAccounts) &&
                    selectedAccounts?.length > 0 &&
                    selectedAccounts?.map((account, index) => (
                        <div key={index}>

                            <div className="absolute top-[10rem] right-[12rem] ">
                                <button
                                    onClick={() => setIsScheduling(!isScheduling)}
                                    className="fixed top-[5rem] right-[12rem] px-3 py-3.5 text-white bg-yellow-500 rounded-md"
                                >
                                    {isScheduling ? 'Confirm Schedule' : 'Schedule Post'}
                                </button>
                                {isScheduling && (
                                    <div className="relative">
                                        {/* DatePicker Component */}
                                        <DatePicker
                                            id="schedule-time"
                                            selected={scheduledTime}
                                            onChange={handleScheduleClick}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            dateFormat="yyyy/MM/dd h:mm aa"
                                            placeholderText="Select a date and time"
                                            className="fixed top-[9rem] right-[12rem]  border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-999"
                                        />
                                    </div>
                                )}

                            </div>
                            <button
                                onClick={handlePublishClick}
                                className="absolute top-[5rem] right-[2rem] px-6 py-3 text-white text-lg rounded-md bg-blue-500 hover:bg-blue-600"
                            >
                                Publish
                            </button>
                            <div>
                                {/* Post */}
                                {account?.isPost ? (
                                    <div className={`flex gap-6 w-full justify-start px-[20%] py-10`}>
                                        <div className="w-[50%] p-4 h-[100%]">
                                            <div className="flex items-left mb-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                                                    <img src={user?.picture?.data?.url} alt="" className="rounded-full" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{user?.name}</p>
                                                    <p className="text-sm text-gray-500">{account?.pagePlateformType}</p>
                                                </div>
                                            </div>

                                            <PostTypeSelector
                                                key={index}
                                                id={account?.pageId}
                                                account={account}
                                                handleRadioChange={handleRadioChange}
                                            />


                                            <textarea
                                                className="w-[100%] h-40 p-4 border rounded-md text-gray-700"
                                                placeholder="Write a caption for your post..."
                                                value={caption}
                                                onChange={(e) => setCaption(e.target.value)}
                                            />
                                        </div>

                                        <div className="w-[50%] max-w-xl bg-white border-l rounded-lg shadow-md p-6 relative">
                                            {/* Facebook/Instagram Post Preview */}
                                            <div className="flex items-center mb-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                                                    <img src={user?.picture?.data?.url} alt="" className="rounded-full" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{user?.name}</p>
                                                    <p className="text-sm text-gray-500">Just now</p>
                                                </div>
                                            </div>

                                            {/* Live Caption */}
                                            {showCaptionInput && (
                                                <p className="mt-4 mb-5 text-gray-700 text-lg">
                                                    {caption || "Your caption..."}
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
                                                    <img src={user?.picture?.data?.url} alt="User" className="rounded-full" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{user?.name}</p>
                                                    <p className="text-sm text-gray-500">Just now</p>
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
                                                        <img src={user?.picture?.data?.url} alt="User" className="rounded-full" />
                                                    </div>
                                                    <p className="text-white text-sm font-bold">{user?.name}</p>
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
        </div >
    );
};

export default PostPage;
