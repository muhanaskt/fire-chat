import React, { useState } from "react";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import styles from "./Auth.module.scss";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Eye, EyeOff } from "lucide-react";

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const errorMessages = {
    "auth/email-already-in-use":
      "This email is already registered. Please log in.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Invalid email format.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/too-many-requests": "Too many login attempts. Try again later.",
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          setError("This email is already in use. Please log in instead.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(
          doc(db, "users", user.uid),
          {
            id: user.uid,
            name: user.email.split("@")[0],
            email: user.email,
            photoURL: user.photoURL || "",
            lastSeen: new Date().toISOString(),
          },
          { merge: true }
        );

        setUser(user);
        navigate("/chat/home");
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(
          doc(db, "users", user.uid),
          { status: true, lastSeen: new Date().toISOString() },
          { merge: true }
        );

        setUser(user);
        navigate("/chat/home");
      }
    } catch (error) {
      setError(
        errorMessages[error.code] || "Authentication failed. Please try again."
      );
      console.error("Auth error:", error.message);
    } finally {
      setLoading(false);
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
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className={styles.input}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.eyeButton}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className={styles.switchButton}
      >
        Switch to {isSignUp ? "Log In" : "Sign Up"}
      </button>

      {loading && <div className={styles.loader}></div>}
    </div>
  );
};

export default Auth;
