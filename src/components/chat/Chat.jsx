import React from "react";
import styles from "./Chat.module.scss";
import { MoreVertical, Send } from "lucide-react";
import useChat from "./useChat";
import { selectedFriendAtom } from "../../store";
import { useAtom } from "jotai";
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
  } = useChat(user);
  
 
  return (
    <div className={styles.chatApp}>
      <header className={styles.chatHeader}>
        <h1>{selectedFriend.name || friendData?.name}</h1>
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
