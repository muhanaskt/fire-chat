// src/App.js
import React, { useState, useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import Chat from "./components/Chat";
import Layout from "./components/Layout";

import { auth } from './firebase';
import Auth from './components/Auth';

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

                <Route index element={<div>Select a bro to chat!</div>} />
                <Route path="chat/home" element={<div>Welcome to the chat interface!</div>} />  
                <Route path="dm/:broId" element={<Chat user={user} />} />
            </Route>
            <Route path="/auth" element={<Auth setUser={setUser} />} />
        </Routes>
    );
}

export default App;