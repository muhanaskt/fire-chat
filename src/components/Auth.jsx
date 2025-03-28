import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import styles from "./Auth.module.scss";
import { useNavigate } from "react-router-dom";

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Handle Email/Password Authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      setUser(userCredential.user);
      navigate("/chat/home");
    } catch (error) {
      setError(error.message);
      console.error("Auth error:", error.message);
    }
  };

  // Handle Google Sign-in
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      navigate("/chat/home");
    } catch (error) {
      console.error("Google Sign-in error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>{isSignUp ? "Sign Up" : "Log In"}</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleAuth}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          {isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>
      <button onClick={handleGoogleLogin} className={styles.googleButton}>
        Sign in with Google
      </button>
      <button onClick={() => setIsSignUp(!isSignUp)} className={styles.switchButton}>
        Switch to {isSignUp ? "Log In" : "Sign Up"}
      </button>
    </div>
  );
};

export default Auth;
