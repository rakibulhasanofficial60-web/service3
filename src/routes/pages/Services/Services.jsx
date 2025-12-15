
import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
import Summery from "../../../components/Summery/Summery";
import Cover from "../../../components/Cover/Cover";
import CoverContent from "../../../components/CoverContent/CoverContent";
import Card from "../../../components/Card/Card";
import NextBtn from "../../../components/NextBtn/NextBtn";
import useDashboardPropertyItem from "../../../hooks/useDashboardPropertyItem";
import dirhum from '../../../assets/icon/dirhum.png';
import { useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoAddSharp } from "react-icons/io5";
import { useItem } from "../../../provider/ItemProvider";
import { useSummary } from "../../../provider/SummaryProvider";

const Services = () => {
    const { services, button, setActiveId, activeId, content, itemSummary, vat, serviceCharge, showInput, setShowInput, serviceTitle } = useSummary();

    const { addItem, removeItem } = useItem();
    const sectionRefs = useRef({});
    const [propertyItem] = useDashboardPropertyItem();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [showBackdrop, setShowBackdrop] = useState(false);

    const handleAdd = (id) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: 1,
        }));

        addItem(id);
    };

    const handleRemove = (id) => {
        setQuantities((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
        removeItem(id);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim() === "") {
            setSuggestions([]);
            setShowBackdrop(false);
            return;
        }
        const filtered = propertyItem.filter((item) =>
            item?.title?.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setShowBackdrop(filtered.length > 0);
    };

    const closeSuggestions = () => {
        setSuggestions([]);
        setShowBackdrop(false);
        setQuery("");
    };

    useEffect(() => {
        if (activeId && sectionRefs.current[activeId]) {
            const section = sectionRefs.current[activeId];
            const yOffset = -120;
            const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    }, [activeId]);

    return (
        <div>
            <div className="mt-14 md:mt-0">
                <ServiceDetails title="Service Details" currentStep={1} />
            </div>
            <div className="md:flex gap-8 mt-5">
                {/* Left */}
                <div className="md:w-[60%] md:mb-4 md:space-y-4">

                    {/* 🔍 SEARCH INPUT + SUGGESTIONS */}
                    <div className="relative p-4 md:p-0">
                        <input
                            className="py-2 md:py-3 px-3 border border-[#01788E] w-full rounded-md md:px-7 focus:outline-none"
                            type="text"
                            placeholder="Search services..."
                            value={query}
                            onChange={handleChange}
                        />

                        {/* BACKDROP */}
                        {showBackdrop && (
                            <div
                                className="fixed inset-0 bg-black/20 z-40"
                                onClick={closeSuggestions}
                            ></div>
                        )}

                        {/* SUGGESTION BOX */}
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-md rounded-md mt-1 z-40 max-h-[90vh] overflow-y-auto p-8">
                                {suggestions.length > 0 ? (
                                    suggestions.map((item) => {
                                        const qty = quantities[item.id] || 0;
                                        return (
                                            <div
                                                key={item.id}
                                                className="md:flex items-center border-b pb-2.5 border-gray-300 space-y-2 mb-4"
                                            >
                                                {/* Image */}
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-24 h-24 mx-auto object-cover rounded-sm"
                                                />

                                                {/* Content */}
                                                <div className="ml-5 space-y-2 flex-1 text-center md:text-start">
                                                    <div>
                                                        <h3 className="text-[16px] font-semibold">{item.title}</h3>
                                                        <p className="text-gray-600 text-[13px]">{item.description}</p>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[#382F31] font-bold text-[14px] flex items-center gap-1">
                                                            <img className="h-[15px] w-[15px]" src={dirhum} alt="" /> {item.price}
                                                        </p>

                                                        {/* Add / Quantity Controller */}
                                                        {qty === 0 ? (
                                                            <button
                                                                onClick={() => handleAdd(item.id)}
                                                                className="cursor-pointer border px-2 py-1 flex items-center gap-2 text-[#01788E] rounded-xs hover:bg-gray-100 transition text-[13px]"
                                                            >
                                                                Add <IoAddSharp />
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => handleRemove(item.id)}
                                                                    className="text-[#01788E] border rounded-full font-bold text-lg px-[7px] cursor-pointer"
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="font-semibold text-gray-700">
                                                                    {qty}
                                                                </span>

                                                                <button
                                                                    disabled
                                                                    className="text-gray-400 font-bold text-lg px-2 cursor-not-allowed border rounded-full border-[#014855]"
                                                                    title="Maximum quantity reached"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-500">No options available.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SERVICE LIST + BUTTONS + CONTENT */}
                    <div className="shadow-md rounded-xl">
                        <div>
                            {services?.map((service) => (
                                <div key={service.id}>
                                    <Card service={service} />

                                    {/* BUTTON SLIDER */}
                                    <div className="px-2 md:px-9 bg-white py-3 sticky top-16 z-10">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const scroller = document.getElementById(`btn-slider-${service.id}`);
                                                    scroller?.scrollBy({ left: -300, behavior: "smooth" });
                                                }}
                                                className="text-3xl font-bold text-[#01788E]"
                                            >
                                                <IoIosArrowBack />
                                            </button>

                                            <div
                                                id={`btn-slider-${service.id}`}
                                                className="flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 py-2 w-full"
                                            >
                                                {button
                                                    ?.filter((b) => b.serviceId === service.id)
                                                    .map((b) => (
                                                        <button
                                                            key={b.id}
                                                            onClick={() => setActiveId(b.id)}
                                                            className={`snap-start shrink-0 min-w-[140px] px-4 py-1 rounded-full border flex items-center gap-2 transition
                                                                ${activeId === b.id
                                                                    ? "text-[#ED6329] border-[#ED6329] border-2 bg-[#FFF2EE]"
                                                                    : "text-[#01788E] border-[#01788E] bg-white"}`}
                                                        >
                                                            <img className="w-7 h-7 rounded-full" src={b.image} alt={b.title} />
                                                            {b.title}
                                                        </button>
                                                    ))}
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const scroller = document.getElementById(`btn-slider-${service.id}`);
                                                    scroller?.scrollBy({ left: 300, behavior: "smooth" });
                                                }}
                                                className="text-3xl font-bold text-[#01788E]"
                                            >
                                                <IoIosArrowForward />
                                            </button>
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="px-3 md:px-9 mt-3 space-y-6">
                                        {content
                                            ?.filter((c) => c.serviceId === service.id)
                                            .map((c) => (
                                                <div
                                                    key={c.id}
                                                    ref={(el) => (sectionRefs.current[c.id] = el)}
                                                    className="scroll-mt-24"
                                                >
                                                    <Cover content={c} />
                                                    <CoverContent content={c} />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2 px-3 pb-4 md:px-9 md:pb-6">
                            <h3 className="font-medium">Do you have any special instructions? (Optional)</h3>
                            <textarea
                                className="textarea text-sm bg-white w-full focus:outline-none border border-black"
                                placeholder="Example: Please mention any sensitivities, allergies or any particular requirements you may have."
                            ></textarea>
                        </div>
                    </div>
                </div>

                <Summery serviceTitle={serviceTitle} itemSummary={itemSummary} total={serviceCharge + (serviceCharge * 0.05)} showInput={showInput} setShowInput={setShowInput} vat={vat} subTotal={serviceCharge} serviceCharge={serviceCharge} />
            </div>
            <div className="hidden md:block">
                <NextBtn disabled={itemSummary.length === 0} />
            </div>
        </div>
    );
};

export default Services;