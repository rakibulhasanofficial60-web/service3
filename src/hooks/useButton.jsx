import { useQuery } from "@tanstack/react-query";

const useButton = () => {
    const { data: button = [], isLoading: loadingButton, error, refetch } = useQuery({
        queryKey: ["all-button"],
        queryFn: async () => {
            const res = await fetch("https://job-task-nu.vercel.app/api/v1/service-type");
            const data = await res.json();
            return data.Data;
        }
    });

    return [button, loadingButton, error, refetch];
};

export default useButton;