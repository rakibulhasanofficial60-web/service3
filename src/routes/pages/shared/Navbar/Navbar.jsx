import { Link } from "react-router-dom";
import logo from "../../../../assets/logo/logo.png";
import { useState } from "react";
import LoginModal from "../../../../components/LoginModal/LoginModal";

const Navbar = () => {
    const user = true;
    const [openModal, setOpenModal] = useState(false);

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md md:px-12 navbar md:flex md:justify-center md:items-center">
                <div className="navbar-start flex items-center">
                    <div className="dropdown">
                        <Link className="block lg:hidden" to="/">
                            <img
                                className="w-[133px] h-[33px]"
                                src={logo}
                                alt="Logo"
                            />
                        </Link>
                    </div>

                    <Link className="hidden lg:block" to="/">
                        <img
                            className="w-[133px] h-[33px]"
                            src={logo}
                            alt="Logo"
                        />
                    </Link>
                </div>

                <div className="navbar-end hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {/* {links} */}
                    </ul>
                </div>

                <div className="navbar-end mr-4 md:w-[100px]">
                    {user ? (
                        <div className="relative group">
                            <button className="btn bg-white text-gray-500 border-0 shadow-xs">
                                Rakib
                            </button>

                            {/* Hover Popup */}
                            <div className="
                                        absolute top-7 right-0 mt-1 w-60 bg-white shadow-lg rounded-xl p-2
                                        opacity-0 group-hover:opacity-100 
                                        pointer-events-none group-hover:pointer-events-auto
                                        transition-all duration-200
                                        z-50
                                    ">
                                <Link
                                    to="/dashboard/admin-booking"
                                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-[#01788E]"
                                >
                                    My Booking
                                </Link>

                                {/* <Link
                                    to="/dashboard/quotes"
                                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-[#01788E]"
                                >
                                    My Quotes
                                </Link> */}

                                <Link
                                    to="/dashboard/profile"
                                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-[#01788E]"
                                >
                                    My Profile
                                </Link>

                                <button
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-[#01788E]"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setOpenModal(true)} className="btn bg-white text-[#5D4F52] border-0 shadow-xs font-bold">
                            Login
                        </button>
                    )}
                </div>
            </div>

            {/* 🔹 Spacer div — so content doesn’t go under navbar */}
            <div className="h-10 md:h-[70px]"></div>
            <LoginModal open={openModal} onClose={() => setOpenModal(false)} />
        </>
    );
};

export default Navbar;