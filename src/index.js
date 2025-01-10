import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';


// Import your Publishable Key
// const PUBLISHABLE_KEY = "pk_test_c3RhYmxlLWNhbGYtMjUuY2xlcmsuYWNjb3VudHMuZGV2JA";

// console.log("PUBLISHABLE_KEY==>", PUBLISHABLE_KEY)

// if (!PUBLISHABLE_KEY) {
//     throw new Error("Missing Publishable Key")
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <App />
    // </ClerkProvider>
);
