import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { selectedFriendAtom } from "../../store";
import { useSetAtom } from "jotai";

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const setSelectedFriend = useSetAtom(selectedFriendAtom);

  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users from Firestore in real-time
  useEffect(() => {
    if (!user) return;

    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const fetchedUsers = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((fetchedUser) => fetchedUser.id !== user.uid);
        setFriends(fetchedUsers);
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle friend selection
  const handleUserClick = (bro) => {
    setSelectedFriend(bro);
    navigate(`/dm/${bro.id}`);
  };

  // Filter friends based on search input
  const filteredFriends = friends.filter((bro) =>
    bro.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.sidebar}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Friend List */}
      <ul className={styles.broList}>
        {filteredFriends.length === 0 ? (
          <li className={styles.emptyState}>No found!</li>
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
                    {bro.name[0].toUpperCase()}
                  </div>
                )}
              </div>
              <span className={styles.broName}>{bro.name}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
