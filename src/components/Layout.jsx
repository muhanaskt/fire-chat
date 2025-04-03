// src/components/Layout.js
import React from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import styles from "./Layout.module.scss";
import { Outlet, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import Auth from "./auth";
import { doc, updateDoc } from "firebase/firestore";
 

const Layout = ({ user, setUser }) => {
  if (!user?.uid) return;
  const navigate = useNavigate();

  const handleLogout = async () => {
    
    const userRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userRef, { status: false, lastSeen: new Date().toISOString() });

      await signOut(auth);
      setUser(null);
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div className={styles.layout}>
      {user ? (
        <>
          
          <Navbar user={user} handleLogout={handleLogout} />
          <div className={styles.contentWrapper}>
            <Sidebar user={user} />
            <main className={styles.mainContent}>
              <Outlet />
            </main>
          </div>
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
