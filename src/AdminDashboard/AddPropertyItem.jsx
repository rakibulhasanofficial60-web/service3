import { useState } from "react";
import useDashboardPropertyItem from "../hooks/useDashboardPropertyItem";
import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useDashboardPropertyType from "../hooks/userDashboardPropertyType";
import { GoBrowser } from "react-icons/go";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const AddPropertyItem = () => {
    const [propertyItem, refetch] = useDashboardPropertyItem();
    const [propertyType] = useDashboardPropertyType();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Open / Close Add Modal
    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => {
        reset();
        setIsAddModalOpen(false);
    };

    // Open / Close Edit Modal
    const openEditModal = (item) => {
        setEditItem(item);
        setIsEditModalOpen(true);

        // Edit form-এ default values সেট করুন
        setValue("title", item.title);
        setValue("description", item.description);
        setValue("propertyTypeId", item.propertyTypeId);
        setValue("price", item.price);
        setValue("serviceCharge", item.serviceCharge);
        setValue("vat", item.vat);
        setValue("feature1", item.feature1);
        setValue("feature2", item.feature2);
        setValue("feature3", item.feature3);
        setValue("feature4", item.feature4);
    };
    const closeEditModal = () => {
        reset();
        setIsEditModalOpen(false);
        setEditItem(null);
    };

    // Add Form Submit
    const handleAddFormSubmit = async (data) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("image", data.image[0]);

        try {
            const res = await fetch(image_hosting_api, {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            if (result.success) {
                const imageUrl = result.data.url;

                const finalData = {
                    ...data,
                    image: imageUrl,
                };

                const postData = await fetch("https://job-task-nu.vercel.app/api/v1/property-items/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(finalData),
                });

                const postResult = await postData.json();
                if (postResult.success === true) {
                    toast.success("Property Item added successfully");
                    closeAddModal();
                    refetch();
                    reset();
                }
            } else {
                toast.error("Image upload failed");
            }
        } catch (error) {
            toast.error(`Something wrong: ${error?.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    // Edit Form Submit
    const handleEditFormSubmit = async (data) => {
        setLoading(true);

        let imageUrl = editItem.image;

        // Check if new image is uploaded
        if (data.image && data.image[0]) {
            const formData = new FormData();
            formData.append("image", data.image[0]);

            try {
                const res = await fetch(image_hosting_api, {
                    method: "POST",
                    body: formData,
                });

                const result = await res.json();
                if (result.success) {
                    imageUrl = result.data.url;
                } else {
                    toast.error("Image upload failed");
                    setLoading(false);
                    return;
                }
            } catch (error) {
                toast.error(`Image upload error: ${error?.message || error}`);
                setLoading(false);
                return;
            }
        }

        const finalData = {
            ...data,
            image: imageUrl,
        };

        // Remove image field if it's a file object (not a string)
        if (finalData.image && typeof finalData.image !== 'string') {
            delete finalData.image;
        }

        try {
            const response = await fetch(
                `https://job-task-nu.vercel.app/api/v1/property-items/update/${editItem.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(finalData),
                }
            );

            const result = await response.json();
            if (result.success) {
                toast.success("Property Item updated successfully");
                closeEditModal();
                refetch();
            } else {
                toast.error(result.message || "Failed to update");
            }
        } catch (error) {
            toast.error(`Update error: ${error?.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    const handelDeleteItem = async (item) => {
        try {
            const res = await fetch(
                `https://job-task-nu.vercel.app/api/v1/property-items/delete/${item.id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await res.json();

            if (result.success) {
                toast.success("Property Item deleted successfully");
                refetch();
            } else {
                toast.error("Failed to delete item");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="md:p-6 border border-[#E5E7EB]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-7">
                <h2 className="flex items-center gap-2.5 text-xl font-semibold text-[#5D4F52]">
                    <GoBrowser className="text-[#01788E]" />Property Item: {propertyItem.length}
                </h2>
                <button
                    onClick={openAddModal}
                    className="btn btn-outline mt-3 md:mt-0"
                >
                    Add Property Item
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Service Type</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>

                    <tbody>
                        {propertyItem.map((item, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>

                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle h-12 w-12">
                                                <img src={item.image} alt={item.title} />
                                            </div>
                                        </div>
                                        <div className="font-semibold">
                                            {item.title} - {item.propertyType?.title} -{" "}
                                            {item.propertyType?.serviceType?.title} -{" "}
                                            {item.propertyType?.serviceType?.service?.title}
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => openEditModal(item)}
                                    >
                                        <RiEditBoxLine className="text-xl text-green-500" />
                                    </button>
                                </td>

                                <td>
                                    <button onClick={() => handelDeleteItem(item)} className="btn btn-ghost btn-xs">
                                        <RiDeleteBin5Line className="text-xl text-red-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---------------------- Add Modal ---------------------- */}
            {isAddModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={closeAddModal}
                >
                    <div
                        className="relative bg-white 
                                    w-full 
                                    max-w-md sm:max-w-lg md:max-w-2xl
                                    p-3 sm:p-5 md:p-8 
                                    rounded-lg sm:rounded-md md:rounded-xl
                                    shadow-xl 
                                    max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-3 right-3 text-xl text-gray-600 hover:text-gray-900"
                            onClick={closeAddModal}
                        >
                            <IoClose />
                        </button>

                        <h2 className="text-xl md:text-2xl  font-bold text-center mb-6 text-gray-800">
                            Add Property Item
                        </h2>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit(handleAddFormSubmit)}
                            className="flex flex-col gap-5 p-4"
                        >
                            {/* Image */}
                            <div className="md:col-span-2">
                                <label className="font-medium">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register("image", { required: true })}
                                    className="border p-3 w-full rounded-md"
                                />
                                {errors.image && (
                                    <p className="text-red-500 text-sm">Image is required</p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="font-medium">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter title"
                                    className="input input-bordered w-full mt-1"
                                    {...register("title", { required: "Title is required" })}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="font-medium">Description</label>
                                <textarea
                                    placeholder="Enter description"
                                    className="textarea textarea-bordered w-full mt-1"
                                    {...register("description", { required: "Description is required" })}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Property Type Dropdown */}
                            <div>
                                <label className="block font-medium mb-1">Property Type</label>
                                <select
                                    {...register("propertyTypeId", { required: true })}
                                    className="border p-3 w-full rounded-md"
                                >
                                    <option value="">Select Property Type</option>
                                    {propertyType?.map(p => (
                                        <option key={p?.id} value={p?.id}>
                                            {p?.title} - {p?.serviceType?.title} - {p?.serviceType?.service?.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.propertyTypeId && <p className="text-red-500 text-sm">Required</p>}
                            </div>

                            {/* Price - Service Charge - VAT */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="font-medium">Price</label>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="input input-bordered w-full mt-1"
                                        {...register("price", { required: "Price is required", valueAsNumber: true })}
                                    />
                                    {errors.price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-medium">Service Charge</label>
                                    <input
                                        type="number"
                                        placeholder="Service Charge"
                                        className="input input-bordered w-full mt-1"
                                        {...register("serviceCharge", { required: "Service charge is required", valueAsNumber: true })}
                                    />
                                    {errors.serviceCharge && (
                                        <p className="text-red-500 text-sm mt-1">{errors.serviceCharge.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-medium">VAT</label>
                                    <input
                                        type="number"
                                        placeholder="VAT"
                                        className="input input-bordered w-full mt-1"
                                        {...register("vat", { required: "VAT is required", valueAsNumber: true })}
                                    />
                                    {errors.vat && (
                                        <p className="text-red-500 text-sm mt-1">{errors.vat.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Features Section */}
                            <div>
                                <label className="font-medium block mb-2">Features</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-32 overflow-y-auto pr-2">
                                    <input
                                        type="text"
                                        placeholder="Feature 1"
                                        className="input input-bordered w-full"
                                        {...register("feature1")}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Feature 2"
                                        className="input input-bordered w-full"
                                        {...register("feature2")}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Feature 3"
                                        className="input input-bordered w-full"
                                        {...register("feature3")}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Feature 4"
                                        className="input input-bordered w-full"
                                        {...register("feature4")}
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                disabled={loading}
                                className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#016377] transition-colors"
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------------------- Edit Modal ---------------------- */}
            {isEditModalOpen && editItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={closeEditModal}
                >
                    <div
                        className="relative bg-white 
                                    w-full 
                                    max-w-md sm:max-w-lg md:max-w-2xl
                                    p-3 sm:p-5 md:p-8 
                                    rounded-lg sm:rounded-md md:rounded-xl
                                    shadow-xl 
                                    max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-3 right-3 text-xl text-gray-600 hover:text-gray-900"
                            onClick={closeEditModal}
                        >
                            <IoClose />
                        </button>

                        <h2 className="text-xl md:text-2xl  font-bold text-center mb-6 text-gray-800">
                            Edit Property Item
                        </h2>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit(handleEditFormSubmit)}
                            className="flex flex-col gap-5 p-4"
                        >
                            {/* Image */}
                            <div className="md:col-span-2">
                                <label className="font-medium">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register("image")}
                                    className="border p-3 w-full rounded-md"
                                />
                                {editItem?.image && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                                        <img
                                            className="w-28 h-28 object-cover rounded-md border"
                                            src={editItem.image}
                                            alt="Current"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="font-medium">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter title"
                                    className="input input-bordered w-full mt-1"
                                    {...register("title", { required: "Title is required" })}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="font-medium">Description</label>
                                <textarea
                                    placeholder="Enter description"
                                    className="textarea textarea-bordered w-full mt-1"
                                    {...register("description", { required: "Description is required" })}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Property Type Dropdown */}
                            <div>
                                <label className="block font-medium mb-1">Property Type</label>
                                <select
                                    {...register("propertyTypeId", { required: true })}
                                    className="border p-3 w-full rounded-md"
                                >
                                    <option value="">Select Property Type</option>
                                    {propertyType?.map(p => (
                                        <option key={p?.id} value={p?.id}>
                                            {p?.title} - {p?.serviceType?.title} - {p?.serviceType?.service?.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.propertyTypeId && <p className="text-red-500 text-sm">Required</p>}
                            </div>

                            {/* Price - Service Charge - VAT */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="font-medium">Price</label>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="input input-bordered w-full mt-1"
                                        {...register("price", { required: "Price is required", valueAsNumber: true })}
                                    />
                                    {errors.price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-medium">Service Charge</label>
                                    <input
                                        type="number"
                                        placeholder="Service Charge"
                                        className="input input-bordered w-full mt-1"
                                        {...register("serviceCharge", { required: "Service charge is required", valueAsNumber: true })}
                                    />
                                    {errors.serviceCharge && (
                                        <p className="text-red-500 text-sm mt-1">{errors.serviceCharge.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-medium">VAT</label>
                                    <input
                                        type="number"
                                        placeholder="VAT"
                                        className="input input-bordered w-full mt-1"
                                        {...register("vat", { required: "VAT is required", valueAsNumber: true })}
                                    />
                                    {errors.vat && (
                                        <p className="text-red-500 text-sm mt-1">{errors.vat.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Features Section */}
                            <div>
                                <label className="font-medium block mb-2">Features</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Feature 1"
                                        className="input input-bordered w-full"
                                        {...register("feature1")}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Feature 2"
                                        className="input input-bordered w-full"
                                        {...register("feature2")}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Feature 3"
                                        className="input input-bordered w-full"
                                        {...register("feature3")}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Feature 4"
                                        className="input input-bordered w-full"
                                        {...register("feature4")}
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#016377] transition-colors"
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddPropertyItem;










// import { useState } from "react";
// import useDashboardPropertyItem from "../hooks/useDashboardPropertyItem";
// import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";
// import { IoClose } from "react-icons/io5";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import useDashboardPropertyType from "../hooks/userDashboardPropertyType";
// import { GoBrowser } from "react-icons/go";

// const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
// const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// const AddPropertyItem = () => {
//     const [propertyItem, refetch] = useDashboardPropertyItem();
//     const [propertyType] = useDashboardPropertyType();
//     // const [serviceType] = useDashboardServiceType();
//     const [loading, setLoading] = useState(false);
//     const { register, handleSubmit, reset, formState: { errors } } = useForm();
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);

//     // Edit Modal State
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [editItem, setEditItem] = useState(null);

//     // Open / Close Add Modal
//     const openAddModal = () => setIsAddModalOpen(true);
//     const closeAddModal = () => {
//         reset();
//         setIsAddModalOpen(false);
//     };

//     // Open / Close Edit Modal
//     const openEditModal = (item) => {
//         setEditItem(item);
//         setIsEditModalOpen(true);
//     };
//     const closeEditModal = () => setIsEditModalOpen(false);

//     // Add Form Submit
//     const handleAddFormSubmit = async (data) => {
//         setLoading(true);
//         // console.log("Form Submitted:", data);


//         const formData = new FormData();
//         formData.append("image", data.image[0]);
//         try {
//             const res = await fetch(image_hosting_api, {
//                 method: "POST",
//                 body: formData,
//             });

//             const result = await res.json();
//             if (result.success) {
//                 const imageUrl = result.data.url;

//                 const finalData = {
//                     ...data,
//                     image: imageUrl,
//                 };


//                 // console.log(finalData);
//                 const postData = await fetch("https://job-task-nu.vercel.app/api/v1/property-items/create", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(finalData),
//                 });

//                 const postResult = await postData.json();
//                 if (postResult.success === true) {
//                     toast.success("Service added successfully");
//                     closeAddModal();
//                     refetch();
//                 }
//             } else {
//                 toast.error("Image upload failed");
//             }
//         } catch (error) {
//             toast.error(`Something wrong: ${error?.message || error}`);
//             // console.log(error);
//         } finally {
//             setLoading(false);
//         }
//         setLoading(false);
//     };

//     // console.log(propertyItem);

//     // Edit Save
//     // const handleEditItem = () => {
//     //     console.log("Edited Item:", editItem);
//     //     closeEditModal();
//     // };

//     const handelDeleteItem = async (item) => {
//         try {
//             const res = await fetch(
//                 `https://job-task-nu.vercel.app/api/v1/property-items/delete/${item.id}`,
//                 {
//                     method: "DELETE",
//                 }
//             );

//             const result = await res.json();

//             if (result.success) {
//                 toast.success("Service deleted successfully");
//                 refetch();
//             } else {
//                 toast.error("Failed to delete service");
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error("Something went wrong");
//         }
//     }

//     return (
//         <div className="md:p-6 border border-[#E5E7EB]">
//             {/* Header */}
//             {/* <div className="mx-auto flex flex-col items-center justify-center text-center md:flex-row md:justify-around md:items-center md:my-10">
//                 <p className="text-xl font-medium md:text-3xl md:font-bold">
//                     Property Item: {propertyItem.length}
//                 </p>

//                 <button className="btn btn-outline mt-3 md:mt-0" onClick={openAddModal}>
//                     Add Property Item
//                 </button>
//             </div> */}


//             <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-7">
//                 <h2 className="flex items-center gap-2.5 text-xl font-semibold text-[#5D4F52]">
//                     <GoBrowser className="text-[#01788E]" />Property Item: {propertyItem.length}
//                 </h2>
//                 <button
//                     onClick={openAddModal}
//                     className="btn btn-outline mt-3 md:mt-0"
//                 >
//                     Add Property Item
//                 </button>
//             </div>


//             {/* Table */}
//             <div className="overflow-x-auto">
//                 <table className="table w-full">
//                     <thead>
//                         <tr>
//                             <th>No</th>
//                             <th>Service Type</th>
//                             <th>Edit</th>
//                             <th>Delete</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {propertyItem.map((item, idx) => (
//                             <tr key={idx}>
//                                 <td>{idx + 1}</td>

//                                 <td>
//                                     <div className="flex items-center gap-3">
//                                         <div className="avatar">
//                                             <div className="mask mask-squircle h-12 w-12">
//                                                 <img src={item.image} />
//                                             </div>
//                                         </div>
//                                         <div className="font-semibold">
//                                             {item.title} - {item.propertyType.title} -{" "}
//                                             {item.propertyType.serviceType.title} -{" "}
//                                             {item.propertyType.serviceType.service.title}
//                                         </div>
//                                     </div>
//                                 </td>

//                                 <td>
//                                     <button
//                                         className="btn btn-ghost btn-xs"
//                                         onClick={() => openEditModal(item)}
//                                     >
//                                         <RiEditBoxLine className="text-xl text-green-500" />
//                                     </button>
//                                 </td>

//                                 <td>
//                                     <button onClick={() => handelDeleteItem(item)} className="btn btn-ghost btn-xs">
//                                         <RiDeleteBin5Line className="text-xl text-red-500" />
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* ---------------------- Add Modal ---------------------- */}
//             {isAddModalOpen && (
//                 <div
//                     className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
//                     onClick={closeAddModal}
//                 >
//                     <div
//                         className="relative bg-white
//                                     w-full
//                                     max-w-md sm:max-w-lg md:max-w-2xl
//                                     p-3 sm:p-5 md:p-8
//                                     rounded-lg sm:rounded-md md:rounded-xl
//                                     shadow-xl
//                                     max-h-[90vh] overflow-y-auto"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         {/* Close Button */}
//                         <button
//                             className="absolute top-3 right-3 text-xl text-gray-600 hover:text-gray-900"
//                             onClick={closeAddModal}
//                         >
//                             <IoClose />
//                         </button>

//                         <h2 className="text-xl md:text-2xl  font-bold text-center mb-6 text-gray-800">
//                             Add Property Item
//                         </h2>

//                         {/* Form */}
//                         <form
//                             onSubmit={handleSubmit(handleAddFormSubmit)}
//                             className="flex flex-col gap-5 p-4"
//                         >
//                             {/* Image */}
//                             <div className="md:col-span-2">
//                                 <label className="font-medium">Image</label>
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     {...register("image", { required: true })}
//                                     className="border p-3 w-full rounded-md"
//                                 />
//                                 {errors.image && (
//                                     <p className="text-red-500 text-sm">Image is required</p>
//                                 )}
//                             </div>

//                             {/* Title */}
//                             <div>
//                                 <label className="font-medium">Title</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Enter title"
//                                     className="input input-bordered w-full mt-1"
//                                     {...register("title", { required: "Title is required" })}
//                                 />
//                                 {errors.title && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
//                                 )}
//                             </div>

//                             {/* Description */}
//                             <div>
//                                 <label className="font-medium">Description</label>
//                                 <textarea
//                                     placeholder="Enter description"
//                                     className="textarea textarea-bordered w-full mt-1"
//                                     {...register("description", { required: "Description is required" })}
//                                 />
//                                 {errors.description && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
//                                 )}
//                             </div>

//                             {/* dropdown */}
//                             <div>
//                                 <label className="block font-medium mb-1">Property Type</label>
//                                 <select
//                                     {...register("propertyTypeId", { required: true })}
//                                     className="border p-3 w-full rounded-md"
//                                 >
//                                     <option value="">Select Service Type</option>
//                                     {propertyType?.map(p => (
//                                         <option key={p?.id} value={p?.id}>
//                                             {p?.title} - { }
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.propertyTypeId && <p className="text-red-500 text-sm">Required</p>}
//                             </div>

//                             {/* Price - Service Charge - VAT */}
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div>
//                                     <label className="font-medium">Price</label>
//                                     <input
//                                         type="number"
//                                         placeholder="Price"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("price", { required: "Price is required", valueAsNumber: true })}
//                                     />
//                                     {errors.price && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">Service Charge</label>
//                                     <input
//                                         type="number"
//                                         placeholder="Service Charge"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("serviceCharge", { required: "Service charge is required", valueAsNumber: true })}
//                                     />
//                                     {errors.serviceCharge && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.serviceCharge.message}</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">VAT</label>
//                                     <input
//                                         type="number"
//                                         placeholder="VAT"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("vat", { required: "VAT is required", valueAsNumber: true })}
//                                     />
//                                     {errors.vat && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.vat.message}</p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Features Section - Scrollable */}
//                             <div>
//                                 <label className="font-medium block mb-2">Features</label>

//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-32 overflow-y-auto pr-2">
//                                     <input
//                                         type="text"
//                                         placeholder="Feature 1"
//                                         className="input input-bordered w-full"
//                                         {...register("feature1")}
//                                     />

//                                     <input
//                                         type="text"
//                                         placeholder="Feature 2"
//                                         className="input input-bordered w-full"
//                                         {...register("feature2")}
//                                     />

//                                     <input
//                                         type="text"
//                                         placeholder="Feature 3"
//                                         className="input input-bordered w-full"
//                                         {...register("feature3")}
//                                     />

//                                     <input
//                                         type="text"
//                                         placeholder="Feature 4"
//                                         className="input input-bordered w-full"
//                                         {...register("feature4")}
//                                     />

//                                 </div>
//                             </div>

//                             {/* Submit */}
//                             <button disabled={loading} className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg">{loading ? 'Submitting...' : 'Submit'}</button>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* ---------------------- Edit Modal ---------------------- */}
//             {isEditModalOpen && editItem && (
//                 <div
//                     className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
//                     onClick={closeEditModal}
//                 >
//                     <div
//                         className="relative bg-white
//                                     w-full
//                                     max-w-md sm:max-w-lg md:max-w-2xl
//                                     p-3 sm:p-5 md:p-8
//                                     rounded-lg sm:rounded-md md:rounded-xl
//                                     shadow-xl
//                                     max-h-[90vh] overflow-y-auto"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         {/* Close Button */}
//                         <button
//                             className="absolute top-3 right-3 text-xl text-gray-600 hover:text-gray-900"
//                             onClick={closeEditModal}
//                         >
//                             <IoClose />
//                         </button>

//                         <h2 className="text-xl md:text-2xl  font-bold text-center mb-6 text-gray-800">
//                             Edit Property Item
//                         </h2>

//                         {/* Form */}
//                         <form
//                             onSubmit={handleSubmit(handleAddFormSubmit)}
//                             className="flex flex-col gap-5 p-4"
//                         >
//                             {/* Image */}
//                             <div className="md:col-span-2">
//                                 <label className="font-medium">Image</label>
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     {...register("image", { required: true })}
//                                     className="border p-3 w-full rounded-md"
//                                 />

//                                 <img className="w-28 h-18 pt-3" src={propertyItem?.map(p => p?.image)} alt="" />
//                             </div>

//                             {/* Title */}
//                             <div>
//                                 <label className="font-medium">Title</label>
//                                 <input
//                                     type="text"
//                                     defaultValue={propertyItem.map(p => p.title)}
//                                     placeholder="Enter title"
//                                     className="input input-bordered w-full mt-1"
//                                     {...register("title", { required: "Title is required" })}
//                                 />
//                                 {errors.title && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
//                                 )}
//                             </div>

//                             {/* Description */}
//                             <div>
//                                 <label className="font-medium">Description</label>
//                                 <textarea
//                                     defaultValue={propertyItem.map(p => p.description)}
//                                     placeholder="Enter description"
//                                     className="textarea textarea-bordered w-full mt-1"
//                                     {...register("description", { required: "Description is required" })}
//                                 />
//                                 {errors.description && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
//                                 )}
//                             </div>

//                             {/* dropdown */}
//                             <div>
//                                 <label className="block font-medium mb-1">Property Type</label>
//                                 <select
//                                     defaultValue={propertyType?.map(p => p.title)}
//                                     {...register("propertyTypeId", { required: true })}
//                                     className="border p-3 w-full rounded-md"
//                                 >
//                                     <option value="">Select Service Type</option>
//                                     {propertyType?.map(p => (
//                                         <option key={p?.id} value={p?.id}>
//                                             {p?.title}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.propertyTypeId && <p className="text-red-500 text-sm">Required</p>}
//                             </div>

//                             {/* Price - Service Charge - VAT */}
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div>
//                                     <label className="font-medium">Price</label>
//                                     <input
//                                         defaultValue={propertyItem?.map(p => p.price)}
//                                         type="number"
//                                         placeholder="Price"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("price", { required: "Price is required", valueAsNumber: true })}
//                                     />
//                                     {errors.price && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
//                                     )}
//                                 </div>

//                                 {/* service charge  */}
//                                 <div>
//                                     <label className="font-medium">Service Charge</label>
//                                     <input
//                                         defaultValue={propertyItem?.map(p => p.serviceCharge)}
//                                         type="number"
//                                         placeholder="Service Charge"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("serviceCharge", { required: "Service charge is required", valueAsNumber: true })}
//                                     />
//                                     {errors.serviceCharge && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.serviceCharge.message}</p>
//                                     )}
//                                 </div>

//                                 {/* vat  */}
//                                 <div>
//                                     <label className="font-medium">Vat</label>
//                                     <input
//                                         defaultValue={propertyItem?.map(p => p?.vat)}
//                                         type="number"
//                                         placeholder="VAT"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("vat", { required: "VAT is required", valueAsNumber: true })}
//                                     />
//                                     {errors.vat && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.vat.message}</p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Features Section - Scrollable */}
//                             <div>
//                                 <label className="font-medium block mb-2">Features</label>

//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-32 overflow-y-auto pr-2">

//                                     <input
//                                         defaultValue={propertyItem?.map(p => p.feature1)}
//                                         type="text"
//                                         placeholder="Feature 1"
//                                         className="input input-bordered w-full"
//                                         {...register("feature1")}
//                                     />

//                                     <input
//                                         defaultValue={propertyItem?.map(p => p.feature2)}
//                                         type="text"
//                                         placeholder="Feature 2"
//                                         className="input input-bordered w-full"
//                                         {...register("feature2")}
//                                     />

//                                     <input
//                                         defaultValue={propertyItem?.map(p => p.feature3)}
//                                         type="text"
//                                         placeholder="Feature 3"
//                                         className="input input-bordered w-full"
//                                         {...register("feature3")}
//                                     />

//                                     <input
//                                         defaultValue={propertyItem?.map(p => p.feature4)}
//                                         type="text"
//                                         placeholder="Feature 4"
//                                         className="input input-bordered w-full"
//                                         {...register("feature4")}
//                                     />

//                                 </div>
//                             </div>

//                             {/* Submit */}
//                             <button type="submit" disabled={loading} className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg">{loading ? 'Submitting...' : 'Submit'}</button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AddPropertyItem;