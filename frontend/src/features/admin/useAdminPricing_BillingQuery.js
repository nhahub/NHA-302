import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as pricing_billingAdminApi from "../../api/pricing_billing";
export const useAdminBilling = () =>
  useQuery({
    queryKey: ["admin-billing"],
    queryFn: pricing_billingAdminApi.getAdminBillingSummary,
  });

export const useChargeAllUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pricing_billingAdminApi.chargeAllUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-billing"] });
    },
  });
};
