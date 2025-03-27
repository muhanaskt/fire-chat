// src/components/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.scss';
import { Outlet } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Auth from './Auth';

const Layout = ({ user, setUser }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <div className={styles.layout}>
      {user ? (
        // When logged in: Show sidebar, main content, and user info
        <>
          <Sidebar user={user} />
          <main className={styles.mainContent}>
            <Outlet />
            <div className={styles.userInfo}>
              <span>Logged in as: {user.email}</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Log Out
              </button>
            </div>
          </main>
        </>
      ) : (
         
        <main className={styles.mainContent}>
           <Auth setUser={setUser} />
        </main>
      )}
    </div>
  );
};

export default Layout;