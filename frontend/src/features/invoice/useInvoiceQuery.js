import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as invoiceApi from "../../api/invoice";

export function useInvoice(id) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceApi.getInvoice(id),
    enabled: !!id, // Only fetch if id is provided
  });
}

export function useAllInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceApi.getAllInvoices,
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ["invoiceStats"],
    queryFn: invoiceApi.getInvoiceStats,
  });
}

export function useInvoicesByStatus(status) {
  return useQuery({
    queryKey: ["invoices", "status", status],
    queryFn: () => invoiceApi.getInvoicesByStatus(status),
    enabled: !!status,
  });
}

export function useInvoicesByCompany(companyId) {
  return useQuery({
    queryKey: ["invoices", "company", companyId],
    queryFn: () => invoiceApi.getInvoicesByCompany(companyId),
    enabled: !!companyId, // Only fetch if companyId is provided
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => invoiceApi.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => invoiceApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useExportInvoice(id) {
  return useQuery({
    queryKey: ["invoiceExport", id],
    queryFn: () => invoiceApi.exportInvoice(id),
    enabled: !!id,
  });
}
