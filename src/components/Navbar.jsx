// src/components/Navbar.js
import React from "react";
import styles from "./Navbar.module.scss";

const Navbar = ({ user, handleLogout }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.profile}>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile"
            className={styles.profilePic}
          />
        ) : (
          <div className={styles.defaultPic}>{user.email[0].toUpperCase()}</div>
        )}
        <span>{user.displayName || user.email}</span>
      </div>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Log Out
      </button>
    </nav>
  );
};

export default Navbar;
