import { useState } from "react";
import dirhum from '../../assets/icon/dirhum.png';
import { MdOutlineArrowRightAlt } from "react-icons/md";
import ContentModal from "../ContentModal/ContentModal";

const CoverContent = ({ content }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const properties = Array.isArray(content?.propertyType)
        ? content.propertyType
        : [];
    // console.log(content);
    const handleOpenModal = (property) => {
        setSelectedProperty(property);
        setShowModal(true);
    };

    return (
        <div className="mt-3 md:mt-6 ">
            {properties.map((property, idx) => (
                // old version 
                // <div
                //     key={idx}
                //     onClick={() => handleOpenModal(property)}
                //     className="md:flex mb-6"
                // >
                //     {/* Left Side: Image */}
                //     <img
                //         src={property.image}
                //         alt={property.title}
                //         className="w-[50%] mb-2.5 md:w-20 md:h-20 object-cover rounded-sm mx-auto"
                //     />

                //     {/* Right Side: Content */}
                //     <div className="md:ml-5 text-center md:text-start space-y-1 flex-1">
                //         <h2 className="text-[18px] font-semibold mb-2">
                //             {property.title}
                //         </h2>
                //         <p className="text-gray-600 text-[13px]">
                //             {property.description}
                //         </p>

                //         <div className="md:flex justify-between items-center">
                //             <p className="text-gray-600 flex text-center md:text-start items-center gap-2 text-[14px]">
                //                 Starting from{" "}
                //                 <span className="font-bold flex items-center">
                //                     <img
                //                         className="h-[15px] w-[15px]"
                //                         src={dirhum}
                //                         alt="AED"
                //                     />{" "}
                //                     {property.startFrom}
                //                 </span>
                //             </p>

                //             {/* 🔹 Small indicator button (non-clickable now) */}
                //             <div className="border  px-2.5 py-1 flex items-center gap-2 text-[#01788E] rounded-xs text-[13px]">
                //                 {property.propertyItems?.length || 0} Options{" "}
                //                 <MdOutlineArrowRightAlt />
                //             </div>
                //         </div>
                //     </div>
                // </div>

                // new responcive version 
                <div
                    key={idx}
                    onClick={() => handleOpenModal(property)}
                    className="group cursor-pointer transition-all duration-200 mb-6 p-4 md:p-0 rounded-lg border border-gray-100 hover:border-gray-200 md:border-0"
                >
                    <div className="md:flex md:items-start md:gap-4 lg:gap-6">
                        {/* Image */}
                        <div className="relative mb-4 md:mb-0 md:flex-shrink-0 flex justify-center md:justify-start">
                            <img
                                src={property.image}
                                alt={property.title}
                                className="w-full max-w-xs h-48 md:w-32 md:h-32 lg:w-40 lg:h-40 object-cover rounded-lg"
                            />
                        </div>

                        {/* Content */}
                        <div className="text-center md:text-left flex-1">
                            {/* Title & Description */}
                            <div className="mb-3 md:mb-4">
                                <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                                    {property.title}
                                </h2>
                                <p className="text-gray-600 text-sm md:text-base">
                                    {property.description}
                                </p>
                            </div>

                            {/* Mobile: Price & Button in one column, Desktop: Flex between */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                {/* Price */}
                                <div className="flex flex-col items-center md:items-start">
                                    <p className="text-gray-500 text-sm md:text-base">
                                        Starting from
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            className="h-4 w-4 md:h-5 md:w-5"
                                            src={dirhum}
                                            alt="AED"
                                        />
                                        <span className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900">
                                            {property.startFrom.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Button - Mobile: Full width, Desktop: Auto width */}
                                <div className="w-full md:w-auto">
                                    <div className="border border-[#01788E] px-4 py-2.5 flex items-center justify-center md:justify-between gap-2 text-[#01788E] rounded text-sm md:text-base hover:bg-[#01788E] hover:text-white cursor-pointer transition-colors duration-200">
                                        <span className="font-medium">
                                            {property.propertyItems?.length || 0} Options
                                        </span>
                                        <MdOutlineArrowRightAlt className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* 🔹 Modal */}
            {showModal && (
                <ContentModal
                    setShowModal={setShowModal}
                    property={selectedProperty}
                />
            )}
        </div>
    );
};

export default CoverContent;