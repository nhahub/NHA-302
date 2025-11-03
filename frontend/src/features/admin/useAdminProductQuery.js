import { useQuery } from "@tanstack/react-query";
import { getAllProducts, getProductsOverview } from "../../api/product";

export const useAllProducts = () =>
  useQuery({
    queryKey: ["products", "all"],
    queryFn: getAllProducts,
  });

export const useProductsOverview = () =>
  useQuery({
    queryKey: ["products", "overview"],
    queryFn: getProductsOverview,
  });
