/* global FB */
// import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import CookieConsent from "./Components/Facebook/CookieConsent";
import CreatePost from "./Components/Facebook/CreatePost/CreatePost";
import Feed from "./Components/Facebook/Feed/Feed";
import SocialMediaLoginPage from "./Components/SocialMediaLoginPage/SocialMediaLoginPage";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./Context/AppContext";
import HeaderComponent from "./Components/Facebook/HeaderComponent/HeaderComponent";
import InstagramCallbackPage from "./Components/Instagram/InstagramCallbackPage ";

function App() {

  return (
    <AppProvider>
      <Router>
        <div
          style={{
            height: '100dvh',
            width: '100dvw',
          }}
        >
          <CookieConsent />
          <HeaderComponent />
          <Routes>
            <Route path="/" element={<SocialMediaLoginPage />} />
            <Route path="/home" element={<Feed />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/instagram-callback" element={<InstagramCallbackPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
