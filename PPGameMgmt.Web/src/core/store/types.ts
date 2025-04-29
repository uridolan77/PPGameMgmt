import { AuthState } from '../../features/auth/types';
import { UIState } from './slices/ui/types';
import { PreferencesState } from './slices/preferences/types';

export interface RootState {
  auth: AuthState;
  ui: UIState;
  preferences: PreferencesState;
}