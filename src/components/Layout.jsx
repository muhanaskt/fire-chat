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
  return (
    <div className={styles.layout}>
      {user ? (
        <>
          <Navbar user={user} />
          <div className={styles.contentWrapper}>
            <Sidebar user={user} classes={`color-red`} />
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
