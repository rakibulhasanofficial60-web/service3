import { FaCalendarAlt } from "react-icons/fa";
import { MdDeleteSweep, MdMenu } from "react-icons/md";
import { Link, NavLink, Outlet } from "react-router-dom";
import logo from '../assets/logo/logo.png';
import { FaUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlinePayments } from "react-icons/md";
import { FaWallet } from "react-icons/fa6";
import { IoMdShare } from "react-icons/io";
import { RiLogoutCircleLine } from "react-icons/ri";
import { RiMacbookFill } from "react-icons/ri";
import { SiServerless } from "react-icons/si";
import { LuProportions } from "react-icons/lu";
import { IoMdTime } from "react-icons/io";


const UserDashboard = () => {
    const user = false;
    const admin = true;


    const links = (
        <>
            {/* just user  */}
            {user && !admin && (
                <ul>
                    {/* My Bookings */}
                    <li className="list-none border-y border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/booking"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <FaCalendarAlt /> My Bookings
                        </NavLink>
                    </li>

                    {/* My Quotes */}
                    {/* <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/quotes"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <LuMenu className="text-[17px]" /> My Quotes
                        </NavLink>
                    </li> */}

                    {/* My Profile */}
                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/profile"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <FaUser /> My Profile
                        </NavLink>
                    </li>

                    {/* Outstanding Payments */}
                    {/* <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/outstanding-payments"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <MdPayments /> Outstanding Payments
                        </NavLink>
                    </li> */}

                    {/* Saved Locations */}
                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/saved-locations"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <FaLocationDot /> Saved Locations
                        </NavLink>
                    </li>

                    {/* Payment Methods */}
                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/payment-methods"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <MdOutlinePayments /> Payment Methods
                        </NavLink>
                    </li>

                    {/* My Wallet */}
                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/wallet"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <FaWallet /> My Wallet
                        </NavLink>
                    </li>

                    {/* Delete Account */}
                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/delete-account"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <MdDeleteSweep className="text-xl" /> Delete Account
                        </NavLink>
                    </li>

                    {/* Invite a Friend */}
                    <li className="list-none border-b border-dashed hover:bg-gray-50 flex justify-between items-center px-3 py-2">
                        <NavLink
                            to="/dashboard/invite-friend"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] py-1 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <IoMdShare className="text-[18px]" /> Invite a friend
                        </NavLink>

                        <span className="bg-[#ED6329] text-white text-[11px] px-2 py-0.5 rounded">
                            Get 30 ৳ credit
                        </span>
                    </li>

                    {/* Logout */}
                    <li className="list-none flex items-center gap-1.5 py-3 px-3 hover:underline cursor-pointer text-[#157D91]">
                        <RiLogoutCircleLine />  Logout
                    </li>
                </ul>
            )}

            {/* just admin  */}
            {admin && !user && (
                <ul>
                    <li className="list-none border-y border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/admin-booking"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <RiMacbookFill /> Booking
                        </NavLink>
                    </li>

                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/add-services"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <FaCalendarAlt /> Services
                        </NavLink>
                    </li>

                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/add-service-type"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <SiServerless /> Services Type
                        </NavLink>
                    </li>

                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/add-property-type"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <LuProportions className="text-[16px]" /> Property Type
                        </NavLink>
                    </li>

                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/add-property-item"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <FaCalendarAlt /> Property Item
                        </NavLink>
                    </li>

                    <li className="list-none border-b border-dashed hover:bg-gray-50">
                        <NavLink
                            to="/dashboard/admin-date-time"
                            className={({ isActive }) =>
                                `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
                        ${isActive ? "font-extrabold" : ""}`
                            }>
                            <IoMdTime className="text-[18px]" /> Date & Time Slot
                        </NavLink>
                    </li>
                </ul>
            )}
        </>
    );


    // const links =
    //     <ul>
    //         {/* My Bookings */}
    //         <li className="list-none border-y border-dashed hover:bg-gray-50">
    //             <NavLink
    //                 to="/dashboard/booking"
    //                 className={({ isActive }) =>
    //                     `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
    //                     ${isActive ? "font-extrabold" : ""}`
    //                 }>
    //                 <FaCalendarAlt /> My Bookings
    //             </NavLink>
    //         </li>

    //         {/* My Quotes */}
    //         <li className="list-none border-b border-dashed hover:bg-gray-50">
    //             <NavLink
    //                 to="/dashboard/quotes"
    //                 className={({ isActive }) =>
    //                     `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
    //                     ${isActive ? "font-extrabold" : ""}`
    //                 }>
    //                 <LuMenu className="text-[17px]" /> My Quotes
    //             </NavLink>
    //         </li>

    //         {/* My Profile */}
    //         <li className="list-none border-b border-dashed hover:bg-gray-50">
    //             <NavLink
    //                 to="/dashboard/profile"
    //                 className={({ isActive }) =>
    //                     `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
    //                     ${isActive ? "font-extrabold" : ""}`
    //                 }>
    //                 <FaUser /> My Profile
    //             </NavLink>
    //         </li>

    //         {/* Outstanding Payments */}
    //         <li className="list-none border-b border-dashed hover:bg-gray-50">
    //             <NavLink
    //                 to="/dashboard/outstanding-payments"
    //                 className={({ isActive }) =>
    //                     `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
    //                     ${isActive ? "font-extrabold" : ""}`
    //                 }>
    //                 <MdPayments /> Outstanding Payments
    //             </NavLink>
    //         </li>

    //         {/* Saved Locations */}
    //         <li className="list-none border-b border-dashed hover:bg-gray-50">
    //             <NavLink
    //                 to="/dashboard/saved-locations"
    //                 className={({ isActive }) =>
    //                     `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
    //                     ${isActive ? "font-extrabold" : ""}`
    //                 }>
    //                 <FaLocationDot /> Saved Locations
    //             </NavLink>
    //         </li>

    //         {/* Payment Methods */}
    //         <li className="list-none border-b border-dashed hover:bg-gray-50">
    //             <NavLink
    //                 to="/dashboard/payment-methods"
    //                 className={({ isActive }) =>
    //                     `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
    //                     ${isActive ? "font-extrabold" : ""}`
    //                 }>
    //                 <MdOutlinePayments /> Payment Methods
    //             </NavLink>
    //         </li>

    //         {/* My Wallet */}
    //         <li className="list-none border-b border-dashed hover:bg-gray-50">
    //             <NavLink
    //                 to="/dashboard/wallet"
    //                 className={({ isActive }) =>
    //                     `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
    //                     ${isActive ? "font-extrabold" : ""}`
    //                 }>
    //                 <FaWallet /> My Wallet
    //             </NavLink>
    //         </li>

    //         {/* Delete Account */}
    //         <li className="list-none border-b border-dashed hover:bg-gray-50">
    //             <NavLink
    //                 to="/dashboard/delete-account"
    //                 className={({ isActive }) =>
    //                     `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition 
    //                     ${isActive ? "font-extrabold" : ""}`
    //                 }>
    //                 <MdDeleteSweep /> Delete Account
    //             </NavLink>
    //         </li>

    //         {/* Invite a Friend */}
    //         <li className="list-none border-b border-dashed hover:bg-gray-50 flex justify-between items-center px-3 py-2">
    //             <NavLink
    //                 to="/dashboard/invite-friend"
    //                 className={({ isActive }) =>
    //                     `text-[14px] font-medium flex items-center gap-2 text-[#157D91] py-1 transition 
    //                     ${isActive ? "font-extrabold" : ""}`
    //                 }>
    //                 <IoMdShare /> Invite a friend
    //             </NavLink>

    //             <span className="bg-[#ED6329] text-white text-[11px] px-2 py-0.5 rounded">
    //                 Get 30 ৳ credit
    //             </span>
    //         </li>

    //         {/* Logout */}
    //         <li className="list-none flex items-center gap-1.5 py-3 px-3 hover:underline cursor-pointer text-[#157D91]">
    //             <RiLogoutCircleLine />  Logout
    //         </li>
    //     </ul>


    return (
        <div className="drawer lg:drawer-open max-w-7xl mx-auto mt-10 px-4">
            <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

            {/* Drawer Content */}
            <div className="drawer-content flex flex-col">
                {/* Top Navbar for Mobile */}
                <div className="w-full navbar flex justify-between lg:hidden">
                    <div className="flex items-center gap-2">
                        <label htmlFor="dashboard-drawer" className="btn btn-ghost lg:hidden">
                            <MdMenu size={24} />
                        </label>
                    </div>
                </div>

                <div className="md:px-10">
                    <Outlet />
                </div>
            </div>

            {/* Drawer Side */}
            <div className="drawer-side border border-[#CED4DA]">
                <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>

                <div className="md:w-72 bg-[#FFFFFF] p-2 relative">

                    {/* Mobile Close Button */}
                    <label
                        htmlFor="dashboard-drawer"
                        className="btn btn-sm btn-circle absolute right-2 top-2 lg:hidden"
                    >
                        ✕
                    </label>

                    <div className="flex flex-col items-center justify-center mb-4">
                        <Link to='/'>
                            <img className="w-52 md:mt-4" src={logo} alt="logo" />
                        </Link>

                        <div className="text-center flex flex-col items-center mt-5 space-y-3">
                            <h2 className="text-2xl text-[#5D4F52] font-bold">Rakib</h2>
                            {/* <div className="flex items-center justify-center gap-1.5 text-xl w-[70px] bg-[#ED6329] py-1 rounded-md">
                                <img className="h-4 w-4" src={dirhum} alt="dirhum" />
                                <p>80</p>
                            </div> */}
                            <p className="font-medium text-[#01788E]">Al Bada'a, Dubai</p>
                        </div>
                    </div>
                    {links}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;