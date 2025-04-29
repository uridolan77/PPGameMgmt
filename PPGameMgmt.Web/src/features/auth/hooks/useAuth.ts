import { useStore } from '../../../core/store';

/**
 * Hook for accessing authentication state and methods
 * @returns Authentication state and methods from the Zustand store
 */
export const useAuth = () => {
  const { auth } = useStore();
  return auth;
};

export default useAuth;