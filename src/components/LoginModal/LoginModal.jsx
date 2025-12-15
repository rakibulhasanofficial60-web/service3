import { useEffect, useRef, useState } from "react";

const countries = [
    { name: "United Arab Emirates", code: "AE", dial: "+971" },
    { name: "Bangladesh", code: "BD", dial: "+880" },
    { name: "India", code: "IN", dial: "+91" },
    { name: "Pakistan", code: "PK", dial: "+92" },
    { name: "Saudi Arabia", code: "SA", dial: "+966" },
    { name: "United States", code: "US", dial: "+1" },
    { name: "United Kingdom", code: "GB", dial: "+44" },
];

export default function LoginModal({ open, onClose }) {
    const [selectedCountry, setSelectedCountry] = useState({
        name: "United Arab Emirates",
        code: "AE",
        dial: "+971",
    });

    const searchInputRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredCountries = countries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial.includes(search)
    );

    useEffect(() => {
        if (dropdownOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [dropdownOpen]);

    if (!open) return null;

    // -------------------------------
    // BACKDROP CLICK LOGIC
    // -------------------------------
    const onBackdropClick = () => {
        if (dropdownOpen) {
            setDropdownOpen(false); // 🔥 First click closes dropdown only
        } else {
            onClose(); // 🔥 Second click closes full modal
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onBackdropClick} // 🟧 Custom click logic
        >
            <div
                className="bg-white w-full max-w-md rounded-2xl shadow-lg relative p-6"
                onClick={(e) => e.stopPropagation()} // ❗ prevent closing on modal click
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-black cursor-pointer"
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold text-gray-900">
                    Log in or sign up
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                    Please enter your mobile number to proceed.
                </p>

                {/* Phone Number Field */}
                <div className="mt-5">
                    <label className="text-sm font-semibold text-gray-700">
                        Mobile Number
                    </label>

                    <div className="relative">
                        <div className="flex items-center mt-2 border rounded-xl bg-gray-50 px-3 py-3 gap-2">
                            {/* FLAG BUTTON */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownOpen(!dropdownOpen);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <img
                                    src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                                    className="w-6 h-4"
                                />
                                <span className="text-gray-700 font-medium">
                                    {selectedCountry.dial}
                                </span>
                            </button>

                            <span className="text-gray-300">|</span>

                            <input
                                type="tel"
                                placeholder="Phone Number"
                                className="flex-1 bg-transparent focus:outline-none text-gray-900"
                            />
                        </div>

                        {/* COUNTRY DROPDOWN */}
                        {dropdownOpen && (
                            <div className="absolute z-30 -mt-50 w-[70%] bg-white shadow-lg ml-14 max-h-96 overflow-auto">

                                {/* Search Input */}
                                <div className="p-3 sticky top-0 bg-white border-b">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search country"
                                        className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                {filteredCountries.map((c) => (
                                    <div
                                        key={c.code}
                                        onClick={() => {
                                            setSelectedCountry(c);
                                            setDropdownOpen(false);
                                            setSearch("");
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <img
                                            src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                                            className="w-6 h-4"
                                        />
                                        <span className="font-medium">{c.name}</span>
                                        <span className="text-gray-600 ml-auto">
                                            {c.dial}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button className="w-full mt-6 bg-[#F26822] text-white font-semibold py-3 rounded-xl hover:bg-[#e05c18] transition">
                    CONTINUE
                </button>
            </div>
        </div>
    );
}