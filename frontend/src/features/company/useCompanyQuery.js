import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as companyApi from "../../api/company";
import { useContext } from "react";
import { CompanyContext } from "../company/CompanyContext";

export function useCompany(id) {
  const { saveCompany } = useContext(CompanyContext);
  return useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const res = await companyApi.getCompany(id);
      saveCompany(res.data);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { saveCompany } = useContext(CompanyContext);

  return useMutation({
    mutationFn: companyApi.createCompany,
    onSuccess: (res) => {
      saveCompany(res.data);
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}

export function useUpdateCompany(id) {
  const queryClient = useQueryClient();
  const { saveCompany } = useContext(CompanyContext);

  return useMutation({
    mutationFn: (data) => companyApi.updateCompany(id, data),
    onSuccess: (res) => {
      saveCompany(res.data);
      queryClient.invalidateQueries({ queryKey: ["company", id] });
    },
  });
}

export function useDeleteCompany(id) {
  const queryClient = useQueryClient();
  const { clearCompany } = useContext(CompanyContext);

  return useMutation({
    mutationFn: () => companyApi.deleteCompany(id),
    onSuccess: () => {
      clearCompany();
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}
