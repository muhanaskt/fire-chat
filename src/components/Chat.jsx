import React, { useState, useEffect, useRef } from "react";
import styles from "./Chat.module.scss";
import { Send } from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { selectedFriendAtom } from "../store";
import { useAtom } from "jotai";

const Chat = ({ user }) => {
  const [selectedFriend] = useAtom(selectedFriendAtom);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
 


  const chatId = [user.uid, selectedFriend.id].sort().join("-");

  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);

    scrollToBottom();
    });

    return () => unsubscribe();
  }, [chatId]);

 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newMessage = {
      text: input,
      timestamp: new Date().toISOString(),
      senderId: user.uid,
      senderName: user.email.split("@")[0],
      recipientId: selectedFriend.id,
    };

    try {
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "40px";
      }
      await addDoc(collection(db, "chats", chatId, "messages"), newMessage);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className={styles.chatApp}>
      <header className={styles.chatHeader}>
        <h1>{selectedFriend.name}</h1>
        <div className={styles.userInfo}>
          <span>{user.email.split("@")[0]}</span>
          <div className={styles.statusDot}></div>
        </div>
      </header>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            Start a conversation with {selectedFriend.name}!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.senderId === user.uid ? styles.sent : styles.received
              }`}
            >
              <div className={styles.messageBubble}>
                <span className={styles.senderName}>{message.senderName}</span>
                <p className={styles.messageText}>{message.text}</p>
                <span className={styles.timestamp}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onKeyDown={handleKeyPress}
          placeholder={`Message ${selectedFriend.name}...`}
          className={styles.messageInput}
          rows="1"
          autoFocus
        />
        <button type="submit" className={styles.sendButton}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
