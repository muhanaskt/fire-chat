// src/components/Layout.js
import React from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import styles from "./Layout.module.scss";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Auth from "./auth";

const Layout = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate("/auth");
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div className={styles.layout}>
      {user ? (
        <>
          {/* Fixed Navbar at the Top */}

          {/* Content Wrapper for Sidebar and Main Content */}
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
