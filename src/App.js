// import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import CookieConsent from "./Components/CookieConsent";
import CreatePost from "./Components/CreatePost/CreatePost";
import Feed from "./Components/Feed/Feed";
import SocialMediaLoginPage from "./Components/SocialMediaLoginPage/SocialMediaLoginPage";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./Context/AppContext";

function App() {

  return (
    <AppProvider>
      <Router>
        <div
          style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
            <CookieConsent />
          <Routes>
            <Route path="/" element= {<SocialMediaLoginPage />} />
            <Route path="/home" element={<Feed/>}/>
            <Route path="/create-post" element={<CreatePost/>} />
          </Routes>

          {/* <header>
            <SignedOut>
            <SignInButton />
            </SignedOut>
            <SignedIn>
            <UserButton />
            </SignedIn>
            </header> */}
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
