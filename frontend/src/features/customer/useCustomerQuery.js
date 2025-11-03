import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerInvoices,
  getCustomerByCompany,
} from "../../api/customer";

export const useCustomer = (id) =>
  useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomer(id),
    enabled: !!id, // only runs if id is provided
  });

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["customer", variables.id]);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
    },
  });
};

export const useCustomerInvoices = (id) =>
  useQuery({
    queryKey: ["customerInvoices", id],
    queryFn: () => getCustomerInvoices(id),
    enabled: !!id,
  });

export const useCustomerByCompany = (id) =>
  useQuery({
    queryKey: ["customerByCompany", id],
    queryFn: () => getCustomerByCompany(id),
    enabled: !!id,
  });
