import { useQuery } from "@tanstack/react-query";
import * as adminApi from "../../api/company";

export const useGetAllCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: adminApi.getAllCompanies,
  });
};
