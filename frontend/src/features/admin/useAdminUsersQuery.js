import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminApi from "../../api/users";

//Queries
export const useGetAdmin = (id) => {
  return useQuery({
    queryKey: ["admin", id],
    queryFn: () => adminApi.getAdmin(id),
    enabled: !!id, // Only run the query if id is provided
  });
};
export const useGetAllAdmins = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: adminApi.getAllAdmins,
  });
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: adminApi.getAllUsers,
  });
};

// Mutations

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useUpdateAdmin = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminApi.updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", id] });
    },
  });
};

export const useDeleteAdmin = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
};

export const useDeleteUser = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
};
