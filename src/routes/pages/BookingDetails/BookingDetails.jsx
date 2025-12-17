import { useEffect, useRef, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { FiPhone } from "react-icons/fi";
import { useLoaderData } from "react-router-dom";
import { useSummary } from "../../../provider/SummaryProvider";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import dirhum from '../../../assets/icon/dirhum.png';
import { useQuery } from "@tanstack/react-query";
import { LuArrowLeft } from "react-icons/lu";
import { useForm } from "react-hook-form";


export default function BookingDetails() {
    const item = useLoaderData();
    const { mapLongitude, mapLatitude, serviceCharge, serviceFee, subTotal, vat, total } = useSummary();
    const [openInstructionsModal, setOpenInstructionsModal] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [instructions, setInstructions] = useState("");
    const [modalAddress, setModalAddress] = useState(false);
    const [modalPrice, setModalPrice] = useState(false);
    const [modalRescudle, setModalRescudle] = useState(false);
    const [modalPaymentMethod, setModalPaymentMethod] = useState(false);
    const scrollerRef = useRef(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [modalAddressUpdate, setModalAddressUpdate] = useState(false);
    const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(item?.Data?.paymentMethod || "Cash");
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        mode: "onChange"
    });

    const [selectedType, setSelectedType] = useState("Apartment");
    const buttons = ["Apartment", "Villa", "Office", "Other"];

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

    const handleChangePaymentMethod = () => {
        setModalPaymentMethod(true);
    }

    // Extract address parts from the string
    const extractAddressParts = (addressString) => {
        if (!addressString) {
            return {
                apartmentNo: "",
                buildingName: "",
                area: "",
                city: "",
                type: "Apartment"
            };
        }

        // Split the address string by " - "
        const parts = addressString.split(" - ").map(part => part.trim());

        return {
            apartmentNo: parts[0] || "",
            buildingName: parts[1] || "",
            area: parts[2] || "",
            city: parts[3] || "",
            type: "Apartment"
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

        const dateMap = new Map();

        dateTime.Data.forEach(item => {
            const date = item.date;
            const timeSlots = item.time || [];

            if (dateMap.has(date)) {
                const existing = dateMap.get(date);
                timeSlots.forEach(slot => {
                    if (!existing.timeSlots.includes(slot)) {
                        existing.timeSlots.push(slot);
                    }
                });
            } else {
                dateMap.set(date, {
                    id: item.id,
                    date: date,
                    short: formatDateForDisplay(date),
                    label: getFullDateLabel(date),
                    timeSlots: [...timeSlots]
                });
            }
        });

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

        return selectedDayData.timeSlots.sort((a, b) => {
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

    // Format display address
    const formatDisplayAddress = (type, data) => {
        switch (type) {
            case "Apartment":
            case "Office":
                return `${data.apartmentNo || ''} - ${data.buildingName || ''} - ${data.area || ''} - ${data.city || ''}`;

            case "Villa":
                return `${data.villaNo || ''} - ${data.community || ''} - ${data.area || ''} - ${data.city || ''}`;

            case "Other":
                return `${data.otherNo || ''} - ${data.streetName || ''} - ${data.area || ''} - ${data.city || ''}`;

            default:
                return `${data.area || ''} - ${data.city || ''}`;
        }
    };

    // Handle type change
    const handleTypeChange = (type) => {
        setSelectedType(type);
        // Reset related fields when type changes
        if (type === "Villa") {
            setValue("buildingName", "");
            setValue("apartmentNo", "");
        } else if (type === "Other") {
            setValue("buildingName", "");
            setValue("apartmentNo", "");
            setValue("community", "");
            setValue("villaNo", "");
        } else {
            setValue("community", "");
            setValue("villaNo", "");
            setValue("streetName", "");
            setValue("otherNo", "");
            setValue("nickname", "");
        }
    };

    // Handle address update submission
    const handleAddressUpdate = async (data) => {
        const bookingId = item?.Data?.id;

        if (!bookingId) {
            alert("Booking ID not found!");
            return false;
        }

        // Create the formatted address
        const formattedAddress = formatDisplayAddress(selectedType, data);

        const updateData = {
            address: formattedAddress
        };

        console.log("Updating address with data:", updateData);
        setIsUpdatingAddress(true);

        try {
            // Try different API endpoints
            const endpoints = [
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/userBooking/${bookingId}`,
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/${bookingId}`,
                `${import.meta.env.VITE_BACKEND_API_URL}/userBooking/${bookingId}`,
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/updateAddress/${bookingId}`
            ];

            let response = null;
            let success = false;

            for (const endpoint of endpoints) {
                try {
                    console.log("Trying endpoint:", endpoint);
                    response = await fetch(endpoint, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ address: formattedAddress }),
                    });

                    if (response.ok) {
                        success = true;
                        break;
                    }
                } catch (err) {
                    console.log("Failed with endpoint:", endpoint, err);
                }
            }

            if (success && response) {
                const result = await response.json();
                console.log("Address updated successfully:", result);
                alert("Address updated successfully!");
                setModalAddressUpdate(false);
            } else {
                alert("Failed to update address. Please try a different endpoint or contact support.");
            }
        } catch (error) {
            console.error("Error updating address:", error);
            alert("Network error. Please check your connection and try again.");
        } finally {
            setIsUpdatingAddress(false);
        }

        return true;
    };

    // Handle payment method update
    const handlePaymentMethodUpdate = async () => {
        const bookingId = item?.Data?.id;

        if (!bookingId) {
            alert("Booking ID not found!");
            return false;
        }

        console.log("Updating payment method to:", selectedPaymentMethod);
        setIsUpdatingPayment(true);

        try {
            // Try different API endpoints
            const endpoints = [
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/userBooking/${bookingId}`,
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/${bookingId}`,
                `${import.meta.env.VITE_BACKEND_API_URL}/userBooking/${bookingId}`,
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/updatePayment/${bookingId}`
            ];

            let response = null;
            let success = false;

            for (const endpoint of endpoints) {
                try {
                    console.log("Trying endpoint:", endpoint);
                    response = await fetch(endpoint, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            paymentMethod: selectedPaymentMethod
                        }),
                    });

                    if (response.ok) {
                        success = true;
                        break;
                    }
                } catch (err) {
                    console.log("Failed with endpoint:", endpoint, err);
                }
            }

            if (success && response) {
                const result = await response.json();
                console.log("Payment method updated successfully:", result);
                alert(`Payment method changed to ${selectedPaymentMethod} successfully!`);
                setModalPaymentMethod(false);
            } else {
                alert("Failed to update payment method. Please try a different endpoint or contact support.");
            }
        } catch (error) {
            console.error("Error updating payment method:", error);
            alert("Network error. Please check your connection and try again.");
        } finally {
            setIsUpdatingPayment(false);
        }
    };

    // Load current address into form when modal opens
    useEffect(() => {
        if (modalAddressUpdate && item?.Data?.address) {
            const parts = item.Data.address.split(" - ");
            if (parts.length >= 4) {
                const formData = {
                    apartmentNo: parts[0] || "",
                    buildingName: parts[1] || "",
                    area: parts[2] || "",
                    city: parts[3] || ""
                };

                // Set form values
                setValue("apartmentNo", formData.apartmentNo);
                setValue("buildingName", formData.buildingName);
                setValue("area", formData.area);
                setValue("city", formData.city);

                // Set type based on current address
                setSelectedType("Apartment");
            }
        }
    }, [modalAddressUpdate, item?.Data?.address, setValue]);

    // Reschedule function
    const handleRescheduleSubmit = async (id) => {
        const bookingId = id;

        if (!selectedDay) {
            alert("Please select a day");
            return;
        }

        if (!selectedTime) {
            alert("Please select a time slot");
            return;
        }

        const updatedData = {
            date: selectedDay,
            time: selectedTime,
        };

        console.log("Sending PATCH request for reschedule:", updatedData);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/userBooking/${bookingId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedData),
                }
            );

            console.log("Response status:", response.status);
            console.log("Response status text:", response.statusText);

            const data = await response.json();
            console.log("Response data:", data);

            if (response.ok) {
                console.log("Reschedule successful:", data);
                setModalRescudle(false);
                alert("Booking rescheduled successfully!");
            } else {
                console.error("Failed:", data);
                alert(`Failed to reschedule: ${data.message || `Error ${response.status}`}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Network error. Please check your connection and try again.");
        }
    };

    // Auto-select first date
    useEffect(() => {
        if (dateTime?.Data && dateTime.Data.length > 0 && !selectedDay) {
            const days = getAvailableDays();
            if (days.length > 0) {
                const firstDay = days[0].date;
                setSelectedDay(firstDay);
            }
        }
    }, [dateTime, selectedDay]);


    const handleUserUpdateBookingStatus = async (id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/update/${id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: 'Cancelled'
                    }),
                }
            );

            const data = await res.json();
            if (data.success) {
                alert("Booking cancel successfully!");
            } else {
                alert("Failed to Cancel booking");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong!");
        }
    };

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

                                <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800" onClick={() => setModalAddressUpdate(true)}>
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

                                <div className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-gray-800" onClick={handleChangePaymentMethod}>
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

                                <div onClick={() => handleUserUpdateBookingStatus(item?.Data?.id)} className="flex justify-between items-center py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors text-red-600">
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

                                <div className="w-6"></div>
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

                {/* ADDRESS MODAL - View Current Address */}
                {modalAddress &&
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
                        onClick={() => setModalAddress(false)}
                    >
                        <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl overflow-hidden h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}>

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

                            <div className="flex-1 overflow-y-auto px-6 py-5">
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

                {/* PRICE MODAL */}
                {modalPrice &&
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
                        onClick={() => setModalPrice(false)}
                    >
                        <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl overflow-hidden h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}>

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

                            <div className="flex-1 overflow-y-auto px-6 py-5">
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

                {/* RESCHEDULE MODAL - আগের design ই রাখা হয়েছে */}
                {modalRescudle &&
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
                        onClick={() => setModalRescudle(false)}
                    >
                        <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl 
                            h-[80vh] flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between py-3 md:py-6 px-6 border-b">
                                <div onClick={() => setModalRescudle(false)} className="">
                                    <LuArrowLeft />
                                </div>
                                <p className="text-xl font-medium">Reschedule</p>
                                <p></p>
                            </div>
                            <div className="flex-1 overflow-y-auto">
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
                                    <button onClick={() => handleRescheduleSubmit(item.Data.id)} className="w-full bg-[#ED6329] py-3 text-white font-medium mt-2.5 rounded-sm">Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {/* PAYMENT METHOD CHANGE MODAL */}
                {modalPaymentMethod &&
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
                        onClick={() => setModalPaymentMethod(false)}
                    >
                        <div className="relative w-full max-w-[500px] mx-4 bg-white rounded-lg shadow-xl overflow-hidden h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}>

                            <div className="flex items-center justify-between py-4 px-6 border-b">
                                <div onClick={() => setModalPaymentMethod(false)} className="cursor-pointer">
                                    <LuArrowLeft />
                                </div>
                                <p className="text-xl font-medium">Change Payment Method</p>
                                <div className="w-6"></div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                                    <p className="text-gray-600 mb-6">Current method: <span className="font-medium">{item?.Data?.paymentMethod || "Not specified"}</span></p>

                                    {/* Payment Method Options */}
                                    <div className="space-y-4">
                                        {["Cash", "Credit Card", "Debit Card", "Online Payment", "Wallet"].map((method) => (
                                            <div
                                                key={method}
                                                onClick={() => setSelectedPaymentMethod(method)}
                                                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedPaymentMethod === method
                                                    ? "bg-blue-50 border-blue-300 shadow-sm"
                                                    : "bg-white border-gray-200 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedPaymentMethod === method
                                                        ? "border-blue-500 bg-blue-500"
                                                        : "border-gray-300"
                                                        }`}>
                                                        {selectedPaymentMethod === method && (
                                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium">{method}</span>
                                                </div>

                                                {/* Payment Method Icons */}
                                                {method === "Credit Card" && (
                                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                )}
                                                {method === "Cash" && (
                                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                )}
                                                {method === "Online Payment" && (
                                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Note */}
                                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                                        <div className="flex gap-3">
                                            <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="1.5" />
                                            </svg>
                                            <div className="text-sm text-yellow-700">
                                                <p className="font-medium mb-1">Note:</p>
                                                <p>Changing payment method may affect the total amount due. Some payment methods may have additional fees.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="border-t p-6">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalPaymentMethod(false)}
                                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                                        disabled={isUpdatingPayment}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePaymentMethodUpdate}
                                        className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isUpdatingPayment}
                                    >
                                        {isUpdatingPayment ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </span>
                                        ) : "Update Payment Method"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {/* ADDRESS UPDATE MODAL */}
                {modalAddressUpdate &&
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
                        onClick={() => setModalAddressUpdate(false)}
                    >
                        <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl h-[80vh] flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between py-3 md:py-6 px-6 border-b">
                                <div onClick={() => setModalAddressUpdate(false)} className="cursor-pointer">
                                    <LuArrowLeft />
                                </div>
                                <p className="text-xl font-medium">Update Address</p>
                                <p></p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="bg-white rounded-xl shadow-lg w-full p-6">
                                    {/* TYPE BUTTONS */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {buttons.map(btn => (
                                            <button
                                                key={btn}
                                                onClick={() => handleTypeChange(btn)}
                                                type="button"
                                                className={`flex items-center px-4 py-2 rounded-full transition duration-300 border cursor-pointer
                                                    ${selectedType === btn ? "bg-teal-600 text-white shadow-md" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                                            >
                                                {btn}
                                            </button>
                                        ))}
                                    </div>

                                    {/* FORM */}
                                    <form onSubmit={handleSubmit(handleAddressUpdate)} className="space-y-6">
                                        {/* City */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1">City *</label>
                                            <input
                                                {...register("city", { required: "City is required" })}
                                                type="text"
                                                placeholder="Enter City"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                                        </div>

                                        {/* Area */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1">Area *</label>
                                            <input
                                                {...register("area", { required: "Area is required" })}
                                                type="text"
                                                placeholder="Enter Area"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                            {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>}
                                        </div>

                                        {/* Dynamic Fields */}
                                        {selectedType === "Villa" && (
                                            <>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-1">Community / Street Name *</label>
                                                    <input
                                                        {...register("community", { required: "Community is required" })}
                                                        type="text"
                                                        placeholder="Enter Community / Street Name"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />
                                                    {errors.community && <p className="text-red-500 text-sm mt-1">{errors.community.message}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-1">Villa No *</label>
                                                    <input
                                                        {...register("villaNo", { required: "Villa number is required" })}
                                                        type="text"
                                                        placeholder="Enter Villa Number"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />
                                                    {errors.villaNo && <p className="text-red-500 text-sm mt-1">{errors.villaNo.message}</p>}
                                                </div>
                                            </>
                                        )}

                                        {selectedType === "Other" && (
                                            <>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-1">Nickname *</label>
                                                    <input
                                                        {...register("nickname", { required: "Nickname is required" })}
                                                        type="text"
                                                        placeholder="Enter Nickname"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />
                                                    {errors.nickname && <p className="text-red-500 text-sm mt-1">{errors.nickname.message}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-1">Street / Building Name *</label>
                                                    <input
                                                        {...register("streetName", { required: "Street/Building name is required" })}
                                                        type="text"
                                                        placeholder="Enter Street / Building Name"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />
                                                    {errors.streetName && <p className="text-red-500 text-sm mt-1">{errors.streetName.message}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-1">Apartment / Villa No *</label>
                                                    <input
                                                        {...register("otherNo", { required: "Apartment/Villa number is required" })}
                                                        type="text"
                                                        placeholder="Enter Apartment / Villa No"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />
                                                    {errors.otherNo && <p className="text-red-500 text-sm mt-1">{errors.otherNo.message}</p>}
                                                </div>
                                            </>
                                        )}

                                        {selectedType !== "Villa" && selectedType !== "Other" && (
                                            <>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-1">Building Name *</label>
                                                    <input
                                                        {...register("buildingName", { required: "Building name is required" })}
                                                        type="text"
                                                        placeholder="Enter Building Name"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />
                                                    {errors.buildingName && <p className="text-red-500 text-sm mt-1">{errors.buildingName.message}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-1">Apartment No *</label>
                                                    <input
                                                        {...register("apartmentNo", { required: "Apartment number is required" })}
                                                        type="text"
                                                        placeholder="Enter Apartment No"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />
                                                    {errors.apartmentNo && <p className="text-red-500 text-sm mt-1">{errors.apartmentNo.message}</p>}
                                                </div>
                                            </>
                                        )}

                                        {/* Submit Buttons */}
                                        <div className="flex gap-3 pt-6 border-t">
                                            <button
                                                type="button"
                                                onClick={() => setModalAddressUpdate(false)}
                                                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                                                disabled={isUpdatingAddress}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-3 text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isUpdatingAddress}
                                            >
                                                {isUpdatingAddress ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Updating...
                                                    </span>
                                                ) : "Update Address"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};








// common modal section
// <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:items-center md:pt-0 bg-black/50"
//     onClick={() => setModalAddressUpdate(false)}
// >
//     <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-lg shadow-xl
//                             h-[80vh] flex flex-col overflow-hidden"
//         onClick={(e) => e.stopPropagation()}>
//         <div className="flex items-center justify-between py-3 md:py-6 px-6 border-b">
//             <div onClick={() => setModalAddressUpdate(false)} className="">
//                 <LuArrowLeft />
//             </div>
//             <p className="text-xl font-medium">Address Change</p>
//             <p></p>
//         </div>
//         <div className="flex-1 overflow-y-auto">


//         </div>
//     </div>
// </div>









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