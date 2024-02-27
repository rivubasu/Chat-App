import axios from "axios";
import React, { useEffect, useState } from "react";

const Chatpage = () => {
  const [chats, setChats] = useState([]);

  const fetchChats = async () => {
    const { data } = await axios.get("/api/chat");
    console.log(data);
    setChats(data);
  };
  useEffect(() => {
    console.log("fetching chats...");
    fetchChats();
  }, []);

  return (
    <div>
      {chats.map((chat) => (
        <div key={chat._id}>{chat.chatName}</div>
      ))}
    </div>
  );
};

export default Chatpage;
