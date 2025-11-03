import { useQuery } from "@tanstack/react-query";
import {
  getReportStats,
  getRevenueOverTime,
  getTopProducts,
  getTopCustomers,
} from "../../api/report.js";

export const useReportStats = () =>
  useQuery({
    queryKey: ["reports", "stats"],
    queryFn: getReportStats,
  });

export const useRevenueOverTime = (period = 'month') =>
  useQuery({
    queryKey: ["reports", "revenue", period],
    queryFn: () => getRevenueOverTime(period),
  });

export const useTopProducts = () =>
  useQuery({
    queryKey: ["reports", "top-products"],
    queryFn: getTopProducts,
  });

export const useTopCustomers = () =>
  useQuery({
    queryKey: ["reports", "top-customers"],
    queryFn: getTopCustomers,
  });
