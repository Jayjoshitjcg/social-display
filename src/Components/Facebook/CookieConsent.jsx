import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  // Check if the user has already given consent
  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white text-center py-4 z-50">
      <p>We use cookies to improve your experience. Do you accept the use of cookies?</p>
      <div className="mt-4">
        <button
          onClick={acceptCookies}
          className="bg-white text-black px-6 py-2 mx-2 rounded-lg hover:bg-gray-300 focus:outline-none"
        >
          Accept
        </button>
        <button
          onClick={rejectCookies}
          className="bg-red-600 text-white px-6 py-2 mx-2 rounded-lg hover:bg-red-500 focus:outline-none"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
