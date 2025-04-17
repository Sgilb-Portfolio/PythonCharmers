import React, { createContext, useContext, useState } from 'react';

const ViewAsContext = createContext();

export const ViewAsProvider = ({ children }) => {
  const [viewAsRole, setViewAsRole] = useState(null);
  const [viewAsUserData, setViewAsUserData] = useState(null);

  const currentUserRole = localStorage.getItem("userRole"); // example: 'admin' | 'sponsor' | 'driver'

  const startImpersonation = (role, data) => {
    if (currentUserRole !== "sponsor") {
      console.warn("Only sponsors can use 'View As' feature.");
      return;
    }
    setViewAsRole(role);
    setViewAsUserData(data);
  };

  const stopImpersonation = () => {
    setViewAsRole(null);
    setViewAsUserData(null);
  };

  return (
    <ViewAsContext.Provider value={{
      viewAsRole,
      viewAsUserData,
      startImpersonation,
      stopImpersonation,
      currentUserRole,
    }}>
      {children}
    </ViewAsContext.Provider>
  );
};

export const useViewAs = () => useContext(ViewAsContext);
