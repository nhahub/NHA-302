import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { UserProvider } from "../features/user/UserContext";
import { CompanyProvider } from "../features/company/CompanyContext";

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <CompanyProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </CompanyProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
