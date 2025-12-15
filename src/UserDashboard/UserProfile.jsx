import { FaUser } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

const UserProfile = () => {
    return (
        <div className="border border-[#E5E7EB] p-6 rounded-lg bg-white w-full max-w-5xl mx-auto">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#5D4F52] border-b border-[#E5E7EB] pb-3">
                <FaUser className="text-[#01788E]" /> Contact Information
            </h2>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">First Name</label>
                    <input
                        type="text"
                        placeholder=""
                        className="border border-[#E5E7EB] rounded-md px-4 py-2 outline-none focus:border-[#01788E]"
                    />
                </div>


                {/* Last Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">Last Name</label>
                    <input
                        type="text"
                        placeholder=""
                        className="border border-[#E5E7EB] rounded-md px-4 py-2 outline-none focus:border-[#01788E]"
                    />
                </div>
            </div>


            <div className="md:flex items-center gap-6">
                {/* Email */}
                <div className="mt-6 flex flex-col gap-2 w-full md:w-1/2">
                    <label className="text-sm text-gray-600">Email</label>
                    <input
                        type="email"
                        placeholder="jessy@nextgent.org"
                        className="border border-[#E5E7EB] bg-[#F3F4F6] rounded-md px-4 py-2 text-gray-700"
                    />
                </div>


                {/* Phone Section */}
                <div className="mt-6 flex flex-col gap-2 w-full md:w-1/2">
                    <label className="text-sm text-gray-600">Phone</label>


                    <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden bg-[#F8F8F8]">
                        {/* Flag */}
                        <div className="px-4 py-2 flex items-center gap-2 border-r border-[#E5E7EB] bg-white">
                            <img
                                src="https://flagcdn.com/w20/bd.png"
                                alt="BD Flag"
                                className="w-5 h-4 object-cover"
                            />
                            <span className="text-gray-700 text-sm">+880</span>
                        </div>


                        {/* Phone Number */}
                        <input
                            type="text"
                            placeholder=""
                            className="px-4 py-2 outline-none bg-transparent flex-1"
                        />


                        {/* Success Icon */}
                        <FaCheckCircle className="text-green-500 text-xl mr-3" />
                    </div>
                </div>
            </div>

            {/* Button */}
            <div className="mt-10 flex justify-center">
                <button className="bg-[#F26B2B] text-white font-semibold px-10 py-2 rounded-md hover:bg-[#e26227] transition">
                    UPDATE
                </button>
            </div>
        </div>
    );
};

export default UserProfile;