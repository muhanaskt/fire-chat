// src/components/Auth.js
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import styles from './Auth.module.scss';

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Add user to Firestore on signup
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: email.split('@')[0], // Default name from email
          status: 'chillin', // Default status
          email: email
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      setUser(userCredential.user);
      setEmail('');
      setPassword('');
    } catch (error) {
      setError(error.message);
      console.error('Auth error:', error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
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
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className={styles.switchButton}
      >
        Switch to {isSignUp ? 'Log In' : 'Sign Up'}
      </button>
    </div>
  );
};

export default Auth;