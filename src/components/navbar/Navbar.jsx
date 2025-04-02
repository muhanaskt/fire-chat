import React, { useState } from "react";
import styles from "./Navbar.module.scss";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({ user, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.profile}>
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className={styles.profilePic} />
        ) : (
          <div className={styles.defaultPic}>{user.email[0].toUpperCase()}</div>
        )}
        <span>{user.displayName || user.email}</span>
      </div>

      <div className={styles.profileMenu}>
      {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)}></div>}

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
