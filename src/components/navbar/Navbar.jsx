import React, { useState } from "react";
import styles from "./Navbar.module.scss";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const Navbar = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = async () => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userRef, {
        status: false,
        lastSeen: new Date().toISOString(),
      });

      await signOut(auth);

      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

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
        <span>{user.displayName || user.email.split("@")[0]}</span>
      </div>

      <div className={styles.profileMenu}>
        {isMenuOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}

        <FaUserCircle className={styles.profileIcon} onClick={toggleMenu} />
        {isMenuOpen && (
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
