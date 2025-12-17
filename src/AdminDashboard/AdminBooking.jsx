import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { RiEditBoxLine, RiDeleteBin5Line } from "react-icons/ri";
import { BiDetail } from "react-icons/bi";

const AdminBooking = () => {
    const queryClient = useQueryClient();
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);

    // Fetch Bookings
    const { data: booking = [], isLoading } = useQuery({
        queryKey: ["bookingAdmin"],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/booking`);
            const bookingRes = await res.json();
            return bookingRes.Data;
        },
    });

    const handleUpdateBooking = async () => {
        if (!selectedBooking) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/update/${selectedBooking.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: selectedBooking.status,
                        address: selectedBooking.address,
                        date: selectedBooking.date,
                        time: selectedBooking.time,
                        totalPay: selectedBooking.totalPay
                    }),
                }
            );

            const data = await res.json();
            if (data.success) {
                alert("Booking updated successfully!");
                queryClient.invalidateQueries(["bookingAdmin"]);
                setSelectedBooking(null);
            } else {
                alert("Failed to update booking");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong!");
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) {
            return;
        }

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}/booking/delete/${bookingId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();
            if (data.success) {
                alert("Booking deleted successfully!");
                queryClient.invalidateQueries(["bookingAdmin"]);
            } else {
                alert("Failed to delete booking");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong!");
        }
    };

    // Handle Input Changes in Modal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedBooking(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) return <p className="text-center md:mt-10">Loading...</p>;
    return (
        <div className="border border-[#E5E7EB] px-2 md:px-6 py-4 rounded-lg bg-white w-full max-w-6xl mx-auto">
            <h2 className="flex items-center gap-2.5 text-xl font-semibold border-b border-[#E5E7EB] pb-3 text-[#5D4F52]">
                <FaCalendarAlt className="text-[#01788E]" />Bookings: {booking.length}
            </h2>

            <div className="mt-10">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Service Name</th>
                                <th>Date & Time</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {booking.map((book, idx) => (
                                <tr
                                    className="hover:bg-gray-50 cursor-pointer"
                                    key={book.id}
                                    onClick={() => setBookingDetails(book)}
                                >
                                    <th>{idx + 1}</th>

                                    {/* Service */}
                                    <td className="">
                                        <p className="font-medium">{book.serviceName}</p>
                                        <p className="text-xs font-semibold">Amount: {book.totalPay}</p>
                                    </td>

                                    {/* Date & Time */}
                                    <td>
                                        <p>{book.date}</p>
                                        <p>{book.time}</p>
                                    </td>

                                    {/* Address */}
                                    <td>{book.address}</td>

                                    {/* Status */}
                                    <td>
                                        <div className="badge badge-info p-3 text-white">
                                            {book.status}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="flex items-center gap-3 md:mt-4">
                                        {/* Details Button */}
                                        <button
                                            title="View Details"
                                            className="btn btn-ghost btn-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setBookingDetails(book);
                                            }}
                                        >
                                            <BiDetail className="text-xl text-blue-500" />
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                            title="Edit"
                                            className="btn btn-ghost btn-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBooking(book);
                                            }}
                                        >
                                            <RiEditBoxLine className="text-xl text-green-500" />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            className="btn btn-ghost btn-xs"
                                            title="Delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteBooking(book.id);
                                            }}
                                        >
                                            <RiDeleteBin5Line className="text-xl text-red-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FOR EDITING */}




            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b shrink-0">
                            <h3 className="text-xl font-bold">Edit Booking</h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="text-2xl hover:text-gray-600"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    name="status"
                                    value={selectedBooking.status || ""}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="OnHold">OnHold</option>
                                </select>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={selectedBooking.address || ""}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={selectedBooking.date || ""}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {/* Time */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={selectedBooking.time || ""}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Amount</label>
                                <input
                                    type="number"
                                    name="totalPay"
                                    value={selectedBooking.totalPay || ""}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t shrink-0">
                            <button
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                                onClick={() => setSelectedBooking(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleUpdateBooking}
                            >
                                Update Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}











            {/* DETAILS MODAL */}
     










     {bookingDetails && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b shrink-0">
                <h3 className="text-xl font-bold">Booking Details</h3>
                <button
                    onClick={() => setBookingDetails(null)}
                    className="text-2xl hover:text-gray-600"
                >
                    &times;
                </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Booking ID</p>
                        <p className="font-medium">{bookingDetails.id || "N/A"}</p>
                    </div>

                    {/* Status */}
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                            className={`badge p-2 ${
                                bookingDetails.status === 'Completed'
                                    ? 'badge-success'
                                    : bookingDetails.status === 'Ongoing'
                                    ? 'badge-warning'
                                    : bookingDetails.status === 'Cancelled'
                                    ? 'badge-error'
                                    : 'badge-info'
                            } text-white`}
                        >
                            {bookingDetails.status}
                        </span>
                    </div>
                </div>

                {/* Service Details */}
                <div className="border-t pt-4">
                    <h4 className="font-bold text-lg mb-2">Service Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Service Name</p>
                            <p className="font-medium">{bookingDetails.serviceName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="font-medium">${bookingDetails.totalPay}</p>
                        </div>
                    </div>
                </div>

                {/* Date & Time */}
                <div className="border-t pt-4">
                    <h4 className="font-bold text-lg mb-2">Schedule</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">{bookingDetails.date}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium">{bookingDetails.time}</p>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="border-t pt-4">
                    <h4 className="font-bold text-lg mb-2">Address</h4>
                    <p className="bg-gray-50 p-3 rounded">{bookingDetails.address}</p>
                </div>

                {/* Additional Information */}
                {bookingDetails.additionalInfo && (
                    <div className="border-t pt-4">
                        <h4 className="font-bold text-lg mb-2">Additional Information</h4>
                        <p className="bg-gray-50 p-3 rounded">
                            {bookingDetails.additionalInfo}
                        </p>
                    </div>
                )}

                {/* Payment Information */}
                <div className="border-t pt-4">
                    <h4 className="font-bold text-lg mb-2">Payment</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Payment Method</p>
                            <p className="font-medium">
                                {bookingDetails.paymentMethod || "Credit Card"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <span
                                className={`badge p-2 ${
                                    bookingDetails.paymentStatus === 'Paid'
                                        ? 'badge-success'
                                        : 'badge-error'
                                } text-white`}
                            >
                                {bookingDetails.paymentStatus || "Pending"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t shrink-0">
                <button
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                    onClick={() => setBookingDetails(null)}
                >
                    Close
                </button>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                        setSelectedBooking(bookingDetails);
                        setBookingDetails(null);
                    }}
                >
                    Edit Booking
                </button>
            </div>
        </div>
    </div>
)}

        </div>
    );
};

export default AdminBooking;






// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useState } from "react";
// import { FaCalendarAlt } from "react-icons/fa";
// import { RiEditBoxLine, RiDeleteBin5Line } from "react-icons/ri";

// const AdminBooking = () => {
//     const queryClient = useQueryClient();
//     const [selectedBooking, setSelectedBooking] = useState(null);

//     const { data: booking = [], isLoading } = useQuery({
//         queryKey: ["bookingAdmin"],
//         queryFn: async () => {
//             const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/booking`);
//             const bookingRes = await res.json();
//             return bookingRes.Data;
//         },
//     });

//     // Update Booking Status
//     const mutation = useMutation({
//         mutationFn: async (updatedBooking) => {
//             const res = await fetch(
//                 `${import.meta.env.VITE_BACKEND_API_URL}/booking/${updatedBooking.id}`,
//                 {
//                     method: "PUT",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ status: updatedBooking.status }),
//                 }
//             );
//             return res.json();
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries(["bookingAdmin"]);
//         },
//     });

//     const handleUpdateStatus = () => {
//         mutation.mutate(selectedBooking);
//         setSelectedBooking(null);
//     };

//     if (isLoading) return <p className="text-center md:mt-10">Loading...</p>;

//     return (
//         <div className="border border-[#E5E7EB] px-2 md:px-6 py-4 rounded-lg bg-white w-full max-w-6xl mx-auto">
//             <h2 className="flex items-center gap-2.5 text-xl font-semibold border-b border-[#E5E7EB] pb-3 text-[#5D4F52]">
//                 <FaCalendarAlt className="text-[#01788E]" />Bookings: {booking.length}
//             </h2>

//             <div className="mt-10">
//                 <div className="overflow-x-auto">
//                     <table className="table">
//                         <thead>
//                             <tr>
//                                 <th>No</th>
//                                 <th>Service Name</th>
//                                 <th>Date & Time</th>
//                                 <th>Address</th>
//                                 <th>Status</th>
//                                 <th>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {booking.map((book, idx) => (
//                                 <tr key={book.id}>
//                                     <th>{idx + 1}</th>

//                                     {/* Service */}
//                                     <td>
//                                         <p className="font-medium">{book.serviceName}</p>
//                                         <p className="text-xs font-semibold">Amount: {book.totalPay}</p>
//                                     </td>

//                                     {/* Date & Time */}
//                                     <td>
//                                         <p>{book.date}</p>
//                                         <p>{book.time}</p>
//                                     </td>

//                                     {/* Address */}
//                                     <td>{book.address}</td>

//                                     {/* Status */}
//                                     <td>
//                                         <div className="badge badge-info p-3 text-white">
//                                             {book.status}
//                                         </div>
//                                     </td>

//                                     {/* Actions */}
//                                     <td className="flex items-center gap-3">
//                                         <button
//                                             title="Edit"
//                                             className="btn btn-ghost btn-xs"
//                                             onClick={() => setSelectedBooking(book)}
//                                         >
//                                             <RiEditBoxLine className="text-xl text-green-500" />
//                                         </button>

//                                         <button className="btn btn-ghost btn-xs" title="Delete">
//                                             <RiDeleteBin5Line className="text-xl text-red-500" />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* MODAL FOR EDITING STATUS  */}
//             {selectedBooking && (
//                 <dialog open className="modal">
//                     <div className="modal-box">
//                         <h3 className="font-bold text-lg">Edit Booking Status</h3>

//                         <div className="mt-4">
//                             <p className="font-medium">
//                                 {selectedBooking.serviceName}
//                             </p>
//                             <p>
//                                 {selectedBooking.date} - {selectedBooking.time}
//                             </p>
//                             <p className="text-sm">Address: {selectedBooking.address}</p>
//                         </div>

//                         <select
//                             defaultValue={selectedBooking.status}
//                             className="select select-bordered w-full mt-4"
//                             onChange={(e) =>
//                                 setSelectedBooking({
//                                     ...selectedBooking,
//                                     status: e.target.value,
//                                 })
//                             }
//                         >
//                             <option>Upcoming</option>
//                             <option>Ongoing</option>
//                             <option>Completed</option>
//                             <option>Cancelled</option>
//                         </select>

//                         <div className="modal-action">
//                             <button
//                                 className="btn"
//                                 onClick={() => setSelectedBooking(null)}
//                             >
//                                 Cancel
//                             </button>

//                             <button
//                                 className="btn btn-primary"
//                                 onClick={handleUpdateStatus}
//                             >
//                                 Save
//                             </button>
//                         </div>
//                     </div>
//                 </dialog>
//             )}
//         </div>
//     );
// };

// export default AdminBooking; 