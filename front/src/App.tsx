import React, { useReducer, createContext, useContext, useEffect } from "react";
import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom";
import WelcomePage from "./container/wellcomePage";
import SignupPage from "./container/signup";
import SigninPage from "./container/signin";
import RecoveryPage from "./container/recoveryPage";
import RecoveryConfirmPage from "./container/recoveryConfirm";
import SignupConfirmPage from "./container/signupConfirm";
import BalancePage from "./container/balancePage";
import ReceivePage from "./container/receivePage";
import SendPage from "./container/sendPage";
import SettingsPage from "./container/settingsPage";
import TransactionPage from "./container/transactionPage";
import NotificationsPage from "./container/notificationsPage";
import { Notifications } from "./component/notifications";
import { BalanceState } from "./component/balanceState";
import Error from "./component/error";

export const Authentication = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  CONFIRM_ACCOUNT: "CONFIRM_ACCOUNT",
  UPDATE_TOKEN: "UPDATE_TOKEN",
  UPDATE_NOTIFICATIONS: "UPDATE_NOTIFICATIONS",
  UPDATE_BALANCE: "UPDATE_BALANCE",
};

export type User = {
  confirmCode: number;
  confirm: boolean;
  email: string;
  password: string;
  token: string;
};

type State = {
  token: string | null;
  user: User | null;
  balance: string | null;
  notifications?: Notifications[];
};

type Action = {
  type: string;
  payload: {
    token?: string;
    user?: any;
    balance?: string;
    notifications?: Notifications[];
  };
};

interface ChildProps {
  children: React.ReactNode;
}

const initialArg: State = {
  token: null,
  user: { confirm: false, email: "", password: "", token: "", confirmCode: 0 },
  balance: null,
};

export const authReducer = (state: State, action: Action) => {
  switch (action.type) {
    case Authentication.LOGIN:
      return {
        ...state,
        token: action.payload.token || null,
        user: action.payload.user || null,
      };
    case Authentication.LOGOUT:
      return {
        ...state,
        token: null,
        user: null,
      };
    case Authentication.CONFIRM_ACCOUNT:
      return {
        ...state,
        user: {
          ...state.user,
          confirm: true,
        },
      };
    case Authentication.UPDATE_TOKEN:
      return {
        ...state,
        token: action.payload.token || null,
      };
    case Authentication.UPDATE_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
      };
    case Authentication.UPDATE_BALANCE:
      return {
        ...state,
        user: {
          ...state.user,
          balance: action.payload.balance,
        },
      };
    default:
      return state;
  }
};

export const AuthContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialArg, dispatch: () => {} });

export const AuthRoute: React.FC<ChildProps> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const { dispatch } = authContext;

  useEffect(() => {
    const authentification = async () => {
      if (!authContext) {
        console.error("AuthRoute - No authContext");
        return null;
      }

      if (authContext.state.token) {
        try {
          const res = await fetch(`http://localhost:4000/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authContext.state.token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.confirm) {
              dispatch({
                type: Authentication.UPDATE_BALANCE,
                payload: { balance: data.balance },
              });
              return <>{children}</>;
            } else {
              return <Navigate to="/signup-confirm" />;
            }
          } else {
            return <Navigate to="/signin" />;
          }
        } catch (err) {
          console.error("Error checking authentication:", err);
        }
      }
    };
    authentification();
  }, [authContext, children, dispatch]);
  return <>{children}</>;
};

function AuthData() {
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(
    authReducer,
    initialArg
  );
  return { state, dispatch };
}

export const PrivateRoute: React.FC<{
  children: React.ReactElement;
}> = ({ children }) => {
  const authContext = useContext(AuthContext);

  const getUserInfo = async (token: string | null) => {
    try {
      const res = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        throw Error("Failed to fetch user info");
      }

      const data = await res.json();
      console.log("User Info:", data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (authContext.state.token) {
      getUserInfo(authContext.state.token);
    }
  }, [authContext.state.token]);

  if (!authContext) {
    console.error("PrivateRoute - No authContext");
    return null;
  }

  if (!authContext.state.token) {
    console.error("PrivateRoute - No token", authContext);
  }

  const confirmValue = localStorage.getItem("confirm");

  if (authContext.state.token) {
    if (
      confirmValue === "true" ||
      (authContext.state.token && authContext.state.user?.confirm)
    ) {
      return <>{children}</>;
    } else {
      if (window.location.pathname !== "/signup-confirm") {
        return <Navigate to="/signup-confirm" />;
      } else {
        return <>{children}</>;
      }
    }
  } else {
    return <Navigate to="/signin" />;
  }
};

function App() {
  const authContextData = AuthData();

  return (
    <AuthContext.Provider value={authContextData}>
      <BrowserRouter>
        <Routes>
          <Route
            index
            element={
              <AuthRoute>
                <WelcomePage />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <SignupPage />
              </AuthRoute>
            }
          />
          <Route
            path="/signup-confirm"
            element={
              <PrivateRoute>
                <SignupConfirmPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <AuthRoute>
                <SigninPage />
              </AuthRoute>
            }
          />
          <Route
            path="/recovery"
            element={
              <AuthRoute>
                <RecoveryPage />
              </AuthRoute>
            }
          />
          <Route
            path="/recovery-confirm"
            element={
              <AuthRoute>
                <RecoveryConfirmPage />
              </AuthRoute>
            }
          />
          <Route
            path="/balance"
            element={
              <PrivateRoute>
                <BalancePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/receive"
            element={
              <PrivateRoute>
                <ReceivePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/send"
            element={
              <PrivateRoute>
                <SendPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/transaction/:transactionId"
            element={
              <PrivateRoute>
                <TransactionPage />
              </PrivateRoute>
            }
          />
          <Route path="*" Component={Error} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
