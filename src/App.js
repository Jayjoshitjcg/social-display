// import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import CookieConsent from "./Components/Facebook/CookieConsent";
import CreatePost from "./Components/Facebook/CreatePost/CreatePost";
import Feed from "./Components/Facebook/Feed/Feed";
import SocialMediaLoginPage from "./Components/SocialMediaLoginPage/SocialMediaLoginPage";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./Context/AppContext";
import HeaderComponent from "./Components/HeaderComponent/HeaderComponent";
import InstagramCallbackPage from "./Components/Instagram/InstagramCallbackPage ";
import TemplatePage from "./Components/TemplatePage/TemplatePage";
import PostPage from "./Components/PostPage/PostPage";
import SocialMediaSelection from "./Components/SocialMediaSelection/SocialMediaSelection";
import { gapi } from "gapi-script";

function App() {

  // Youtube/Google 
  const CLIENT_ID = "758113446784-pdtdcu1u0or8ai2i93leke18dhfhoqcg.apps.googleusercontent.com";
  const API_KEY = "AIzaSyB98bfkPweLxFj3VIqaB9gPg5WQS0EJoW4";
  const SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube";

  const initGoogleAPI = () => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"],
        })
        .then(() => {
          // Log success message when initialization is complete
          console.log("Google API initialized successfully!");
        })
        .catch((error) => {
          // Log any errors that occur during initialization
          console.error("Error initializing Google API:", error);
        });
    });
  };

  useEffect(() => {
    // Initialize Google API client on app load
    initGoogleAPI();
  }, []);


  return (
    <AppProvider>
      <Router>
        <div className="w-[100dvw] bg-gray-200" >
          <CookieConsent />
          <HeaderComponent />
          <Routes>
            {/* <Route path="/" element={<SocialMediaLoginPage />} />
            <Route path="/home" element={<Feed />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/instagram-callback" element={<InstagramCallbackPage />} /> */}
            < Route path="/" element={<TemplatePage />} />
            <Route path="/socialmedia" element={<SocialMediaSelection />} />
            < Route path="/postpage" element={<PostPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
