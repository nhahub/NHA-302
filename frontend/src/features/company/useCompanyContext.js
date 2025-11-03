import { useContext } from "react";
import { CompanyContext } from "./CompanyContext";

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (!context)
    throw new Error("useUserContext must be used inside UserProvider");
  return context;
}
