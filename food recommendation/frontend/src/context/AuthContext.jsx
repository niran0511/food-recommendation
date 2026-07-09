import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
<<<<<<< HEAD
=======
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth';
>>>>>>> 843d1be00973b4f1626346e9e427c402c314a65d

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
        } catch (error) {
          console.error("Failed to fetch user", error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken } = res.data.data;
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { user: newUser, accessToken } = res.data.data;
    setUser(newUser);
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    return newUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    }
=======
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          localStorage.setItem('accessToken', idToken);
          setToken(idToken);
          
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
        } catch (error) {
          console.error("Failed to restore user session", error);
          setUser(null);
          setToken(null);
          localStorage.removeItem('accessToken');
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('accessToken');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    // 1. Authenticate with Firebase Client
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // 2. Fetch JWT Token
    const idToken = await firebaseUser.getIdToken(true);
    localStorage.setItem('accessToken', idToken);
    setToken(idToken);
    
    // 3. Load database profile representation
    const res = await api.get('/auth/me');
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const register = async (userData) => {
    const { email, password, name, age, gender, height, weight, activityLevel, goal, dietType } = userData;
    
    // 1. Create client credentials inside Firebase Auth directory
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // 2. Retrieve JWT ID Token
    const idToken = await firebaseUser.getIdToken(true);
    localStorage.setItem('accessToken', idToken);
    setToken(idToken);
    
    // 3. Save profile metadata into MongoDB via Express backend
    const res = await api.post('/auth/register', {
      firebaseUid: firebaseUser.uid,
      name,
      email,
      profile: {
        age,
        gender,
        height,
        weight,
        activityLevel,
        goal,
        dietType
      }
    });
    
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const loginWithProvider = async (providerName) => {
    let provider;
    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'github') {
      provider = new GithubAuthProvider();
    } else {
      throw new Error("Provider not supported");
    }

    // 1. Popup auth verification
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // 2. Retrieve JWT ID Token
    const idToken = await firebaseUser.getIdToken(true);
    localStorage.setItem('accessToken', idToken);
    setToken(idToken);

    // 3. Load DB record
    const res = await api.get('/auth/me');
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const logout = async () => {
    await signOut(auth);
>>>>>>> 843d1be00973b4f1626346e9e427c402c314a65d
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
=======
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, loginWithProvider }}>
>>>>>>> 843d1be00973b4f1626346e9e427c402c314a65d
      {children}
    </AuthContext.Provider>
  );
};
