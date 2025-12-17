import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
import Summery from "../../../components/Summery/Summery";
import { useSummary } from "../../../provider/SummaryProvider";
import NextBtn from "../../../components/NextBtn/NextBtn";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { generateId } from "./Map/generateId";

const Address = () => {
    const { itemSummary, vat, serviceCharge, showInput, setShowInput, serviceTitle, setLiveAddress } = useSummary();

    const [selectedType, setSelectedType] = useState("Apartment");
    const buttons = ["Apartment", "Villa", "Office", "Other"];

    const { register, handleSubmit, formState: { errors, isValid } } = useForm({
        mode: "onChange",
        shouldUnregister: true
    });
    const id = generateId();

    const onSubmit = (data) => {
        const finalData = {
            id,
            type: selectedType,
            ...data,
            displayAddress: formatDisplayAddress(selectedType, data)
        };
        setLiveAddress(finalData);
        return true;
    };

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

    const handleNextClick = async () => {
        const result = await handleSubmit(onSubmit)();
        return result !== false;
    };


    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

    return (
        <div>
            <div className="mt-14 md:mt-0">
                <ServiceDetails title="Address" currentStep={2} />
            </div>

            <div className="flex gap-8 md:mt-5">
                <div className="md:w-[60%] mb-4 space-y-4 w-full p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full p-8">
                        {/* TYPE BUTTONS */}
                        <div className="flex space-x-2 mb-6">
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
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* City */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">City</label>
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
                                <label className="block text-gray-700 font-medium mb-1">Area</label>
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
                                        <label className="block text-gray-700 font-medium mb-1">Community / Street Name</label>
                                        <input
                                            {...register("community", { required: "Community is required" })}
                                            type="text"
                                            placeholder="Enter Community / Street Name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        {errors.community && <p className="text-red-500 text-sm mt-1">{errors.community.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-1">Villa No</label>
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
                                        <label className="block text-gray-700 font-medium mb-1">Nickname</label>
                                        <input
                                            {...register("nickname", { required: "Nickname is required" })}
                                            type="text"
                                            placeholder="Enter Nickname"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        {errors.nickname && <p className="text-red-500 text-sm mt-1">{errors.nickname.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-1">Street / Building Name</label>
                                        <input
                                            {...register("streetName", { required: "Street/Building name is required" })}
                                            type="text"
                                            placeholder="Enter Street / Building Name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        {errors.streetName && <p className="text-red-500 text-sm mt-1">{errors.streetName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-1">Apartment / Villa No</label>
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
                                        <label className="block text-gray-700 font-medium mb-1">Building Name</label>
                                        <input
                                            {...register("buildingName", { required: "Building name is required" })}
                                            type="text"
                                            placeholder="Enter Building Name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        {errors.buildingName && <p className="text-red-500 text-sm mt-1">{errors.buildingName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-1">Apartment No</label>
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
                        </form>
                    </div>
                </div>

                <Summery serviceTitle={serviceTitle} itemSummary={itemSummary} total={serviceCharge + (serviceCharge * 0.05)} subTotal={serviceCharge} showInput={showInput} setShowInput={setShowInput} vat={vat} serviceCharge={serviceCharge} />
            </div>

            <div className="hidden md:block">
                <NextBtn
                    onClick={handleNextClick}
                    disabled={!isValid}
                />
            </div>
        </div>
    );
};

export default Address;