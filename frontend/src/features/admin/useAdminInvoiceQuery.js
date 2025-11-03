import { useQuery } from "@tanstack/react-query";
import * as invoiceApi from "../../api/invoice";
export function useInvoicesByCompany(companyId) {
  return useQuery({
    queryKey: ["invoices", "company", companyId],
    queryFn: () => invoiceApi.getInvoicesByCompany(companyId),
    enabled: !!companyId,
  });
}
