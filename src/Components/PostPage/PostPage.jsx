import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

const PostPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { mediaItem } = location.state || {};

    // const socialMediaAccounts = [
    //     { id: "fb", name: "Facebook Page", selected: false },
    //     { id: "insta", name: "Instagram Page", selected: false },
    // ]

    const { user, userPages } = useContext(AppContext)

    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [showCaptionInput, setShowCaptionInput] = useState(false);
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false); // Loader state

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

    const handleCheckboxChange = (accountId) => {
        setSelectedAccounts((prev) =>
            prev.includes(accountId)
                ? prev.filter((id) => id !== accountId)
                : [...prev, accountId]
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

        setLoading(true)

        selectedAccounts.forEach((pageId) => {
            // Find the selected page details
            const page = userPages.find((p) => p.id === pageId);
            const imageURL = `${window.location.origin}/images/${mediaItem.src}`;
            console.log("image URL==>", imageURL)
            if (page && page.access_token) {
                // Call the Facebook API to post the image with the caption
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
                            setLoading(false)
                            navigate('/');
                        } else {
                            console.error(
                                `Error posting to page ${page.name}:`,
                                response.error
                            );
                            alert(`Failed to post to ${page.name}. Please check console for details.`
                            );
                            setLoading(false)
                        }
                    }
                );
            } else {
                console.error(
                    `No access token found for page ${page?.name || pageId}`
                );
                alert(`Cannot post to page ${page?.name || pageId}`);
                setLoading(false)
            }
        });
    };


    return (
        <div className=" h-screen w-[full] bg-gray-100 pt-12">
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            {showCaptionInput ?
                <button
                    onClick={handlePublishClick}
                    className="absolute top-[5rem] right-[10rem] px-6 py-3 text-white text-lg rounded-md bg-blue-500 hover:bg-blue-600"
                >
                    Publish
                </button> :
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
            }
            <div className={`flex gap-6 w-full justify-center p-10`}>
                <div className="border-r p-4 h-[100%]">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4">
                            <img src={user?.picture?.data?.url} alt="" className="rounded-full" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">{user?.name}</p>
                            <p className="text-sm text-gray-500">Just now</p>
                        </div>
                    </div>
                    {
                        showCaptionInput ?
                            <textarea
                                className="w-[30rem] h-40 p-4 border rounded-md text-gray-700"
                                placeholder="Write a caption for your post..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            /> :
                            <div className="flex flex-col w-[20rem]">
                                {/* <h1 className="text-2xl font-bold mb-6">Hi, {user.name}</h1>
                                <h2 className="text-xl font-semibold mb-4">Post to:</h2> */}
                                <ul>
                                    {userPages?.map((page, index) => (
                                        <li key={page?.id} className="flex items-center mb-4">
                                            <input
                                                type="checkbox"
                                                id={`social-${page?.id}`}
                                                className="mr-2"
                                                checked={selectedAccounts.includes(page?.id)}
                                                onChange={() => handleCheckboxChange(page?.id)}
                                            />
                                            <label htmlFor={`social-${page?.id}`} className="text-lg">
                                                {page?.name}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                    }
                </div>
                <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-6 relative">
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

                    {/* Live Caption */}
                    {showCaptionInput && (
                        <p className="mt-4 mb-5 text-gray-700 text-lg">
                            {caption || "Write a caption..."}
                        </p>
                    )}

                    {/* Media Content */}
                    <div className="w-full h-[full] bg-gray-100 rounded-lg overflow-hidden">


                        {mediaItem?.src?.endsWith(".mp4") ? (
                            <video
                                src={mediaItem.src}
                                className="w-full h-full object-cover"
                                controls
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
    );
};

export default PostPage;
