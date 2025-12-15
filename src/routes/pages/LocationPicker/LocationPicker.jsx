import { useState, useCallback } from "react";
import { FaLocationCrosshairs, FaPlus, FaMinus } from "react-icons/fa6";
import { FaSatellite } from "react-icons/fa";
import { GoogleMap, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import NextBtn from "../../../components/NextBtn/NextBtn";
import Summery from "../../../components/Summery/Summery";
import { useSummary } from "../../../provider/SummaryProvider";
import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
import { useNavigate } from "react-router-dom";

const containerStyle = { width: "100%", height: "500px" };
const defaultCenter = { lat: 23.8103, lng: 90.4125 };

export default function LocationPicker() {
    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    });

    const { itemSummary, vat, serviceCharge, showInput, setShowInput, address, serviceTitle, setMapLongitude, setMapLatitude, setAddressLocation, liveAddress } = useSummary();

    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [mapAddressSelected, setMapAddressSelected] = useState(false);
    const [fromListSelection, setFromListSelection] = useState(false);
    const [selectedPos, setSelectedPos] = useState(defaultCenter);
    const [map, setMap] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [mapType, setMapType] = useState("roadmap");


    const getAddressFromLatLng = (lat, lng) => {
        const geocoder = new window.google.maps.Geocoder();
        return new Promise((resolve, reject) => {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    reject("Address not found");
                }
            });
        });
    };

    const handleLocation = async (pos) => {
        setSelectedPos(pos);
        map?.panTo(pos);
        await getAddressFromLatLng(pos.lat, pos.lng);
        setMapLatitude(pos.lat);
        setMapLongitude(pos.lng);
    };

    const onLoadAutocomplete = (auto) => setAutocomplete(auto);

    const onPlaceChanged = async () => {
        if (!autocomplete) return;
        const place = autocomplete.getPlace();
        if (!place.geometry) return;
        const pos = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        };
        handleLocation(pos);

        const addressLocation = await getAddressFromLatLng(pos.lat, pos.lng);
        setAddressLocation(addressLocation);
        setIsNextDisabled(false);
        setMapAddressSelected(true);
        setFromListSelection(false);
    };

    const handleMapClick = useCallback(
        async (event) => {
            const pos = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };
            handleLocation(pos);

            const addressLocation = await getAddressFromLatLng(pos.lat, pos.lng);
            setAddressLocation(addressLocation);
            setIsNextDisabled(false);
            setMapAddressSelected(true);
            setFromListSelection(false);
        },
        [map]
    );

    // GPS Button
    const gotoMyLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            handleLocation(pos);
            setIsNextDisabled(false);
            setMapAddressSelected(true);
            setFromListSelection(false);
        });
    };


    const handleNextClick = async () => {
        if (fromListSelection) {
            navigate('/date-time');
            return false;
        } else if (mapAddressSelected) {
            navigate('/address');
            return false;
        }
        return true;
    };

    if (!isLoaded) return <div>Loading map…</div>;
    return (
        <div>
            <div className="mt-14 md:mt-0">
                <ServiceDetails title="Address" currentStep={2} />
            </div>
            <div className="flex gap-8 mt-5">
                <div className="md:w-[60%] mb-4 space-y-4 relative shadow-md w-full p-1" confir>
                    <h2 className="text-[27px] font-semibold ml-12">Where do you need the service?</h2>

                    {/* Search Input */}
                    <div className="absolute md:top-18 left-1/2 -translate-x-1/2 z-20 w-11/12">
                        <div className="shadow-lg bg-white rounded-md">
                            <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                                <input
                                    type="text"
                                    placeholder="Search for your address…"
                                    className="w-full p-3 border rounded-md focus:outline-none"
                                />
                            </Autocomplete>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="absolute top-80 right-3 z-20 flex flex-col space-y-2">
                        <button onClick={() => map?.setZoom(map.getZoom() + 1)} className="bg-white shadow p-2 rounded-lg">
                            <FaPlus />
                        </button>
                        <button onClick={() => map?.setZoom(map.getZoom() - 1)} className="bg-white shadow p-2 rounded-lg">
                            <FaMinus className="font-bold" />
                        </button>
                        <button onClick={gotoMyLocation} className="bg-white shadow p-2 rounded-lg flex items-center justify-center">
                            <FaLocationCrosshairs />
                        </button>
                        <button onClick={() => setMapType(mapType === "roadmap" ? "hybrid" : "roadmap")} className="bg-white shadow p-2 rounded-lg">
                            <FaSatellite />
                        </button>
                    </div>

                    {/* Google Map */}
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={selectedPos}
                        zoom={15}
                        onLoad={setMap}
                        onClick={handleMapClick}
                        mapTypeId={mapType}
                        options={{
                            disableDefaultUI: true,
                            zoomControl: false,
                            mapTypeControl: false,
                            fullscreenControl: false,
                            streetViewControl: false,
                            keyboardShortcuts: false,
                            gestureHandling: "greedy",
                            scrollwheel: false,
                        }}
                    >
                        <img
                            src="https://servicemarket.com/dist/images/map-marker.svg"
                            alt="center marker"
                            className="pointer-events-none"
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -100%)",
                                width: "80px",
                                height: "80px",
                                zIndex: 20,
                            }}
                        />
                    </GoogleMap>
                </div>

                <Summery
                    serviceTitle={serviceTitle}
                    address={address}
                    itemSummary={itemSummary}
                    total={serviceCharge + (serviceCharge * 0.05)}
                    subTotal={serviceCharge}
                    showInput={showInput}
                    setShowInput={setShowInput}
                    vat={vat}
                    serviceCharge={serviceCharge}
                    liveAddress={liveAddress}
                />
            </div>
            <div className="hidden md:block">
                <NextBtn
                    disabled={isNextDisabled}
                    onClick={handleNextClick}
                />
            </div>
        </div>
    );
};