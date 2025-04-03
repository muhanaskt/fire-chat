import React, { useState } from "react";
import styles from "./Chat.module.scss";
import { MoreVertical, Send } from "lucide-react";
import useChat from "./useChat";
import { selectedFriendAtom } from "../../store";
import { useAtom } from "jotai";
import { FiTrash } from "react-icons/fi";

const Chat = ({ user }) => {
  const [selectedFriend] = useAtom(selectedFriendAtom);
  const {
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
  } = useChat(user);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    const messageDateStr = messageDate.toDateString();

    if (messageDateStr === todayStr) {
      return "Today";
    } else if (messageDateStr === yesterdayStr) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (id) => {
    setIsMenuOpen((prev) => (prev === id ? null : id));
  };

  const formatLastSeen = (lastSeen) => {
    const now = today.getTime();
    const lastSeenTime = new Date(lastSeen).getTime();
    const diffInMinutes = Math.floor((now - lastSeenTime) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `Last seen ${diffInMinutes} mins ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Last seen ${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return `Last seen ${formatDate(lastSeen)} at ${formatTime(lastSeen)}`;
    }
  };

  const groupedMessages = messages.reduce((acc, message) => {
    const date = formatDate(message.timestamp);
    if (!acc[date]) acc[date] = [];
    acc[date].push(message);
    return acc;
  }, {});

  const friendStatus =
    friendData?.status !== undefined
      ? friendData.status
      : selectedFriend?.status;
  const friendLastSeen =
    friendData?.lastSeen || selectedFriend?.lastSeen || null;

  const statusText =
    friendStatus === true
      ? "Online"
      : friendLastSeen
      ? formatLastSeen(friendLastSeen)
      : "Offline";

  return (
    <div className={styles.chatApp}>
      <header className={styles.chatHeader}>
        <div className={styles.headerContent}>
          <h1>{selectedFriend.name || friendData?.name}</h1>
          <div className={styles.friendStatus}>
            <span>{statusText}</span>
          </div>
        </div>
        <div className={styles.userInfo}>
          <span>{user.email.split("@")[0]}</span>
          <div className={styles.statusDot}></div>
        </div>
      </header>

      <div className={styles.messagesContainer}>
        {loading ? (
          <div className={styles.loadingState}>Loading...</div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            Start a conversation with {selectedFriend.name || friendData?.name}!
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <React.Fragment key={date}>
              <div className={styles.dateSeparator}>
                <span>{date}</span>
              </div>
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.senderId === user.uid
                      ? styles.sent
                      : styles.received
                  }`}
                >
                  <div className={styles.messageContainer}>
                    <div
                      className={styles.messageBubble}
                      onClick={() => toggleMenu(message.id)}
                    >
                      
                      {isMenuOpen === message.id &&  (
                        <div
                          className={styles.messageMenu}
                          onClick={() => deleteMessage(message.id , message.deleted)}
                        >
                          <FiTrash />
                        </div>
                      )}
                      <span className={styles.senderName}>
                        {message.senderName}
                      </span>

                       <p
                        className={`${styles.messageText} ${
                          message.deleted ?  "fst-italic text-secondary opacity-75" : ""
                        }`}
                      >
                        {message.deleted 
                          ? "This message was deleted"
                          : message.text}
                      </p>


                      <div className={styles.messageFooter}>
                        <span className={styles.timestamp}>
                          {formatTime(message.timestamp)}
                        </span>
                        {message.senderId === user.uid && message.received && (
                          <span className={styles.receivedCheck}>✔</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
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
          placeholder={`Message ${selectedFriend.name || friendData?.name}...`}
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
