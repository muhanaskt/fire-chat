import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styles from "./Chat.module.scss";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';

const Chat = ({ user }) => {
    const { broId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [selectedBro, setSelectedBro] = useState(null);
    const messagesEndRef = useRef(null);

    const chatId = `${user.uid}-${broId}`; // e.g., "uid1-uid2"


    useEffect(() => {
        if (!broId || !user) return;

        const fetchSelectedBro = async () => {
            const userDocRef = doc(db, 'users', broId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setSelectedBro({ id: userDoc.id, ...userDoc.data() });
            }
        };
        fetchSelectedBro();
    }, [broId, user]);

    useEffect(() => {
        if (!broId || !selectedBro || !user) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(fetchedMessages);
            scrollToBottom();
        }, (error) => {
            console.error('Firestore error:', error);
        });

        return () => unsubscribe();
    }, [broId, user, selectedBro]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === '' || !selectedBro || !user) return;

        const newMessage = {
            text: input,
            timestamp: new Date().toISOString(),
            senderId: user.uid,
            senderName: user.email.split('@')[0],
            recipientId: broId, 
        };
        console.log(newMessage);
        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), newMessage);
            await addDoc(collection(db, 'chats', `${broId}-${user.uid}`, 'messages'), newMessage);  

            setInput('');
        } catch (error) {
            console.error('Error sending message:', error.message);
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
                <h1>{selectedBro ? selectedBro.name : "No Bro Selected"}</h1>
                <div className={styles.userInfo}>
                    <span>{user.email.split('@')[0]}</span>
                    <div className={styles.statusDot}></div>
                </div>
            </header>

            <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <div className={styles.emptyState}>
                        {selectedBro ? `Start a conversation with ${selectedBro.name}!` : "Select a bro to chat!"}
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${styles.message} ${message.senderId === user.uid ? styles.sent : styles.received}`}
                        >
                            <div className={styles.messageBubble}>
                                <span className={styles.senderName}>{message.senderName}</span>
                                <p className={styles.messageText}>{message.text}</p>
                                <span className={styles.timestamp}>
                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {selectedBro && (
                <form onSubmit={handleSendMessage} className={styles.inputContainer}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={`Message ${selectedBro.name}...`}
                        className={styles.messageInput}
                        rows="1"
                        autoFocus
                    />
                    <button type="submit" className={styles.sendButton}>
                        Send
                    </button>
                </form>
            )}
        </div>
    );
};

export default Chat;