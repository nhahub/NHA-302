import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userApi from "../../api/users";
import { useUserContext } from "../user/useUserContext";

export function useUser(id) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userApi.getCurrentUser(id),
    enabled: !!id,
  });
}

export function useSignup() {
  const { signup } = useUserContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.signup,

    onSuccess: (data) => {
      signup(data);
      // set the user data in the cache
      queryClient.setQueryData(["user", data.id], data);
    },
  });
}

export function useLogin() {
  const { login } = useUserContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.login,
    onSuccess: (data) => {
      login(data);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}
export function useGoogleAuth() {
  return () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };
}

export function useGoogleCallback() {
  const { login } = useUserContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.googlecallback,
    onSuccess: (data) => {
      login(data);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useLogout() {
  const { logout } = useUserContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.logout,
    onSuccess: () => {
      logout();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userApi.updatePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
