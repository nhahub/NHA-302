import { createContext, useState, useEffect } from "react";
import * as companyApi from "../../api/company";

const CompanyContext = createContext();

function CompanyProvider({ children }) {
  const [currentCompany, setCurrentCompany] = useState(() => {
    const stored = localStorage.getItem("company");
    return stored ? JSON.parse(stored) : null;
  });

  const [isCompanySelected, setIsCompanySelected] = useState(!!currentCompany);

  useEffect(() => {
    setIsCompanySelected(!!currentCompany);
  }, [currentCompany]);

  // On mount: if we don't have a company stored, try to fetch the user's company from the API
  useEffect(() => {
    const ensureCompanyFromServer = async () => {
      // If we already have a company in state, skip fetching
      if (currentCompany && (currentCompany._id || currentCompany.id)) return;

      try {
        const res = await companyApi.getMyCompany();
        if (res && res.data) {
          saveCompany(res.data);
        }
      } catch {
        // Ignore errors (404 = no company, 401 = not authenticated)
      }
    };

    ensureCompanyFromServer();
    // We intentionally run this only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCompany = (company) => {
    if (!company) return;
    localStorage.setItem("company", JSON.stringify(company));
    setCurrentCompany(company);
    setIsCompanySelected(true);
  };

  const createCompany = async (data) => {
    const res = await companyApi.createCompany(data);
    saveCompany(res.data);
  };

  const updateCompany = async (data) => {
    if (!currentCompany?._id) return;
    const res = await companyApi.updateCompany(currentCompany._id, data);
    const updated = { ...currentCompany, ...res.data };
    saveCompany(updated);
  };

  const deleteCompany = async () => {
    if (!currentCompany?._id) return;
    await companyApi.deleteCompany(currentCompany._id);
    clearCompany();
  };

  const clearCompany = () => {
    setCurrentCompany(null);
    setIsCompanySelected(false);
    localStorage.removeItem("company");
  };

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        isCompanySelected,
        saveCompany,
        createCompany,
        updateCompany,
        deleteCompany,
        clearCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export { CompanyProvider, CompanyContext };
