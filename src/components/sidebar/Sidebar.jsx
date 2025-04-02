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

  // Fetch users from Firestore in real-time
  useEffect(() => {
    if (!user) return; // Skip if no user is logged in

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

  const handleUserClick = (bro) => {
    setSelectedFriend(bro);
    navigate(`/dm/${bro.id}`);
  };

  return (
    <div className={styles.sidebar}>
      <ul className={styles.broList}>
        {friends.length === 0 ? (
          <li className={styles.emptyState}>No bros yet!</li>
        ) : (
          friends.map((bro) => (
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
              <div className={`${styles.statusDot} ${styles[bro.status]}`} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
