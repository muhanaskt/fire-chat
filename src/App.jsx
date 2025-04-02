// src/App.js
import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Chat from "./components/chat";
import Layout from "./components/Layout";

import { auth } from "./firebase";
import Auth from "./components/auth";
import { Container } from "react-bootstrap";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
        <p className="mt-3  fs-5 fw-bold">Checking authentication...</p>
      </Container>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Layout user={user} setUser={setUser} />}>
        <Route index element={<div>Select a bro to chat!</div>} />
        <Route
          path="chat/home"
          element={<div>Welcome to the chat interface!</div>}
        />
        <Route path="dm/:broId" element={<Chat user={user} />} />
      </Route>

      <Route path="/auth" element={<Auth setUser={setUser} />} />
    </Routes>
  );
}

export default App;
