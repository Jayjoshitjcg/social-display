import React, { useContext } from 'react';
import { AppContext } from '../../../Context/AppContext';
import { useNavigate } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login';
import Cookies from 'js-cookie';
import { FaFacebook } from 'react-icons/fa';

const HeaderComponent = () => {

    const navigate = useNavigate()
    const { user, setUser, accessToken, setAccessToken } = useContext(AppContext)



    const handleLogOut = () => {
        localStorage.removeItem("LOGIN_USER")
        setUser("");
        setAccessToken("");
        navigate("/");
    }

    //Facebook Login
    const handleFacebookResponse = (response) => {
        if (response?.accessToken) {
            setUser(response);
            setAccessToken(response?.accessToken);
            localStorage.setItem("LOGIN_USER", JSON.stringify({
                userEmail: response?.email,
                userName: response?.name,
            }));
            Cookies.set('accessToken', response.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
            navigate(`/`);
        } else {
            console.error("Facebook login failed:", response);
            alert("Login failed. Please try again.");
        }
    };


    return (
        <header className="w-[100%] flex justify-between p-4 bg-slate-900 text-white px-[10rem] sticky top-0 z-10">
            {/* Left Section */}
            {
                <div className="font-semibold text-[1.5rem]">
                    {user?.name ? `Welcome, ${user?.name}` : "Social Display"}
                </div>
            }

            <div>

                {/* Right Section */}
                {
                    user?.name
                        ? <button
                            className="bg-transparent border-none text-white text-[1.5rem]  font-medium hover:underline cursor-pointer"
                            onClick={handleLogOut}
                        >
                            Log out
                        </button>
                        : <FacebookLogin
                            appId="1627558811169298"
                            autoLoad={false}
                            fields="id,name,email,picture"
                            callback={handleFacebookResponse}
                            scope="public_profile,email"
                            render={(renderProps) => (
                                <div onClick={renderProps.onClick} aria-label="Login with Facebook" className="cursor-pointer flex flex-col items-center">
                                    <FaFacebook className="text-3xl mb-2" />
                                    <span className="text-xs font-medium">Facebook</span>
                                </div>
                            )}
                        />
                }
            </div>

        </header>
    );
};

export default HeaderComponent;
