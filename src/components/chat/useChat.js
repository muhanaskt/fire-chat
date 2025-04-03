import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useAtom } from "jotai";
import { selectedFriendAtom } from "../../store";
import { useParams } from "react-router-dom";

const useChat = (user) => {
  const [selectedFriend] = useAtom(selectedFriendAtom);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [friendData, setFriendData] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const { broId } = useParams();
  const chatId = [user.uid, selectedFriend.id || broId].sort().join("-");

  useEffect(() => {
    const fetchFriendData = async () => {
      const friendDocRef = doc(db, "users", selectedFriend.id || broId);
      const friendDoc = await getDoc(friendDocRef);
      if (friendDoc.exists()) {
        setFriendData(friendDoc.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchFriendData();
  }, [selectedFriend.id, broId]);

  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
      setLoading(false);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [chatId]);

  const deleteMessage = async (messageId, isDeleted) => {
    try {
      if (!isDeleted) {
         setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? { ...msg, text: "This message was deleted", deleted: true }
              : msg
          )
        );
  
        await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
          text: "This message was deleted",
          deleted: true,
        });
      } else {
         await deleteDoc(doc(db, "chats", chatId, "messages", messageId));
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  



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

  return {
    messages,
    input,
    setInput,
    friendData,
    messagesEndRef,
    textareaRef,
    handleSendMessage,
    handleKeyPress,
    loading,
    deleteMessage,
  };
};

export default useChat;
