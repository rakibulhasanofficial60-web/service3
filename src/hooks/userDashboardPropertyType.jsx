import { useQuery } from "@tanstack/react-query";

const useDashboardPropertyType = () => {

    const { data: propertyType = [], refetch, isLoading } = useQuery({
        queryKey: ['propertyType'],
        queryFn: async () => {
            const res = await fetch("https://job-task-nu.vercel.app/api/v1/property-type");
            const data = await res.json();
            return data.Data;
        }
    });

    return [propertyType, refetch, isLoading];
};

export default useDashboardPropertyType;
