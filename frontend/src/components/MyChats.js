import { AddIcon } from "@chakra-ui/icons";
import { Avatar, Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || {}
  );

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const [loggedUser, setLoggedUser] = useState();
  const [loadingChat, setLoadingChat] = useState(false);
  const { selectedChat, setSelectedChat, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      setLoadingChat(true);
      const { data } = await axios.get("/api/chat");
      setChats(data);
      setLoadingChat(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      width={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      bg="rgba(228, 181, 174, 0.22)"
      backdropFilter="blur(20px)" // Applying backdrop filter with blur
      borderColor="rgba(255,255,255,0.3)" // Setting border color with transparency
      boxShadow="0 1px 12px rgba(0,0,0,0.25)" // Adding box shadow
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <b style={{ color: "white" }}>My Chats</b>
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            bg="rgba(0, 248, 182, 0.7)" // Setting background color with transparency
            backdropFilter="blur(20px)" // Applying backdrop filter with blur
            borderColor="rgba(255,255,255,0.3)" // Setting border color with transparency
            boxShadow="0 1px 12px rgba(0,0,0,0.25)" // Adding box shadow
          >
            Create Group
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        //bg="#F8F8F8"
        width="100%"
        height="100%"
        borderRadius="lg"
        overflowY="hidden"
        bg="rgba(0, 0, 0, 0)"
        //bg="rgba(255, 0, 0, 0.03)"
        //bg="rgba(255,255,255,0.5)" // Setting background color with transparency
        backdropFilter="transparent(20px)" // Applying backdrop filter with blur
        borderColor="rgba(255,255,255,0.3)" // Setting border color with transparency
        boxShadow="0 1px 12px rgba(0,0,0,0.25)" // Adding box shadow
      >
        {loadingChat ? (
          <ChatLoading />
        ) : (
          <Stack overflowY="scroll">
            {chats?.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat && (
                    <Avatar
                      marginRight={2}
                      size="sm"
                      cursor="pointer"
                      name={getSenderFull(loggedUser, chat.users).name}
                      src={getSenderFull(loggedUser, chat.users).pic}
                    />
                  )}
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
