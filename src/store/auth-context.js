import React, { useState, useEffect, useCallback } from "react";

let logoutTimer;

// Auth Context
const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});
//Calculating Remaining time function
const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();

  const remainingDuration = adjExpirationTime - currentTime;

  return remainingDuration;
};
//Retrive Token
const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpirationDate = localStorage.getItem("expirationTime");

  const remaningTime = calculateRemainingTime(storedExpirationDate);
  if (remaningTime <= 3600) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }

  return {
    token: storedToken,
    duration: remaningTime,
  };
};

//Auth Context Provider
export const AuthContextProvider = (props) => {
  // check for isLogin or not
  const tokenData = retrieveStoredToken();

  // initally check localstorage for token
  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token;
  }

  // State
  const [token, setToken] = useState(initialToken);

  // Check for use login or not
  const userIsLoggedIn = !!token;

  //Logout handler
  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  //Loginhandler
  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);

    const remaningTime = calculateRemainingTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remaningTime);
  };

  //UseEffect hook
  useEffect(() => {
    if (tokenData) {
      console.log(tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
