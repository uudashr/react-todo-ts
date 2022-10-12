import * as React from 'react';
import {
  Navigate,
  useLocation,
} from 'react-router-dom';

type Callback = (error?: Error) => void;

interface Auth {
  token: string | null;
  logIn(email: string, password: string, callback: Callback): void;
  signOut(): void;
};

const NO_OP_AUTH: Auth = {
  token: null,
  logIn: (email: string, password: string, callback: Callback) => callback(),
  signOut: () => {}
};

export interface AuthClient {
  logIn(email: string, password: string): Promise<string>
  logOut(): void;
  token(): string | null
};

export const AuthContext = React.createContext<Auth>(NO_OP_AUTH);

export function useAuth(): Auth {
  return React.useContext(AuthContext);
}

type AuthProviderProps = {
  authClient?: AuthClient;
  children: React.ReactNode;
}

export function AuthProvider({ authClient, children }: AuthProviderProps) {

  const [token, setToken] = React.useState<string|null>(authClient?.token() || null);

  const logIn = (email: string, password: string, callback: Callback): void => {
    if (!authClient) {
      callback();
      return;
    }

    authClient.logIn(email, password)
      .then(token => {
        setToken(token);
        callback();
      })
      .catch((e) => {
        callback(e);
      });
  }

  const signOut = (): void => {
    if (!authClient) {
      return;
    }
    
    authClient.logOut();
    setToken(null);
  }

  const value = { token, logIn, signOut }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

type RequireAuthProps = {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {

  const auth = useAuth();
  const location = useLocation();

  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>;
}