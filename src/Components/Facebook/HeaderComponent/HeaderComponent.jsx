import React, { useContext } from 'react';
import { AppContext } from '../../../Context/AppContext';
import { useNavigate } from 'react-router-dom';

const HeaderComponent = () => {

    const navigate = useNavigate()
    const { user, setUser } = useContext(AppContext)

    const handleLogOut = () => {
        localStorage.removeItem("LOGIN_USER")
        setUser("")
        navigate("/")
    }

    return (
        <header className="w-[100%] flex justify-between p-4 bg-blue-600 text-white px-[10rem]">
            {/* Left Section */}
            {
                <div className="font-semibold text-[1.5rem]">
                    {user?.name ? `Welcome, ${user?.name}` : "Social Display"}
                </div>
            }


            {/* Right Section */}
            {
                user?.name
                    ? <button
                        className="bg-transparent border-none text-white text-[1.5rem] font-medium hover:underline cursor-pointer"
                        onClick={handleLogOut}
                    >
                        Log out
                    </button>
                    : ''
            }

        </header>
    );
};

export default HeaderComponent;
