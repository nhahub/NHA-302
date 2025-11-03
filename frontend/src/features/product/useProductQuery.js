import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
  getStockStatus,
  exportProducts,
  getProductsByCompany,
} from "../../api/product.js";

export const useProductById = (id) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id, // only fetch if id exists
  });

export const useProductsByCompany = (companyId) =>
  useQuery({
    queryKey: ["products", "company", companyId],
    queryFn: () => getProductsByCompany(companyId),
    enabled: !!companyId,
  });

export const useStockStatus = (id) =>
  useQuery({
    queryKey: ["product", "stock", id],
    queryFn: () => getStockStatus(id),
    enabled: !!id,
  });

export const useExportProducts = (id) =>
  useQuery({
    queryKey: ["products", "export", id],
    queryFn: () => exportProducts(id),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["product", id]);
      queryClient.invalidateQueries(["products"]);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(["products"]);
      queryClient.removeQueries(["product", id]);
    },
  });
};
