import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as pricing_billingApi from "../../api/pricing_billing";

// Billing summary (for current user)
export const useBilling = () =>
  useQuery({
    queryKey: ["billing"],
    queryFn: pricing_billingApi.getBillingSummary,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

// Track usage and refresh billing summary
export const useTrackUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pricing_billingApi.trackUsage,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["billing"]);
      await queryClient.refetchQueries(["billing"]);
    },
  });
};

// Attach payment card
export const useAttachCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pricing_billingApi.attatchCard,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["billing"]);
      await queryClient.refetchQueries(["billing"]);
    },
    onError: (err) => {
      console.log("Error attaching card", err);
    },
  });
};

//Remove payment card

export const useRemoveCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pricing_billingApi.deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
};
