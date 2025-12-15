import { useState } from "react";
import NextBtn from "../../../components/NextBtn/NextBtn";
import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
import { GoCreditCard } from "react-icons/go";
import { MdKeyboardArrowRight } from "react-icons/md";
import { PiMoneyWavy } from "react-icons/pi";
import { IoBagRemoveSharp, IoLocation } from "react-icons/io5";
import { FaCalendar } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import dirhum from "../../../assets/icon/color_dirhum.png";
import { SiTicktick } from "react-icons/si";
import { useSummary } from "../../../provider/SummaryProvider";
import dirhum1 from '../../../assets/icon/dirhum.png';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


export default function Confirmation() {
    const [openModal, setOpenModal] = useState(false);
    const { serviceCharge, serviceFee, subTotal, services, total, vat, date, time, mapLongitude, mapLatitude, liveAddress, itemSummary } = useSummary();

    const [paymentMethod, setPaymentMethod] = useState("");
    const navigate = useNavigate();
    const ides = itemSummary.map(p => p.id);

    const REQUIRED_FIELDS = [
        "propertyItemIds",
        "serviceName",
        "address",
        "serviceFee",
        "subTotal",
        "vat",
        "totalPay",
        "date",
        "time",
        "paymentMethod",
    ];

    const isPayloadValid = (payload) => {
        for (const key of REQUIRED_FIELDS) {
            const value = payload[key];

            if (
                value === null ||
                value === undefined ||
                value === "" ||
                (Array.isArray(value) && value.length === 0)
            ) {
                return { isValid: false, missingField: key };
            }
        }
        return { isValid: true };
    };


    const getDisplayAddress = () => {
        if (!liveAddress) return null;

        if (liveAddress.displayAddress) {
            return liveAddress.displayAddress;
        }

        switch (liveAddress.type) {
            case "Apartment":
            case "Office":
                return `${liveAddress.apartmentNo || ''} - ${liveAddress.buildingName || ''} - ${liveAddress.area || ''} - ${liveAddress.city || ''}`;

            case "Villa":
                return `${liveAddress.villaNo || ''} - ${liveAddress.community || ''} - ${liveAddress.area || ''} - ${liveAddress.city || ''}`;

            case "Other":
                return `${liveAddress.otherNo || ''} - ${liveAddress.streetName || ''} - ${liveAddress.area || ''} - ${liveAddress.city || ''}`;

            default:
                return `${liveAddress.area || ''} - ${liveAddress.city || ''}`;
        }
    };

    const handelBookingConfirmation = async () => {
        const displayAddress = getDisplayAddress();
        
        if (!displayAddress || displayAddress.trim() === "") {
            toast.error("Please add an address first");
            return false;
        }

        if (!paymentMethod) {
            toast.error("Please select a payment method");
            return false;
        }

        // Map to backend enum values
        const mappedPaymentMethod = paymentMethod === "Cash" ? "CashOnDelivery" : "Card";

        const payload = {
            propertyItemIds: ides,
            serviceName: services[0]?.title || "",
            address: displayAddress,
            offer: "30% off",
            serviceFee: Number(serviceCharge) || 0,
            discount: 30,
            subTotal: Number(total) || 0,
            vat: Number(vat) || 0,
            totalPay: mappedPaymentMethod === "CashOnDelivery" ? Number(total) + 5 : Number(total),
            date: date || "",
            time: time || "",
            paymentMethod: mappedPaymentMethod, // Use exact enum value
        };
        
        // Debug log
        console.log("Payload to send:", payload);

        const validation = isPayloadValid(payload);
        if (!validation.isValid) {
            const fieldName = validation.missingField === "propertyItemIds" ? "Service Items" :
                            validation.missingField === "serviceName" ? "Service Name" :
                            validation.missingField === "address" ? "Address" :
                            validation.missingField === "serviceFee" ? "Service Fee" :
                            validation.missingField === "subTotal" ? "Sub Total" :
                            validation.missingField === "vat" ? "VAT" :
                            validation.missingField === "totalPay" ? "Total Pay" :
                            validation.missingField === "date" ? "Date" :
                            validation.missingField === "time" ? "Time" :
                            validation.missingField === "paymentMethod" ? "Payment Method" : "Required field";
            
            toast.error(`Please complete: ${fieldName}`);
            return false;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/create`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const responseData = await response.json();
            console.log("API Response:", responseData);

            if (!response.ok) {
                if (responseData.message) {
                    toast.error(`Booking failed: ${responseData.message}`);
                } else {
                    toast.error("Booking failed. Please try again.");
                }
                return false;
            }

            toast.success("Booking sent successfully!");
            navigate("/booking-success");
            return true;

        } catch (error) {
            console.error("Booking error:", error);
            toast.error("Something went wrong. Please try again.");
            return false;
        }
    };


    return (
        <div className="pb-24">
            <div className="mt-14 md:mt-0">
                <ServiceDetails title="Review & Confirm" currentStep={4} />
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-5 md:p-7 text-[#4E4E4E]">
                <h2 className="text-lg font-semibold mb-4">Booking Details</h2>

                <div className="flex items-start gap-3 mb-3">
                    <IoBagRemoveSharp className="text-2xl" />
                    <p className="font-medium">{services[0]?.title}</p>
                </div>

                <div className="flex items-start gap-3 mb-3">
                    <FaCalendar className="text-2xl" />
                    <p className="font-medium">{date}, between {time}</p>
                </div>

                {/* address  */}
                <div className="flex items-start gap-3 mb-3">
                    <IoLocation className="text-2xl" />
                    <p className="font-medium">{getDisplayAddress() || "No address provided"}</p>
                </div>

                {/* map hare  */}
                <div className="w-full h-64 rounded-lg overflow-hidden">
                    <iframe
                        width="100%"
                        height="100%"
                        loading="lazy"
                        src={`https://www.google.com/maps?q=${mapLatitude},${mapLongitude}&z=16&output=embed`}
                        style={{ pointerEvents: "none" }}
                    ></iframe>
                </div>

                <div className="h-4 w-full my-8 bg-[#F5F5F5]"></div>
                <h2 className="text-lg font-semibold mb-3">Offers</h2>
                <div className="flex items-center justify-between p-3 bg-[#FDFDFD]">
                    <div className="text-sm font-medium text-gray-600 flex items-center gap-2">Discount</div>

                    <div className="flex items-center gap-2.5 text-[#ff7a00]">
                        <div className="text-[15px] bg-[#FCDFD5] text-[#ED6329] px-3 py-1 rounded-lg font-semibold flex items-center gap-1">
                            <img className="h-4 w-4 filter invert sepia saturate-200 hue-rotate-20" src={dirhum} />
                            30% off
                        </div>
                        <SiTicktick className="text-xl" />
                    </div>

                    <RxCrossCircled className="text-xl text-[#007C92] cursor-pointer" />
                </div>

                <h2 className="text-lg font-semibold mt-6 mb-3">Pay with</h2>

                <div className="space-y-3">
                    {/* ADD NEW CARD */}
                    <div
                        onClick={() => {
                            setOpenModal(true);
                            setPaymentMethod("Card");
                        }}
                        className="border rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <GoCreditCard className="text-xl text-[#1f8bf0]" />
                            <span className="font-medium">Add New Card</span>
                        </div>
                        <MdKeyboardArrowRight className="text-xl text-gray-400" />
                    </div>

                    {/* CASH ON DELIVERY */}
                    <div
                        onClick={() => setPaymentMethod("Cash")}
                        className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer
                        ${paymentMethod === "Cash" ? "border-orange-500 bg-orange-50" : "hover:bg-gray-50"}`}
                    >
                        <div className="flex items-center gap-3">
                            <PiMoneyWavy className="text-xl text-green-600" />
                            <span className="font-medium">Cash On Delivery</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="bg-orange-200 text-orange-600 text-xs px-2 py-1 rounded-md">+5%</span>

                            {/* RADIO */}
                            <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === "Cash"}
                                onChange={() => setPaymentMethod("Cash")}
                                className="h-4 w-4 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* PAYMENT SUMMARY */}
                <h2 className="text-lg font-semibold mt-6 mb-3">Payment Summary</h2>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="font-medium">Service Charges</span>
                        <span className="font-medium flex items-center gap-1">
                            <img className="h-3 w-3" src={dirhum1} />{serviceCharge}
                        </span>
                    </div>

                    {paymentMethod === "Cash" && (
                        <div className="flex justify-between">
                            <span className="font-medium">Cash On Delivery Charge</span>
                            <span className="font-medium flex items-center gap-1">
                                <img className="h-3 w-3" src={dirhum1} />5.00
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="font-medium">Service Fee</span><span className="font-medium flex items-center gap-1"><img className="h-3 w-3" src={dirhum1} />{serviceFee}</span>
                    </div>

                    {/* <div className="flex justify-between font-semibold">
                        <span>Discount</span>
                        <span className="flex items-center gap-1">
                            <img className="h-3 w-3" src={dirhum1} />30.00
                        </span>
                    </div> */}

                    <div className="flex justify-between items-center">
                        <span className="font-medium">Sub Total</span>
                        <span className="font-medium flex items-center gap-1">
                            <img className="h-3 w-3" src={dirhum1} />{subTotal}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">VAT (5%)</span>
                        <span className="font-medium flex items-center gap-1">
                            <img className="h-3 w-3" src={dirhum1} />{vat}
                        </span>
                    </div>

                    <hr className="my-3" />

                    {/* FINAL TOTAL (COD adds +5) */}
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total to pay</span>
                        <span className="flex items-center gap-1">
                            <img className="h-4 w-4 mt-[3px]" src={dirhum1} /> {paymentMethod === "Cash" ? Number(total) + 5 : total}
                        </span>
                    </div>
                </div>
            </div>

            <NextBtn onClick={handelBookingConfirmation} name="Book Now" />

            {/* MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 relative">
                        <button
                            onClick={() => setOpenModal(false)}
                            className="absolute cursor-pointer right-4 top-4 text-gray-500 text-2xl"
                        >
                            ×
                        </button>

                        <h2 className="text-center text-xl font-semibold mb-6">Add New Card</h2>

                        <label className="block text-sm font-medium mb-1">Card Holder Name</label>
                        <input type="text" placeholder="Enter Name" className="w-full border rounded-xl px-4 py-3 mb-4" />

                        <label className="block text-sm font-medium mb-1">Card Number</label>
                        <input type="text" placeholder="Enter Number" className="w-full border rounded-xl px-4 py-3 mb-4" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Expiry</label>
                                <input type="text" placeholder="MM/YY" className="w-full border rounded-xl px-4 py-3" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">CVV</label>
                                <input type="text" placeholder="CVV" className="w-full border rounded-xl px-4 py-3" />
                            </div>
                        </div>

                        <div className="flex items-center bg-gray-100 text-gray-600 text-sm p-3 rounded-xl mt-5">
                            <span className="mr-2">⚠️</span>
                            We will reserve and release ₱1 to confirm your Card.
                        </div>

                        <button 
                            onClick={() => {
                                setPaymentMethod("Card");
                                setOpenModal(false);
                            }}
                            className="w-full cursor-pointer bg-orange-500 text-white py-3 rounded-xl font-semibold mt-6"
                        >
                            SELECT CARD PAYMENT
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};





// import { useState } from "react";
// import NextBtn from "../../../components/NextBtn/NextBtn";
// import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
// import { GoCreditCard } from "react-icons/go";
// import { MdKeyboardArrowRight } from "react-icons/md";
// import { PiMoneyWavy } from "react-icons/pi";
// import { IoBagRemoveSharp, IoLocation } from "react-icons/io5";
// import { FaCalendar } from "react-icons/fa";
// import { RxCrossCircled } from "react-icons/rx";
// import dirhum from "../../../assets/icon/color_dirhum.png";
// import { SiTicktick } from "react-icons/si";
// import { useSummary } from "../../../provider/SummaryProvider";
// import dirhum1 from '../../../assets/icon/dirhum.png';
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";


// export default function Confirmation() {
//     const [openModal, setOpenModal] = useState(false);
//     const { serviceCharge, serviceFee, subTotal, services, total, vat, date, time, mapLongitude, mapLatitude, liveAddress, itemSummary } = useSummary();

//     const [paymentMethod, setPaymentMethod] = useState("");
//     const navigate = useNavigate();
//     const ides = itemSummary.map(p => p.id);

//     const REQUIRED_FIELDS = [
//         "propertyItemIds",
//         "serviceName",
//         "address",
//         "serviceFee",
//         "subTotal",
//         "vat",
//         "totalPay",
//         "date",
//         "time",
//         "paymentMethod",
//     ];

//     const isPayloadValid = (payload) => {
//         for (const key of REQUIRED_FIELDS) {
//             const value = payload[key];

//             if (
//                 value === null ||
//                 value === undefined ||
//                 value === "" ||
//                 (Array.isArray(value) && value.length === 0)
//             ) {
//                 return false;
//             }
//         }
//         return true;
//     };


//     const getDisplayAddress = () => {
//         if (!liveAddress) return "No address provided";

//         if (liveAddress.displayAddress) {
//             return liveAddress.displayAddress;
//         }

//         switch (liveAddress.type) {
//             case "Apartment":
//             case "Office":
//                 return `${liveAddress.apartmentNo || ''} - ${liveAddress.buildingName || ''} - ${liveAddress.area || ''} - ${liveAddress.city || ''}`;

//             case "Villa":
//                 return `${liveAddress.villaNo || ''} - ${liveAddress.community || ''} - ${liveAddress.area || ''} - ${liveAddress.city || ''}`;

//             case "Other":
//                 return `${liveAddress.otherNo || ''} - ${liveAddress.streetName || ''} - ${liveAddress.area || ''} - ${liveAddress.city || ''}`;

//             default:
//                 return `${liveAddress.area || ''} - ${liveAddress.city || ''}`;
//         }
//     };

//     const handelBookingConfirmation = async () => {
//         const payload = {
//             propertyItemIds: ides,
//             serviceName: services[0]?.title || "",
//             address: getDisplayAddress(),
//             offer: "30% off",
//             serviceFee: Number(serviceCharge) || 0,
//             discount: 30,
//             subTotal: Number(total) || 0,
//             vat: Number(vat) || 0,
//             totalPay: paymentMethod === "Card" ? Number(total) + 5 : Number(total),
//             date: date || "",
//             time: time || "",
//             paymentMethod: paymentMethod || "",
//         };
        
//         if (!isPayloadValid(payload)) {
//             toast.error("Please complete all required information before booking.");
//             return false;
//         }

//         try {
//             const response = await fetch(
//                 `${import.meta.env.VITE_BACKEND_API_URL}/booking/create`,
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(payload),
//                 }
//             );

//             if (!response.ok) {
//                 toast.error("Booking failed. Please try again.");
//                 return false;
//             }

//             toast.success("Booking sent successfully!");
//             navigate("/booking-success");
//             return true;

//         } catch (error) {
//             console.error("Booking error:", error);
//             toast.error("Something went wrong. Please try again.");
//             return false;
//         }
//     };


//     return (
//         <div className="pb-24">
//             <div className="mt-14 md:mt-0">
//                 <ServiceDetails title="Review & Confirm" currentStep={4} />
//             </div>

//             <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-5 md:p-7 text-[#4E4E4E]">
//                 <h2 className="text-lg font-semibold mb-4">Booking Details</h2>

//                 <div className="flex items-start gap-3 mb-3">
//                     <IoBagRemoveSharp className="text-2xl" />
//                     <p className="font-medium">{services[0]?.title}</p>
//                 </div>

//                 <div className="flex items-start gap-3 mb-3">
//                     <FaCalendar className="text-2xl" />
//                     <p className="font-medium">{date}, between {time}</p>
//                 </div>

//                 {/* address  */}
//                 <div className="flex items-start gap-3 mb-3">
//                     <IoLocation className="text-2xl" />
//                     <p className="font-medium">{getDisplayAddress()}</p>
//                 </div>

//                 {/* map hare  */}
//                 <div className="w-full h-64 rounded-lg overflow-hidden">
//                     <iframe
//                         width="100%"
//                         height="100%"
//                         loading="lazy"
//                         src={`https://www.google.com/maps?q=${mapLatitude},${mapLongitude}&z=16&output=embed`}
//                         style={{ pointerEvents: "none" }}
//                     ></iframe>
//                 </div>

//                 <div className="h-4 w-full my-8 bg-[#F5F5F5]"></div>
//                 <h2 className="text-lg font-semibold mb-3">Offers</h2>
//                 <div className="flex items-center justify-between p-3 bg-[#FDFDFD]">
//                     <div className="text-sm font-medium text-gray-600 flex items-center gap-2">Discount</div>

//                     <div className="flex items-center gap-2.5 text-[#ff7a00]">
//                         <div className="text-[15px] bg-[#FCDFD5] text-[#ED6329] px-3 py-1 rounded-lg font-semibold flex items-center gap-1">
//                             <img className="h-4 w-4 filter invert sepia saturate-200 hue-rotate-20" src={dirhum} />
//                             30% off
//                         </div>
//                         <SiTicktick className="text-xl" />
//                     </div>

//                     <RxCrossCircled className="text-xl text-[#007C92] cursor-pointer" />
//                 </div>

//                 <h2 className="text-lg font-semibold mt-6 mb-3">Pay with</h2>

//                 <div className="space-y-3">
//                     {/* ADD NEW CARD */}
//                     <div
//                         onClick={() => {
//                             setOpenModal(true);
//                             setPaymentMethod("Card");
//                         }}
//                         className="border rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
//                     >
//                         <div className="flex items-center gap-3">
//                             <GoCreditCard className="text-xl text-[#1f8bf0]" />
//                             <span className="font-medium">Add New Card</span>
//                         </div>
//                         <MdKeyboardArrowRight className="text-xl text-gray-400" />
//                     </div>

//                     {/* CASH ON DELIVERY */}
//                     <div
//                         onClick={() => setPaymentMethod("Card")}
//                         className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer
//                         ${paymentMethod === "Card" ? "border-orange-500 bg-orange-50" : "hover:bg-gray-50"}`}
//                     >
//                         <div className="flex items-center gap-3">
//                             <PiMoneyWavy className="text-xl text-green-600" />
//                             <span className="font-medium">Cash On Delivery</span>
//                         </div>

//                         <div className="flex items-center gap-3">
//                             <span className="bg-orange-200 text-orange-600 text-xs px-2 py-1 rounded-md">+5%</span>

//                             {/* RADIO */}
//                             <input
//                                 type="radio"
//                                 name="payment"
//                                 checked={paymentMethod === "Card"}
//                                 onChange={() => setPaymentMethod("Card")}
//                                 className="h-4 w-4 cursor-pointer"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* PAYMENT SUMMARY */}
//                 <h2 className="text-lg font-semibold mt-6 mb-3">Payment Summary</h2>

//                 <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                         <span className="font-medium">Service Charges</span>
//                         <span className="font-medium flex items-center gap-1">
//                             <img className="h-3 w-3" src={dirhum1} />{serviceCharge}
//                         </span>
//                     </div>

//                     {paymentMethod === "Card" && (
//                         <div className="flex justify-between">
//                             <span className="font-medium">Cash On Delivery Charge</span>
//                             <span className="font-medium flex items-center gap-1">
//                                 <img className="h-3 w-3" src={dirhum1} />5.00
//                             </span>
//                         </div>
//                     )}

//                     <div className="flex justify-between">
//                         <span className="font-medium">Service Fee</span><span className="font-medium flex items-center gap-1"><img className="h-3 w-3" src={dirhum1} />{serviceFee}</span>
//                     </div>

//                     {/* <div className="flex justify-between font-semibold">
//                         <span>Discount</span>
//                         <span className="flex items-center gap-1">
//                             <img className="h-3 w-3" src={dirhum1} />30.00
//                         </span>
//                     </div> */}

//                     <div className="flex justify-between items-center">
//                         <span className="font-medium">Sub Total</span>
//                         <span className="font-medium flex items-center gap-1">
//                             <img className="h-3 w-3" src={dirhum1} />{subTotal}
//                         </span>
//                     </div>

//                     <div className="flex justify-between items-center">
//                         <span className="font-medium">VAT (5%)</span>
//                         <span className="font-medium flex items-center gap-1">
//                             <img className="h-3 w-3" src={dirhum1} />{vat}
//                         </span>
//                     </div>

//                     <hr className="my-3" />

//                     {/* FINAL TOTAL (COD adds +5) */}
//                     <div className="flex justify-between text-lg font-bold">
//                         <span>Total to pay</span>
//                         <span className="flex items-center gap-1">
//                             <img className="h-4 w-4 mt-[3px]" src={dirhum1} /> {paymentMethod === "Card" ? Number(total) + 5 : total}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             <NextBtn onClick={handelBookingConfirmation} name="Book Now" />

//             {/* MODAL */}
//             {openModal && (
//                 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 relative">
//                         <button
//                             onClick={() => setOpenModal(false)}
//                             className="absolute cursor-pointer right-4 top-4 text-gray-500 text-2xl"
//                         >
//                             ×
//                         </button>

//                         <h2 className="text-center text-xl font-semibold mb-6">Add New Card</h2>

//                         <label className="block text-sm font-medium mb-1">Card Holder Name</label>
//                         <input type="text" placeholder="Enter Name" className="w-full border rounded-xl px-4 py-3 mb-4" />

//                         <label className="block text-sm font-medium mb-1">Card Number</label>
//                         <input type="text" placeholder="Enter Number" className="w-full border rounded-xl px-4 py-3 mb-4" />

//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium mb-1">Expiry</label>
//                                 <input type="text" placeholder="MM/YY" className="w-full border rounded-xl px-4 py-3" />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-1">CVV</label>
//                                 <input type="text" placeholder="CVV" className="w-full border rounded-xl px-4 py-3" />
//                             </div>
//                         </div>

//                         <div className="flex items-center bg-gray-100 text-gray-600 text-sm p-3 rounded-xl mt-5">
//                             <span className="mr-2">⚠️</span>
//                             We will reserve and release ₱1 to confirm your Card.
//                         </div>

//                         <button className="w-full cursor-pointer bg-orange-500 text-white py-3 rounded-xl font-semibold mt-6">
//                             BOOK NOW
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };