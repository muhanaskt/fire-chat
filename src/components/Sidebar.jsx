import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.scss';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  // Debug: Log the current user's UID
  console.log('Current user UID:', user ? user.uid : 'No user logged in');

  // Fetch users from Firestore in real-time
  useEffect(() => {
    if (!user) return; // Skip if no user is logged in

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(fetchedUser => fetchedUser.id !== user.uid);  
      setUsers(fetchedUsers);
      console.log('Fetched users (excluding self):', fetchedUsers);  
    }, (error) => {
      console.error('Error fetching users:', error);
    });

    return () => unsubscribe();
  }, [user]); // Depend on user

  const handleUserClick = (userId) => {
    navigate(`/dm/${userId}`);
  };

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>Bro Squad</h2>
      <ul className={styles.broList}>
        {users.length === 0 ? (
          <li className={styles.emptyState}>No bros yet!</li>
        ) : (
          users.map((bro) => (
            <li 
              key={bro.id} 
              className={styles.bro} 
              onClick={() => handleUserClick(bro.id)}
            >
              <div className={`${styles.statusDot} ${styles[bro.status]}`} />
              <span className={styles.broName}>{bro.name}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Sidebar;