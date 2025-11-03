import { useQuery } from "@tanstack/react-query";
import { getAllCustomers, getCustomerCountByCompany } from "../../api/customer";

export const useAllCustomers = () =>
  useQuery({
    queryKey: ["customers"],
    queryFn: getAllCustomers,
  });

export const useCustomerCountByCompany = (id) =>
  useQuery({
    queryKey: ["customerCountByCompany", id],
    queryFn: () => getCustomerCountByCompany(id),
    enabled: !!id,
  });
