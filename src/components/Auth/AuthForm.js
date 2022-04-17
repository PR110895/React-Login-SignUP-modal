import { useState, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import AuthContext from "../../store/auth-context";

import classes from "./AuthForm.module.css";

const AuthForm = () => {
  //Hostory Hook
  const history = useHistory();

  // Refs
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  //context
  const authCtx = useContext(AuthContext);

  // State
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setisLoading] = useState(false);

  // State Changing Handler
  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };
  //Form Submit Handler
  const submitHandler = (event) => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    // User Control
    setisLoading(true);
    let url;
    if (isLogin) {
      //Login user
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAOaLWefjXetZWNjTjW7X70u8A8pK5jicI";
    } else {
      ///Create user
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAOaLWefjXetZWNjTjW7X70u8A8pK5jicI";
    }
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setisLoading(false);
        if (res.ok) {
          return res.json();
        } else {
          res.json().then((data) => {
            //Show an error modal
            let errorMessage = "Authentication failed";
            if (data && data.error && data.error.message) {
              errorMessage = data.error.message;
            }
            throw new Error(errorMessage);
          });
        }
      })
      .then((data) => {
        // console.log(data);
        authCtx.login(data.idToken);
        history.replace("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? "Login" : "Create Account"}</button>
          )}
          {isLoading && <p>Sending request...</p>}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
