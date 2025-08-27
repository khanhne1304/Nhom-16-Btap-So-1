import { useSelector, useDispatch } from 'react-redux';
import { 
  login, 
  register, 
  verifyOTP, 
  resendOTP, 
  sendLogoutOTP, 
  verifyLogoutOTP, 
  updateProfile,
  logout,
  clearError,
  clearLogoutOTP,
  clearRegisterOTP,
  setUser
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    // State
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    logoutOTP: auth.logoutOTP,
    registerOTP: auth.registerOTP,

    // Actions
    login: (credentials) => dispatch(login(credentials)),
    register: (userData) => dispatch(register(userData)),
    verifyOTP: (otpData) => dispatch(verifyOTP(otpData)),
    resendOTP: (email) => dispatch(resendOTP(email)),
    sendLogoutOTP: (email) => dispatch(sendLogoutOTP(email)),
    verifyLogoutOTP: (otpData) => dispatch(verifyLogoutOTP(otpData)),
    updateProfile: (profileData) => dispatch(updateProfile(profileData)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
    clearLogoutOTP: () => dispatch(clearLogoutOTP()),
    clearRegisterOTP: () => dispatch(clearRegisterOTP()),
    setUser: (user) => dispatch(setUser(user)),
  };
};
