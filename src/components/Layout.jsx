// src/components/Layout.js
import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import styles from "./Layout.module.scss";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Auth from "./Auth";

const Layout = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
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
          {/* Fixed Navbar at the Top */}
          <Navbar user={user} handleLogout={handleLogout} />

          {/* Content Wrapper for Sidebar and Main Content */}
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
