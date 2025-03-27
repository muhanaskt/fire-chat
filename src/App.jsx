// src/App.js
import React, { useState, useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import Chat from "./components/Chat";
import Layout from "./components/Layout";
 
import { auth } from './firebase';

function App() {
  const [user, setUser] = useState(null);

 
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout user={user} setUser={setUser} />}>
       
        <Route index element={ <div>Select a bro to chat!</div>}  />
        <Route path="dm/:broId" element={<Chat user={user} /> } />
      </Route>
    </Routes>
  );
}

export default App;