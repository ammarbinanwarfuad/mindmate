import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../utils/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from backend
  const fetchUserData = async (firebaseUser = null) => {
    try {
      const response = await api.get('/auth/me');
      console.log('User data from backend:', response.data.user);
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      console.error('Error fetching user data:', err);
      console.error('Error details:', err.response?.data || err.message);
      // Fallback to basic user data if backend fails
      if (firebaseUser) {
        const fallbackUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          profile: { name: firebaseUser.displayName || 'User' }
        };
        console.log('Using fallback user data:', fallbackUser);
        setUser(fallbackUser);
      }
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch full user data from backend
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle fetching user data
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, password, name) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Sync with backend
      await api.post('/auth/sync', {
        name: name,
        email: email
      });
      
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser: fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
