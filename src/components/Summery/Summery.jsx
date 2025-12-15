import { useState } from "react";
import dirhum from "../../assets/icon/dirhum.png";
import NextBtn from "../NextBtn/NextBtn";
import { useItem } from "../../provider/ItemProvider";

export default function Summery({ total, showInput, setShowInput, vat, subTotal, itemSummary, serviceCharge, address, date, time, serviceTitle, liveAddress }) {
    const [promo, setPromo] = useState("");
    const [open, setOpen] = useState(false);
    const { removeItem } = useItem();

    const handleApply = () => {
        if (promo.trim() === "") {
            alert("Please enter a promo code!");
            return;
        }
        setPromo("");
        setShowInput(false);
    };

    return (
        <>
            {/* DESKTOP SUMMARY */}
            <div className="hidden md:block w-[35%] text-gray-600 sticky top-20 self-start shadow-md rounded-md">
                <div className="p-4">
                    <h2 className="text-xl font-medium mb-1.5">Summary</h2>

                    {/* Service Details */}
                    <div className="border-b border-gray-400 pb-1.5">
                        <h3 className="font-semibold text-sm mb-2">Service Details</h3>
                        <ul className="space-y-1">
                            {itemSummary.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-2 hover:shadow-md transition-all"
                                >
                                    <li className="flex justify-between items-center text-sm">
                                        {/* Remove button */}
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:bg-red-100 rounded-full px-2 py-0.5 text-xs font-semibold transition"
                                        >
                                            x
                                        </button>

                                        {/* Title */}
                                        <span className="font-medium text-[14px] text-gray-700 flex-1 mx-3">
                                            {item.title} — {serviceTitle[index]} × 1
                                        </span>

                                        {/* Price */}
                                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                                            <img src={dirhum} alt="" className="w-3.5 h-3.5" />
                                            {item.price}
                                        </span>
                                    </li>
                                </div>
                            ))}
                        </ul>
                    </div>

                    {/* Date & Time */}
                    <div className="border-b border-gray-400 mt-2">
                        <h3 className="font-semibold text-sm mb-2">Date & Time</h3>
                        {(date || time) && (
                            <div className="space-y-1">
                                {date && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-[15px] font-semibold text-gray-700">Date</p>
                                        <p className="text-[15px] font-semibold text-gray-700">{date}</p>
                                    </div>
                                )}
                                {time && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-[15px] font-semibold text-gray-700">Time</p>
                                        <p className="text-[15px] font-semibold text-gray-700">{time}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Address Section - DESKTOP */}
                    {(liveAddress || (address && address.length > 0)) && (
                        <div className="border-b border-gray-400 mt-2">
                            <h3 className="font-semibold text-[16px] mb-2">Address</h3>
                            <div className="text-[16px] text-gray-700">
                                {address}
                            </div>
                        </div>
                    )}

                    {/* Discount Section */}
                    <div className="mt-2 border-gray-400">
                        <h2 className="font-semibold text-sm mb-2.5">Payment Details</h2>
                        {!showInput && (
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold">Discount</h3>
                                <h3 className="text-[13px] cursor-pointer font-semibold text-[#01788E] underline" onClick={() => setShowInput(true)}>
                                    Apply Promo
                                </h3>
                            </div>
                        )}

                        {showInput && (
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={promo}
                                    onChange={(e) => setPromo(e.target.value)}
                                    placeholder="Enter Promo Discount"
                                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-[11px] focus:ring-2 focus:ring-[#01788E] outline-none"
                                />
                                <button
                                    onClick={handleApply}
                                    className="bg-[#01788E] text-white text-[11px] px-3 py-1 rounded-md hover:opacity-90 transition"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Charges */}
                    {itemSummary.length > 0 && (
                        <div className="mt-2 border-b border-gray-400 pb-3 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold">Service Charges</span>
                                <span className="flex items-center gap-1 font-semibold">
                                    <img src={dirhum} className="w-3.5 h-3.5" /> {serviceCharge}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="font-semibold">Sub Total</span>
                                <span className="flex items-center gap-1 font-semibold">
                                    <img src={dirhum} className="w-3.5 h-3.5" /> {subTotal}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="font-semibold">VAT (5%)</span>
                                <span className="flex items-center gap-1 font-semibold">
                                    <img src={dirhum} className="w-3.5 h-3.5" /> {vat}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="mt-2 flex justify-between items-center">
                        <h3 className="font-semibold">Total To Pay</h3>
                        <p className="gap-2 text-[17px]">
                            <span className="font-bold flex items-center">
                                <img className="h-[17px] w-[17px] mt-[3px]" src={dirhum} /> {total}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* MOBILE BOTTOM BAR */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-2px_6px_rgba(0,0,0,0.15)] px-3 flex items-center justify-between z-50">
                <div onClick={() => setOpen(true)} className="cursor-pointer select-none">
                    <p className="text-[12px] line-through text-gray-400">৳ {(total + serviceCharge + vat).toFixed(2)}</p>
                    <p className="text-[20px] font-bold flex items-center gap-1 text-gray-700">
                        <img src={dirhum} className="w-4 h-4" /> {total.toFixed(2)}
                        <span className="text-[18px]">^</span>
                    </p>
                </div>

                <NextBtn />
            </div>

            {/* MOBILE EXPANDED VIEW */}
            <div
                className={`md:hidden fixed left-0 w-full bg-white shadow-xl rounded-t-2xl transition-all duration-300 z-50 p-4
                    ${open ? "bottom-0" : "-bottom-full"}`}
            >
                <div className="flex justify-between items-center pb-2 border-b">
                    <h2 className="text-lg font-semibold">Summary</h2>
                    <button onClick={() => setOpen(false)} className="text-xl">×</button>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                    {itemSummary.map((item) => (
                        <div key={item.id} className="flex justify-between">
                            <span>{item.title} x 1</span>
                            <span className="flex items-center gap-1 font-semibold">
                                <img src={dirhum} className="w-3.5 h-3.5" /> {item.price}
                            </span>
                        </div>
                    ))}

                    {(date || time) && (
                        <div className="pt-2 border-t">
                            {date && <p className="flex justify-between"><span>Date:</span> <span>{date}</span></p>}
                            {time && <p className="flex justify-between"><span>Time:</span> <span>{time}</span></p>}
                        </div>
                    )}

                    {/* Address Section - MOBILE */}
                    {(liveAddress || (address && address.length > 0)) && (
                        <div className="pt-2 border-t text-sm leading-relaxed">
                            <p className="font-semibold">Address:</p>
                            {address}
                        </div>
                    )}

                    <div className="pt-2 border-t space-y-1">
                        <p className="flex justify-between">
                            <span>Service Charge:</span>
                            <span className="flex items-center gap-1">
                                <img src={dirhum} className="w-3.5 h-3.5" /> {serviceCharge}
                            </span>
                        </p>
                        <p className="flex justify-between">
                            <span>VAT (5%):</span>
                            <span className="flex items-center gap-1">
                                <img src={dirhum} className="w-3.5 h-3.5" /> {vat.toFixed(2)}
                            </span>
                        </p>
                    </div>

                    <div className="pt-2 border-t flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span className="flex items-center gap-1">
                            <img src={dirhum} className="w-4 h-4" /> {total.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};