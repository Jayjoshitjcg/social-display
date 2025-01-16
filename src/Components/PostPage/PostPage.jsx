import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

const PostPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        mediaItem,
        // user = {
        //     name: "John Doe",
        //     socialMediaAccounts: [
        //         { id: "fb", name: "Facebook Page", selected: false },
        //         { id: "insta", name: "Instagram Page", selected: false },
        //     ],
        // },
    } = location.state || {};

    const socialMediaAccounts = [
        { id: "fb", name: "Facebook Page", selected: false },
        { id: "insta", name: "Instagram Page", selected: false },
    ]

    const { user } = useContext(AppContext)
    console.log("user==>", user)

    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [showCaptionInput, setShowCaptionInput] = useState(false);
    const [caption, setCaption] = useState("");

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
        // Handle publish logic here
        alert("Post published!");
    };

    return (
        <div className=" h-screen w-[full] bg-gray-100 pt-12">
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
                                    {socialMediaAccounts.map((account) => (
                                        <li key={account.id} className="flex items-center mb-4">
                                            <input
                                                type="checkbox"
                                                id={`social-${account.id}`}
                                                className="mr-2"
                                                checked={selectedAccounts.includes(account.id)}
                                                onChange={() => handleCheckboxChange(account.id)}
                                            />
                                            <label htmlFor={`social-${account.id}`} className="text-lg">
                                                {account?.name}
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
