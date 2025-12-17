import { useRef, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { FiPhone } from "react-icons/fi";
import { useLoaderData } from "react-router-dom";
import { useSummary } from "../../../provider/SummaryProvider";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import dirhum from '../../../assets/icon/dirhum.png';
import { useQuery } from "@tanstack/react-query";
import { LuArrowLeft } from "react-icons/lu";


export default function BookingDetails() {
    const item = useLoaderData();
    const { mapLongitude, mapLatitude, serviceCharge, serviceFee, subTotal, vat, total } = useSummary();
    const [openInstructionsModal, setOpenInstructionsModal] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [instructions, setInstructions] = useState("");
    const [modalAddress, setModalAddress] = useState(false);
    const [modalPrice, setModalPrice] = useState(false);
    const [modalRescudle, setModalRescudle] = useState(false);
    const scrollerRef = useRef(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const handelReschudeleFun = () => {
        setModalRescudle(true);
    }

    const handleAddInstructions = () => {
        console.log("Instructions saved:", instructions);
        setOpenInstructionsModal(false);
        setInstructions("");
    }

    const handelAddressDetails = item => {
        setModalAddress(true);
        console.log(item);
    }

    const handelTotalPay = item => {
        setModalPrice(true);
        console.log(item);
    }

    // Extract address parts from the string
    const extractAddressParts = (addressString) => {
        if (!addressString) {
            return {
                apartmentNo: "",
                buildingName: "",
                area: "",
                city: "",
                type: "Apartment" // Default type
            };
        }

        // Split the address string by " - "
        const parts = addressString.split(" - ").map(part => part.trim());

        // Assign parts based on their position
        return {
            apartmentNo: parts[0] || "", // First part
            buildingName: parts[1] || "", // Second part
            area: parts[2] || "", // Third part
            city: parts[3] || "", // Fourth part (last part)
            type: "Apartment" // You mentioned it's Apartment type
        };
    };

    // Get address parts from the item data
    const addressParts = extractAddressParts(item?.Data?.address);

    const { data: dateTime, isLoading } = useQuery({
        queryKey: ['date-time-user'],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/date-time`);
            if (!res.ok) {
                throw new Error("Failed to fetch date-time");
            }
            return res.json();
        }
    });

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error("Date formatting error:", error);
            return dateString;
        }
    };

    // Prepare days data from API - Merge duplicate dates
    const getAvailableDays = () => {
        if (!dateTime?.Data || !Array.isArray(dateTime.Data)) {
            return [];
        }

        // Create a map to group by date
        const dateMap = new Map();

        dateTime.Data.forEach(item => {
            const date = item.date;
            const timeSlots = item.time || [];

            if (dateMap.has(date)) {
                // If date already exists, merge time slots
                const existing = dateMap.get(date);
                // Add unique time slots
                timeSlots.forEach(slot => {
                    if (!existing.timeSlots.includes(slot)) {
                        existing.timeSlots.push(slot);
                    }
                });
            } else {
                // If date doesn't exist, add new entry
                dateMap.set(date, {
                    id: item.id,
                    date: date,
                    short: formatDateForDisplay(date),
                    label: getFullDateLabel(date),
                    timeSlots: [...timeSlots] // Create a new array
                });
            }
        });

        // Convert map to array and sort by date
        const daysArray = Array.from(dateMap.values()).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        return daysArray;
    };

    const getFullDateLabel = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            console.error("Date formatting error:", error);
            return dateString;
        }
    };

    // Get available time slots for selected day
    const getAvailableTimes = () => {
        if (!selectedDay) return [];

        const selectedDayData = getAvailableDays().find(day => day.date === selectedDay);
        if (!selectedDayData || !selectedDayData.timeSlots) return [];

        // Sort time slots if needed
        return selectedDayData.timeSlots.sort((a, b) => {
            // Simple time comparison - you might want to improve this
            return a.localeCompare(b);
        });
    };

    const scroll = (dir) => {
        if (!scrollerRef.current) return;
        const amount = 200;

        scrollerRef.current.scrollBy({
            left: dir === "left" ? -amount : amount,
            behavior: "smooth"
        });
    };

    const availableDays = getAvailableDays();
    const availableTimes = getAvailableTimes();

    return (
        <div className="w-full min-h-screen p-4 flex justify-center items-start">
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl p-4 mt-10">
                {/* Booking confirmed */}
                <div className="shadow-md rounded-lg p-4 space-y-1.5 md:space-y-0  md:flex items-center md:justify-between bg-gray-50">
                    <div>
                        <p className="font-semibold">Booking confirmed</p>
                        <p className="text-sm text-gray-500">
                            Your booking is confirmed and will be delivered as per the booked date and time
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><FaUser /></div>
                            <p className="text-sm font-medium">Supreme P.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 text-gray-600 text-xl">
                        <button className="bg-[#01788E] p-2 rounded-full text-white cursor-pointer"><FiMessageCircle /></button>
                        <button className="bg-[#01788E] p-2 rounded-full text-white cursor-pointer"><FiPhone /></button>
                    </div>
                </div>

                {/* Rate Experience */}
                <div className="mt-6 shadow-md p-4 rounded-lg">
                    <p className="font-medium mb-2">Rate your experience:</p>
                    <div className="rating rating-md">
                        <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="1 star" />
                        <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="2 star" defaultChecked />
                        <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="3 star" />
                        <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="4 star" />
                        <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="5 star" />
                    </div>
                </div>

                {/* Job Details */}
                <div className="mt-6 shadow rounded-lg p-4">
                    <h2 className="font-semibold mb-2">Job Details</h2>

                    <div className="flex justify-between">
                        <p>Booking Ref.</p>
                        <p className="text-gray-500 font-medium">20251119000426MPDXB</p>
                    </div>

                    <div className="flex justify-between py-2">
                        <p>Start time</p>
                        <p className="text-gray-500 font-medium">{item?.Data?.date}, {item?.Data?.time}</p>
                    </div>

                    <div className="flex justify-between py-2">
                        <p>Address</p>
                        {/* <p className="text-gray-500">{address?.buildingName}</p> */}
                        <p onClick={() => handelAddressDetails(item)} className="flex items-center text-gray-500 cursor-pointer bg-gray-50 font-medium">{item?.Data?.address} <IoIosArrowForward className="text-xl" /></p>
                    </div>
                </div>

                {/* Service */}
                <div className="mt-6 rounded-lg p-4 shadow-md">
                    <h2 className="font-semibold mb-2">Service</h2>

                    <div className="flex justify-between py-2">
                        <p>Studio - General x 1</p>
                        <p className="text-gray-500">{item?.Data?.serviceName}</p>
                    </div>

                    <div className="flex justify-between py-2">
                        <p>Service Fee</p>
                        <p className="font-semibold flex items-center gap-1"><img src={dirhum} alt="" className="w-4 h-4" />{item.Data?.serviceFee}</p>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="mt-6 rounded-lg p-4 shadow-md">
                    <h2 className="font-semibold mb-2">Payment Summary</h2>

                    <div className="flex justify-between py-2">
                        <p>Payment method</p>
                        <p className="text-gray-500">{item?.Data?.paymentMethod}</p>
                    </div>

                    <div className="flex justify-between py-2">
                        <p>Total to Pay</p>
                        <p onClick={() => handelTotalPay(item)} className="font-semibold flex items-center cursor-pointer bg-gray-50"><img src={dirhum} alt="" className="w-4 h-4" />{item.Data?.totalPay}<IoIosArrowForward className="text-xl" /></p>
                    </div>
                </div>

                {/* Manage Booking */}
                <div className="flex justify-center mt-6">
                    <button onClick={() => setOpenModal(true)} className="bg-orange-600 text-white py-2 px-6 rounded-lg hover:bg-orange-700 transition">
                        Manage Booking
                    </button>
                </div>


                {/* Manage Booking Modal */}
                {openModal &&
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black bg-opacity-50"
                        onClick={() => setOpenModal(false)}
                    >
                        <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}>

                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <button className="text-gray-500 hover:text-gray-700 p-1" onClick={() => setOpenModal(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                    </svg>
                                </button>

                                <h2 className="text-lg font-semibold text-gray-800">
                                    Manage Booking
                                </h2>

                                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    Get Help
                                </a>
                            </div>

                            <div className="divide-y divide-gray-100">
                                <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800" onClick={handelReschudeleFun}>
                                    <div className="flex items-center space-x-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                                        </svg>
                                        <span className="text-base font-normal">Reschedule</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </div>

                                <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800" onClick={() => { setOpenModal(false); setOpenInstructionsModal(true); }}>
                                    <div className="flex items-center space-x-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                        </svg>
                                        <span className="text-base font-normal">Add instructions</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </div>

                                <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800">
                                    <div className="flex items-center space-x-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span className="text-base font-normal">Change address</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </div>

                                <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800">
                                    <div className="flex items-center space-x-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
                                        </svg>
                                        <span className="text-base font-normal">Change payment method</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </div>

                                <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-red-600">
                                    <div className="flex items-center space-x-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
                                        </svg>
                                        <span className="text-base font-normal">Cancel</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                }


                {/* Add Instructions Modal */}
                {openInstructionsModal &&
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                        onClick={() => setOpenInstructionsModal(false)}
                    >
                        <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}>

                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <button className="text-gray-500 hover:text-gray-700 p-1" onClick={() => setOpenInstructionsModal(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                    </svg>
                                </button>

                                <h2 className="text-lg font-semibold text-gray-800">
                                    Add Instructions
                                </h2>

                                <div className="w-6"></div> {/* Empty div for spacing */}
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Instructions
                                    </label>
                                    <textarea
                                        id="instructions"
                                        rows="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Please provide any additional instructions for the service provider..."
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        These instructions will be shared with your service provider.
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                        onClick={() => setOpenInstructionsModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                                        onClick={handleAddInstructions}
                                        disabled={!instructions.trim()}
                                    >
                                        Save Instructions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {/* ADDRESS MODAL - FIXED VERSION */}
                {modalAddress &&
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
                        onClick={() => setModalAddress(false)}
                    >
                        <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl overflow-hidden h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}>

                            {/* Header - Fixed height */}
                            <div className="shrink-0 flex items-center justify-center p-5 border-b border-gray-200 relative">
                                <button className="absolute right-4 cursor-pointer text-gray-500 hover:text-gray-700 p-1.5"
                                    onClick={() => setModalAddress(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                    </svg>
                                </button>

                                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                                    Address
                                </h2>
                            </div>

                            {/* Main content - Scrollable area */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                {/* Address details section - UPDATED */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">City</p>
                                        <p className="text-base font-medium text-gray-900">
                                            {addressParts.city || "Not specified"}
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">Type</p>
                                        <p className="text-base font-medium text-gray-900">
                                            {addressParts.type}
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">Area</p>
                                        <p className="text-base font-medium text-gray-900">
                                            {addressParts.area || "Not specified"}
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">Building Name</p>
                                        <p className="text-base font-medium text-gray-900">
                                            {addressParts.buildingName || "Not specified"}
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">Apartment No.</p>
                                        <p className="text-base font-medium text-gray-900">
                                            {addressParts.apartmentNo || "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                {/* Name and address section */}
                                <div className="space-y-2">
                                    <div className="w-full h-64 rounded-lg overflow-hidden shrink-0">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            loading="lazy"
                                            src={`https://www.google.com/maps?q=${mapLatitude},${mapLongitude}&z=16&output=embed`}
                                            style={{ pointerEvents: "none" }}
                                            title="Location Map"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {/* PRICE MODAL  */}
                {modalPrice &&
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
                        onClick={() => setModalPrice(false)}
                    >
                        <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl overflow-hidden h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}>

                            {/* Header - Fixed height */}
                            <div className="shrink-0 flex items-center justify-center p-5 border-b border-gray-200 relative">
                                <button className="absolute right-4 cursor-pointer text-gray-500 hover:text-gray-700 p-1.5"
                                    onClick={() => setModalPrice(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                    </svg>
                                </button>

                                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                                    Total to pay
                                </h2>
                            </div>

                            {/* Main content - Scrollable area */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                {/* Address details section */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">Service Charges</p>
                                        <p className="text-xl font-medium text-gray-900 flex items-center gap-1">
                                            <img src={dirhum} alt="" className="h-5 w-5" />
                                            {serviceCharge}
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">Cash on Delivery Charges</p>
                                        <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
                                            <img src={dirhum} alt="" className="h-5 w-5" />
                                            60
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">Service Fee</p>
                                        <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
                                            <img src={dirhum} alt="" className="h-5 w-5" />
                                            {serviceFee}
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">Discount</p>
                                        <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
                                            <img src={dirhum} alt="" className="h-5 w-5" />
                                            60
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">Sub Total</p>
                                        <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
                                            <img src={dirhum} alt="" className="h-5 w-5" />
                                            {subTotal}
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <p className="text-base text-gray-700">VAT (5%)</p>
                                        <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
                                            <img src={dirhum} alt="" className="h-5 w-5" />
                                            {vat}
                                        </p>
                                    </div>

                                    <div className="flex justify-between border-t pt-4 border-e-gray-200">
                                        <p className="text-base text-gray-700">Total to pay</p>
                                        <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
                                            <img src={dirhum} alt="" className="h-5 w-5" />
                                            {total}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {/* RESCHUDLE MODAL  */}
                {modalRescudle &&
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
                        onClick={() => setModalRescudle(false)}
                    >
                        <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl overflow-hidden h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between py-3 md:py-6 px-6 border-b">
                                <div onClick={() => setModalRescudle(false)} className="">
                                    <LuArrowLeft />
                                </div>
                                <p className="text-xl font-medium">Reschedule</p>
                                <p></p>
                            </div>
                            <div className="">
                                <div className="p-6 bg-white rounded-lg shadow-sm">

                                    {/* Day Selector */}
                                    <h3 className="text-lg font-semibold mb-4">
                                        Which day would you like us to come?
                                    </h3>
                                    {isLoading && <p>Loading...</p>}
                                    {availableDays.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-gray-600 font-medium">No available dates</p>
                                            <p className="text-sm text-gray-500 mt-1">Please check back later for available slots</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative max-w-[300px] mx-auto md:max-w-4xl">
                                                {/* Left Scroll Button */}
                                                <button
                                                    onClick={() => scroll("left")}
                                                    className="hidden absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 md:flex items-center justify-center"
                                                >
                                                    <IoIosArrowBack className="text-3xl font-bold" />
                                                </button>

                                                {/* Day List */}
                                                <div
                                                    ref={scrollerRef}
                                                    className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-10"
                                                >
                                                    {availableDays.map((day, index) => {
                                                        const isActive = selectedDay === day.date;

                                                        return (
                                                            <div
                                                                key={`${day.date}-${index}`}
                                                                onClick={() => setSelectedDay(day.date)}
                                                                className={`snap-start min-w-[100px] md:min-w-[85px] px-2 py-1 rounded-lg border cursor-pointer flex flex-col items-center gap-1 transition
                                                                                   ${isActive ? "bg-[#B2D7DE] border-transparent shadow" : "bg-white border-gray-200 hover:bg-gray-50"}
                                                                               `}
                                                            >
                                                                <div className="text-sm text-gray-600">{day.short}</div>
                                                                <div className="text-sm font-medium">{day.label}</div>
                                                                {day.timeSlots && day.timeSlots.length > 0 && (
                                                                    <div className="text-xs text-green-600 mt-1">
                                                                        {day.timeSlots.length} slot{day.timeSlots.length !== 1 ? 's' : ''}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Right Scroll Button */}
                                                <button
                                                    onClick={() => scroll("right")}
                                                    className="hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 md:flex items-center justify-center cursor-pointer"
                                                >
                                                    <IoIosArrowForward className="text-3xl font-bold" />
                                                </button>
                                            </div>

                                            {/* Time Selector */}
                                            {selectedDay && (
                                                <>
                                                    <h3 className="text-lg font-semibold mt-8 mb-4">
                                                        What time would you like us to arrive?
                                                    </h3>

                                                    {availableTimes.length === 0 ? (
                                                        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                                                            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <p className="text-gray-600">No time slots available for this date</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {availableTimes.map((timeSlot, index) => (
                                                                <button
                                                                    key={index}
                                                                    onClick={() => setSelectedTime(timeSlot)}
                                                                    className={`w-full text-left rounded-lg border px-6 py-4 transition
                                                                                       ${selectedTime === timeSlot ? "bg-[#E6F6F6] border-teal-300 shadow-sm" : "bg-white border-gray-200 hover:bg-gray-50"}
                                                                                   `}
                                                                >
                                                                    <span className="text-sm font-medium">{timeSlot}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Note */}
                                    <div className="mt-8 p-4 bg-gray-50 border rounded-md flex gap-4 text-sm text-gray-700">
                                        <svg className="w-5 h-5 text-gray-500 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z" strokeWidth="1.5" />
                                        </svg>

                                        <div>
                                            We can not guarantee the availability of the selected or preferred technician once the date/time of service is changed or any other changes are requested.
                                        </div>
                                    </div>
                                    <button className="w-full bg-[#ED6329] py-3 text-white font-medium mt-2.5 rounded-sm">Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};









// import { useState } from "react";
// import { FaUser } from "react-icons/fa";
// import { FiMessageCircle } from "react-icons/fi";
// import { FiPhone } from "react-icons/fi";
// import { useLoaderData, useNavigate } from "react-router-dom";
// import { useSummary } from "../../../provider/SummaryProvider";
// import { IoIosArrowForward } from "react-icons/io";
// import dirhum from '../../../assets/icon/dirhum.png';


// export default function BookingDetails() {
//     const item = useLoaderData();
//     const { mapLongitude, mapLatitude, serviceCharge, serviceFee, subTotal, vat, total } = useSummary();
//     const [openInstructionsModal, setOpenInstructionsModal] = useState(false);
//     const [openModal, setOpenModal] = useState(false);
//     const [instructions, setInstructions] = useState("");
//     const [modalAddress, setModalAddress] = useState(false);
//     const [modalPrice, setModalPrice] = useState(false);
//     const navigate = useNavigate();

//     const handelReschudeleFun = () => {
//         navigate('/date-time');
//     }

//     console.log(item);
//     const handleAddInstructions = () => {
//         console.log("Instructions saved:", instructions);
//         setOpenInstructionsModal(false);
//         setInstructions("");
//     }

//     const handelAddressDetails = item => {
//         setModalAddress(true);
//         console.log(item);
//     }

//     const handelTotalPay = item => {
//         setModalPrice(true);
//         console.log(item);
//     }

//     return (
//         <div className="w-full min-h-screen p-4 flex justify-center items-start">
//             <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl p-4 mt-10">
//                 {/* Booking confirmed */}
//                 <div className="shadow-md rounded-lg p-4 space-y-1.5 md:space-y-0  md:flex items-center md:justify-between bg-gray-50">
//                     <div>
//                         <p className="font-semibold">Booking confirmed</p>
//                         <p className="text-sm text-gray-500">
//                             Your booking is confirmed and will be delivered as per the booked date and time
//                         </p>
//                         <div className="flex items-center gap-2 mt-2">
//                             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><FaUser /></div>
//                             <p className="text-sm font-medium">Supreme P.</p>
//                         </div>
//                     </div>
//                     <div className="flex gap-3 text-gray-600 text-xl">
//                         <button className="bg-[#01788E] p-2 rounded-full text-white cursor-pointer"><FiMessageCircle /></button>
//                         <button className="bg-[#01788E] p-2 rounded-full text-white cursor-pointer"><FiPhone /></button>
//                     </div>
//                 </div>

//                 {/* Rate Experience */}
//                 <div className="mt-6 shadow-md p-4 rounded-lg">
//                     <p className="font-medium mb-2">Rate your experience:</p>
//                     <div className="rating rating-md">
//                         <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="1 star" />
//                         <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="2 star" defaultChecked />
//                         <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="3 star" />
//                         <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="4 star" />
//                         <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="5 star" />
//                     </div>
//                 </div>

//                 {/* Job Details */}
//                 <div className="mt-6 shadow rounded-lg p-4">
//                     <h2 className="font-semibold mb-2">Job Details</h2>

//                     <div className="flex justify-between">
//                         <p>Booking Ref.</p>
//                         <p className="text-gray-500 font-medium">20251119000426MPDXB</p>
//                     </div>

//                     <div className="flex justify-between py-2">
//                         <p>Start time</p>
//                         <p className="text-gray-500 font-medium">{item?.Data?.date}, {item?.Data?.time}</p>
//                     </div>

//                     <div className="flex justify-between py-2">
//                         <p>Address</p>
//                         {/* <p className="text-gray-500">{address?.buildingName}</p> */}
//                         <p onClick={() => handelAddressDetails(item)} className="flex items-center gap-2 text-gray-500 cursor-pointer bg-gray-50 px-2 font-medium">{item?.Data?.address} <IoIosArrowForward className="text-xl" /></p>
//                     </div>
//                 </div>

//                 {/* Service */}
//                 <div className="mt-6 rounded-lg p-4 shadow-md">
//                     <h2 className="font-semibold mb-2">Service</h2>

//                     <div className="flex justify-between py-2">
//                         <p>Studio - General x 1</p>
//                         <p className="text-gray-500">{item?.Data?.serviceName}</p>
//                     </div>

//                     <div className="flex justify-between py-2">
//                         <p>Service Fee</p>
//                         <p className="font-semibold flex items-center gap-1"><img src={dirhum} alt="" className="w-4 h-4" />{item.Data?.serviceFee}</p>
//                     </div>
//                 </div>

//                 {/* Payment Summary */}
//                 <div className="mt-6 rounded-lg p-4 shadow-md">
//                     <h2 className="font-semibold mb-2">Payment Summary</h2>

//                     <div className="flex justify-between py-2">
//                         <p>Payment method</p>
//                         <p className="text-gray-500">{item?.Data?.paymentMethod}</p>
//                     </div>

//                     <div className="flex justify-between py-2">
//                         <p>Total to Pay</p>
//                         <p onClick={() => handelTotalPay(item)} className="font-semibold flex items-center gap-1 cursor-pointer bg-gray-50 px-2"><img src={dirhum} alt="" className="w-4 h-4" />{item.Data?.totalPay}<IoIosArrowForward className="text-xl" /></p>
//                     </div>
//                 </div>

//                 {/* Manage Booking */}
//                 <div className="flex justify-center mt-6">
//                     <button onClick={() => setOpenModal(true)} className="bg-orange-600 text-white py-2 px-6 rounded-lg hover:bg-orange-700 transition">
//                         Manage Booking
//                     </button>
//                 </div>


//                 {/* Manage Booking Modal */}
//                 {openModal &&
//                     <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black bg-opacity-50"
//                         onClick={() => setOpenModal(false)}
//                     >
//                         <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
//                             onClick={(e) => e.stopPropagation()}>

//                             <div className="flex items-center justify-between p-4 border-b border-gray-200">
//                                 <button className="text-gray-500 hover:text-gray-700 p-1" onClick={() => setOpenModal(false)}>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
//                                         <path d="M18 6 6 18" /><path d="m6 6 12 12" />
//                                     </svg>
//                                 </button>

//                                 <h2 className="text-lg font-semibold text-gray-800">
//                                     Manage Booking
//                                 </h2>

//                                 <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
//                                     Get Help
//                                 </a>
//                             </div>

//                             <div className="divide-y divide-gray-100">
//                                 <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800" onClick={handelReschudeleFun}>
//                                     <div className="flex items-center space-x-4">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
//                                             <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
//                                         </svg>
//                                         <span className="text-base font-normal">Reschedule</span>
//                                     </div>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
//                                         <path d="m9 18 6-6-6-6" />
//                                     </svg>
//                                 </div>

//                                 <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800" onClick={() => { setOpenModal(false); setOpenInstructionsModal(true); }}>
//                                     <div className="flex items-center space-x-4">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
//                                             <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
//                                         </svg>
//                                         <span className="text-base font-normal">Add instructions</span>
//                                     </div>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
//                                         <path d="m9 18 6-6-6-6" />
//                                     </svg>
//                                 </div>

//                                 <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800">
//                                     <div className="flex items-center space-x-4">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
//                                             <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
//                                         </svg>
//                                         <span className="text-base font-normal">Change address</span>
//                                     </div>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
//                                         <path d="m9 18 6-6-6-6" />
//                                     </svg>
//                                 </div>

//                                 <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800">
//                                     <div className="flex items-center space-x-4">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
//                                             <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
//                                         </svg>
//                                         <span className="text-base font-normal">Change payment method</span>
//                                     </div>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
//                                         <path d="m9 18 6-6-6-6" />
//                                     </svg>
//                                 </div>

//                                 <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-red-600">
//                                     <div className="flex items-center space-x-4">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
//                                             <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
//                                         </svg>
//                                         <span className="text-base font-normal">Cancel</span>
//                                     </div>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
//                                         <path d="m9 18 6-6-6-6" />
//                                     </svg>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 }

//                 {/* Add Instructions Modal */}
//                 {openInstructionsModal &&
//                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//                         onClick={() => setOpenInstructionsModal(false)}
//                     >
//                         <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
//                             onClick={(e) => e.stopPropagation()}>

//                             <div className="flex items-center justify-between p-4 border-b border-gray-200">
//                                 <button className="text-gray-500 hover:text-gray-700 p-1" onClick={() => setOpenInstructionsModal(false)}>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
//                                         <path d="M18 6 6 18" /><path d="m6 6 12 12" />
//                                     </svg>
//                                 </button>

//                                 <h2 className="text-lg font-semibold text-gray-800">
//                                     Add Instructions
//                                 </h2>

//                                 <div className="w-6"></div> {/* Empty div for spacing */}
//                             </div>

//                             <div className="p-6">
//                                 <div className="mb-4">
//                                     <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
//                                         Additional Instructions
//                                     </label>
//                                     <textarea
//                                         id="instructions"
//                                         rows="6"
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         placeholder="Please provide any additional instructions for the service provider..."
//                                         value={instructions}
//                                         onChange={(e) => setInstructions(e.target.value)}
//                                     />
//                                     <p className="mt-1 text-sm text-gray-500">
//                                         These instructions will be shared with your service provider.
//                                     </p>
//                                 </div>

//                                 <div className="flex justify-end space-x-3">
//                                     <button
//                                         type="button"
//                                         className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
//                                         onClick={() => setOpenInstructionsModal(false)}
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         type="button"
//                                         className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
//                                         onClick={handleAddInstructions}
//                                         disabled={!instructions.trim()}
//                                     >
//                                         Save Instructions
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 }

//                 {/* ADDRESS MODAL  */}
//                 {modalAddress &&
//                     <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
//                         onClick={() => setModalAddress(false)}
//                     >
//                         <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl overflow-hidden h-[90vh] flex flex-col"
//                             onClick={(e) => e.stopPropagation()}>

//                             {/* Header - Fixed height */}
//                             <div className="shrink-0 flex items-center justify-center p-5 border-b border-gray-200 relative">
//                                 <button className="absolute right-4 cursor-pointer text-gray-500 hover:text-gray-700 p-1.5"
//                                     onClick={() => setModalAddress(false)}>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                         <path d="M18 6 6 18" /><path d="m6 6 12 12" />
//                                     </svg>
//                                 </button>

//                                 <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
//                                     Address
//                                 </h2>
//                             </div>

//                             {/* Main content - Scrollable area */}
//                             <div className="flex-1 overflow-y-auto px-6 py-5"> {/* flex-1 and overflow-y-auto added */}
//                                 {/* Address details section */}
//                                 <div className="space-y-4 mb-6">
//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">City</p>
//                                         <p className="text-base font-medium text-gray-900">Dubai</p>
//                                     </div>

//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">Type</p>
//                                         <p className="text-base font-medium text-gray-900">Apartment</p>
//                                     </div>

//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">Area</p>
//                                         <p className="text-base font-medium text-gray-900">him</p>
//                                     </div>

//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">Building Name</p>
//                                         <p className="text-base font-medium text-gray-900">vohn</p>
//                                     </div>

//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">Apartment No.</p>
//                                         <p className="text-base font-medium text-gray-900">gfh</p>
//                                     </div>
//                                 </div>

//                                 {/* Name and address section */}
//                                 <div className="space-y-2">
//                                     <div className="w-full h-64 rounded-lg overflow-hidden shrink-0"> {/* shrink-0 added for map */}
//                                         <iframe
//                                             width="100%"
//                                             height="100%"
//                                             loading="lazy"
//                                             src={`https://www.google.com/maps?q=${mapLatitude},${mapLongitude}&z=16&output=embed`}
//                                             style={{ pointerEvents: "none" }}
//                                         ></iframe>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 }

//                 {/* PRICE MODAL  */}
//                 {modalPrice &&
//                     <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
//                         onClick={() => setModalPrice(false)}
//                     >
//                         <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl overflow-hidden h-[90vh] flex flex-col"
//                             onClick={(e) => e.stopPropagation()}>

//                             {/* Header - Fixed height */}
//                             <div className="shrink-0 flex items-center justify-center p-5 border-b border-gray-200 relative">
//                                 <button className="absolute right-4 cursor-pointer text-gray-500 hover:text-gray-700 p-1.5"
//                                     onClick={() => setModalPrice(false)}>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                         <path d="M18 6 6 18" /><path d="m6 6 12 12" />
//                                     </svg>
//                                 </button>

//                                 <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
//                                     Total to pay
//                                 </h2>
//                             </div>

//                             {/* Main content - Scrollable area */}
//                             <div className="flex-1 overflow-y-auto px-6 py-5">
//                                 {/* Address details section */}
//                                 <div className="space-y-4 mb-6">
//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">Service Charges</p>
//                                         <p className="text-xl font-medium text-gray-900 flex items-center gap-1">
//                                             <img src={dirhum} alt="" className="h-5 w-5" />
//                                             {serviceCharge}
//                                         </p>
//                                     </div>

//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">Cash on Delivery Charges</p>
//                                         <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
//                                             <img src={dirhum} alt="" className="h-5 w-5" />
//                                             60
//                                         </p>
//                                     </div>

//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">Service Fee</p>
//                                         <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
//                                             <img src={dirhum} alt="" className="h-5 w-5" />
//                                             {serviceFee}
//                                         </p>
//                                     </div>

//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">Discount</p>
//                                         <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
//                                             <img src={dirhum} alt="" className="h-5 w-5" />
//                                             60
//                                         </p>
//                                     </div>

//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">Sub Total</p>
//                                         <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
//                                             <img src={dirhum} alt="" className="h-5 w-5" />
//                                             {subTotal}
//                                         </p>
//                                     </div>

//                                     <div className="flex justify-between">
//                                         <p className="text-base text-gray-700">VAT (5%)</p>
//                                         <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
//                                             <img src={dirhum} alt="" className="h-5 w-5" />
//                                             {vat}
//                                         </p>
//                                     </div>

//                                     <div className="flex justify-between border-t pt-4 border-e-gray-200">
//                                         <p className="text-base text-gray-700">Total to pay</p>
//                                         <p className="text-xl flex items-center gap-1 font-medium text-gray-900">
//                                             <img src={dirhum} alt="" className="h-5 w-5" />
//                                             {total}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 }
//             </div>
//         </div>
//     );
// };