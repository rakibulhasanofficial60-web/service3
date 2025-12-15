import { useLocation, useNavigate } from "react-router-dom";
import { useSummary } from "../../provider/SummaryProvider";
import { steps } from "./FlowSteps";

const NextBtn = ({ name = "Next", disabled, onClick }) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { addressLocation, date, time } = useSummary();

    const currentIndex = steps.indexOf(pathname);
    let nextPath = steps[currentIndex + 1];
    let isDisabled = disabled ?? false;

    if (pathname === "/location") {
        if (!addressLocation) {
            isDisabled = true;
        }
    }

    if (pathname === "/date-time" && (!date || !time)) isDisabled = true;

    const handleClick = async () => {
        let shouldNavigate = true;
        if (onClick) {
            try {
                const result = await onClick();
                if (result === false) {
                    shouldNavigate = false;
                }
            } catch (error) {
                console.error("Error in onClick handler:", error);
                shouldNavigate = false;
            }
        }
        if (shouldNavigate && nextPath) {
            navigate(nextPath);
        }
    };

    return (
        <div className="w-full p-2 flex justify-center md:fixed md:bottom-0 md:left-0 md:bg-white md:shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:z-40">
            <button
                onClick={handleClick}
                disabled={isDisabled}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-sm font-semibold text-white w-[90%] md:w-[60%] lg:w-60
                ${isDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-[#ED6329] hover:bg-[#d4541f] cursor-pointer"}`}
            >
                {name} <span className="text-xl">→</span>
            </button>
        </div>
    );
};

export default NextBtn;