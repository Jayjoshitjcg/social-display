import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [posts, setPosts] = useState()
    const [accessToken, setAccessToken] = useState();
    const [instaAccessToken, setInstaAccessToken] = useState()
    const [user, setUser] = useState()
    const [userPages, setUserPages] = useState()

    return (
        <AppContext.Provider value={{ posts, setPosts, accessToken, setAccessToken, user, setUser, instaAccessToken, setInstaAccessToken, userPages, setUserPages }} >
            {children}
        </AppContext.Provider>
    )
}