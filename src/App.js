// import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import SocialMediaLoginPage from "./Components/SocialMediaLoginPage/SocialMediaLoginPage";

function App() {

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightgray'
      }}
    >
      <SocialMediaLoginPage />

      {/* <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header> */}
    </div>
  );
}

export default App;
