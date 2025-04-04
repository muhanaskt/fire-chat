import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import styles from "./Sidebar.module.scss";
import { db, auth } from "../../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { selectedFriendAtom } from "../../store";
import { useSetAtom } from "jotai";

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const setSelectedFriend = useSetAtom(selectedFriendAtom);

  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const sidebarRef = useRef();

  useEffect(() => {
    if (!user) return;

    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((fetchedUser) => fetchedUser.id !== user.uid);
      setFriends(fetchedUsers);
    });

    return () => unsubscribe();
  }, [user]);

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

  const handleUserClick = (bro) => {
    setSelectedFriend(bro);
    navigate(`/dm/${bro.id}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(`.${styles.hamburger}`)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredFriends = friends.filter((bro) =>
    bro.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <div
        ref={sidebarRef}
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
      >
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <ul className={styles.broList}>
          {filteredFriends.length === 0 ? (
            <li className={styles.emptyState}>No users found</li>
          ) : (
            filteredFriends.map((bro) => (
              <li
                key={bro.id}
                className={styles.bro}
                onClick={() => handleUserClick(bro)}
              >
                <div className={styles.profileContainer}>
                  {bro.photoURL ? (
                    <img
                      src={bro.photoURL}
                      alt="Profile"
                      className={styles.profilePic}
                    />
                  ) : (
                    <div className={styles.defaultPic}>
                      {bro.name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className={styles.broName}>{bro.name}</span>
              </li>
            ))
          )}
        </ul>

        <div className={styles.profileMenu}>
          <FaCog
            className={styles.settingsIcon}
            onClick={() => setShowLogoutModal(true)}
            title="Settings / Logout"
          />
          {showLogoutModal && (
            <div
              className={styles.modalOverlay}
              onClick={() => setShowLogoutModal(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                
                 
                   
                  <button
                    className={`${styles.modalButton} ${styles.confirmButton}`}
                    onClick={() => {
                      handleLogout();
                      setShowLogoutModal(false);
                    }}
                  >
                    Logout
                  </button>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
