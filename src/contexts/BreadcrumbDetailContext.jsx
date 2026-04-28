import { createContext, useContext } from 'react';

export const BreadcrumbDetailContext = createContext({
  setDetailLabel: () => {},
});

export function useBreadcrumbDetail() {
  return useContext(BreadcrumbDetailContext);
}
