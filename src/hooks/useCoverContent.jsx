import { useQuery } from "@tanstack/react-query";

const useCoverContent = () => {

    const { data: content = [], isLoading } = useQuery({
        queryKey: ['all-content'],
        queryFn: async () => {
            const res = await fetch("https://job-task-nu.vercel.app/api/v1/service-type");
            const data = await res.json();
            return data.Data;
        }
    })
    
    return [content, isLoading];
};

export default useCoverContent;