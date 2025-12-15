import { createContext, useContext, useEffect, useRef, useState } from "react";
import useAllServices from "../hooks/useAllServices";
import useCoverContent from "../hooks/useCoverContent";
import useButton from "../hooks/useButton";
import { useItem } from "./ItemProvider";
import { useQueries } from "@tanstack/react-query";

const SummaryContext = createContext();

export const SummaryProvider = ({ children }) => {
    const observer = useRef(null);
    const { data } = useItem();
    const [services] = useAllServices();
    const [content] = useCoverContent();
    const [button] = useButton();
    const [showInput, setShowInput] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [addressLocation, setAddressLocation] = useState(null);
    const [mapLatitude, setMapLatitude] = useState("");
    const [mapLongitude, setMapLongitude] = useState("");
    const [liveAddress, setLiveAddress] = useState("");


    useEffect(() => {
        const sections = document.querySelectorAll("[id^='content-']");
        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const visibleId = entry.target.getAttribute("id").replace("content-", "");
                        setActiveId(visibleId);
                    }
                });
            },
            { threshold: 0.5 }
        );
        sections.forEach((section) => observer.current.observe(section));
        return () => {
            if (observer.current) {
                sections.forEach((section) => observer.current.unobserve(section));
            }
        };
    }, [content]);

    const itemQueries = useQueries({
        queries: data.map((id) => ({
            queryKey: ["item-summary", id],
            queryFn: async () => {
                const res = await fetch(
                    `https://job-task-nu.vercel.app/api/v1/property-items/${id}`
                );
                const json = await res.json();
                return json?.Data;
            },
            enabled: !!id,
        })),
    });

    const itemSummary = itemQueries.map((q) => q.data).filter(Boolean);
    const serviceTitle = itemSummary.map(item =>
        item?.propertyType?.serviceType?.title || null
    );

    const serviceCharge = itemSummary.reduce((acc, item) => acc + Number(item?.price || 0), 0);
    const serviceFee = Number((serviceCharge > 0 ? 20 : 0).toFixed(2));
    const subTotal = Number(serviceCharge + serviceFee);
    const vat = Number((serviceCharge * 0.05).toFixed(2));
    const total = Number((serviceCharge + serviceFee + vat).toFixed(2));

    const summeryInfo = { serviceCharge, serviceFee, subTotal, vat, total, services, button, setActiveId, activeId, content, itemSummary, showInput, setShowInput, date, setDate, time, setTime, serviceTitle, mapLatitude, setMapLatitude, mapLongitude, setMapLongitude, addressLocation, setAddressLocation,  liveAddress, setLiveAddress };

    return (
        <SummaryContext.Provider value={summeryInfo}>
            {children}
        </SummaryContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSummary = () => useContext(SummaryContext);