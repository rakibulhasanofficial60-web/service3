import { FiEdit3, FiTrash2, FiPlus, FiMapPin } from "react-icons/fi";
import { useSummary } from "../provider/SummaryProvider";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function SavedLocations() {
    const { getAddresses, removeAddress, updateAddress } = useSummary();
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const addresses = getAddresses();
        setSavedAddresses(addresses);
    }, [getAddresses]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            removeAddress(id);
            setSavedAddresses(prev => prev.filter(address => address.id !== id));
        }
    };

    const handleEdit = (address) => {
        // Option 1: LocationPicker কম্পোনেন্টে নিয়ে যান
        navigate('/location')
        setEditingAddress(address);
        setShowLocationPicker(true);

        // অথবা Option 2: Address ফর্ম পেজে নিয়ে যান
        // navigate(`/address?edit=${address.id}`);

        // অথবা Option 3: Modal ভেতরে Edit ফর্ম show করুন
        // setShowEditModal(true);
        // setSelectedAddress(address);
    };

    const handleAddNew = () => {
        // নতুন address যোগ করার জন্য Address পেজে নিয়ে যান
        navigate("/address");
    };

    const handleLocationUpdate = (newLocationData) => {
        if (editingAddress) {
            const updatedAddress = {
                ...editingAddress,
                ...newLocationData,
                updatedAt: new Date().toISOString()
            };

            updateAddress(updatedAddress);
            setSavedAddresses(prev =>
                prev.map(addr =>
                    addr.id === updatedAddress.id ? updatedAddress : addr
                )
            );

            setEditingAddress(null);
            setShowLocationPicker(false);
        }
    };

    // যদি LocationPicker দেখাতে চান
    if (showLocationPicker && editingAddress) {
        return (
            <LocationPicker
                address={editingAddress}
                onSave={handleLocationUpdate}
                onCancel={() => {
                    setEditingAddress(null);
                    setShowLocationPicker(false);
                }}
            />
        );
    }

    return (
        <div className="border border-[#E5E7EB] rounded-md bg-white p-5 w-full max-w-7xl mx-auto">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[#5D4F52] border-b pb-3">
                <FiMapPin className="text-[#01788E]" size={20} />
                Saved Locations
            </h2>

            {savedAddresses.length === 0 ? (
                <div className="mt-6 text-center py-8">
                    <p className="text-gray-500">No saved addresses found</p>
                    <button
                        onClick={handleAddNew}
                        className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        Add First Address
                    </button>
                </div>
            ) : (
                <div className="mt-6 flex flex-col gap-4">
                    {savedAddresses.map((item) => (
                        <div
                            key={item.id}
                            className="border border-[#D1E5EA] rounded-md p-4 flex justify-between items-start hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-[15px] font-medium text-[#5D4F52]">
                                        {item.type || "Address"}
                                    </h3>
                                    {item.nickname && (
                                        <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                                            {item.nickname}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[13px] text-gray-600 mt-1">
                                    {item.displayAddress ||
                                        `${item.apartmentNo || item.villaNo || item.otherNo || ''} - ${item.buildingName || item.community || item.streetName || ''} - ${item.area || ''} - ${item.city || ''}`
                                    }
                                </p>
                                {item.mapLatitude && item.mapLongitude && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        📍 Coordinates: {item.mapLatitude.toFixed(4)}, {item.mapLongitude.toFixed(4)}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="p-2 text-[#01788E] hover:bg-teal-50 rounded-full transition"
                                    title="Edit address"
                                >
                                    <FiEdit3 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                                    title="Delete address"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add new address */}
                    <button
                        onClick={handleAddNew}
                        className="border border-[#D1E5EA] rounded-md p-4 flex items-center justify-between w-full hover:bg-gray-50 transition hover:border-teal-300"
                    >
                        <span className="flex items-center gap-2 text-[14px] text-[#5D4F52]">
                            <FiPlus size={18} className="text-[#01788E]" />
                            Add New Address
                        </span>
                        <span className="text-[#01788E] text-lg">{">"}</span>
                    </button>
                </div>
            )}
        </div>
    );
};






// import { FiEdit3, FiTrash2, FiPlus, FiMapPin } from "react-icons/fi";
// import { useSummary } from "../provider/SummaryProvider";
// import { useEffect, useState } from "react";

// export default function SavedLocations() {
//     const { getAddresses, removeAddress, updateAddress } = useSummary();
//     const [savedAddresses, setSavedAddresses] = useState([]);

//     useEffect(() => {
//         const addresses = getAddresses();
//         setSavedAddresses(addresses);
//     }, [getAddresses]);

//     const handleDelete = (id) => {
//         removeAddress(id);
//         setSavedAddresses(prev => prev.filter(address => address.id !== id));
//     };

//     const handleEdit = (address) => {
//         console.log("Editing address:", address);
//     };

//     const handleAddNew = () => {
//         console.log("Add new address clicked");
//     };

//     return (
//         <div className="border border-[#E5E7EB] rounded-md bg-white p-5 w-full max-w-7xl mx-auto">
//             <h2 className="flex items-center gap-2 text-xl font-semibold text-[#5D4F52] border-b pb-3">
//                 <FiMapPin className="text-[#01788E]" size={20} />
//                 Saved Locations
//             </h2>

//             {savedAddresses.length === 0 ? (
//                 <div className="mt-6 text-center py-8">
//                     <p className="text-gray-500">No saved addresses found</p>
//                     <button
//                         onClick={handleAddNew}
//                         className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
//                     >
//                         Add First Address
//                     </button>
//                 </div>
//             ) : (
//                 <div className="mt-6 flex flex-col gap-4">
//                     {savedAddresses.map((item) => (
//                         <div
//                             key={item.id}
//                             className="border border-[#D1E5EA] rounded-md p-4 flex justify-between items-start"
//                         >
//                             <div>
//                                 <h3 className="text-[15px] font-medium text-[#5D4F52]">
//                                     {item.type || "Address"}
//                                 </h3>
//                                 <p className="text-[13px] text-gray-600 mt-1">
//                                     {/* displayAddress ব্যবহার করুন যদি থাকে, নাহলে format করুন */}
//                                     {item.displayAddress ||
//                                         `${item.apartmentNo || item.villaNo || item.otherNo || ''} - ${item.buildingName || item.community || item.streetName || ''} - ${item.area || ''} - ${item.city || ''}`
//                                     }
//                                 </p>
//                             </div>

//                             {/* Actions */}
//                             <div className="flex items-center gap-4">
//                                 <FiEdit3
//                                     onClick={() => handleEdit(item)}
//                                     size={18}
//                                     className="text-[#01788E] cursor-pointer hover:opacity-70"
//                                 />
//                                 <FiTrash2
//                                     onClick={() => handleDelete(item.id)}
//                                     size={18}
//                                     className="text-red-500 cursor-pointer hover:opacity-70"
//                                 />
//                             </div>
//                         </div>
//                     ))}

//                     {/* Add new address */}
//                     <button
//                         onClick={handleAddNew}
//                         className="border border-[#D1E5EA] rounded-md p-4 flex items-center justify-between w-full hover:bg-gray-50 transition"
//                     >
//                         <span className="flex items-center gap-2 text-[14px] text-[#5D4F52]">
//                             <FiPlus size={18} className="text-[#01788E]" />
//                             Add New Address
//                         </span>
//                         <span className="text-[#01788E] text-lg">{">"}</span>
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }