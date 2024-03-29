import { Button } from "@chakra-ui/button";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Avatar,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { GoChevronDown } from "react-icons/go";
import { IoIosNotifications } from "react-icons/io";
import { useHistory } from "react-router-dom";
//import { ChatState } from "../../Context/ChatProvider";
import NotificationBadge, { Effect } from "react-notification-badge";
import { ChatState } from "../../Context/ChatProvider.js";
import { getSender } from "../../config/ChatLogics.js";
import ChatLoading from "../ChatLoading.js";
import UserListItem from "../UserAvatar/UserListItem.js";
import ProfileModal from "./ProfileModal.js";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  //const { user } = ChatState();

  const { setSelectedChat, notification, setNotification, chats, setChats } =
    ChatState();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || {}
  );
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    console.log("Stored User:", storedUser); // Check the stored user information
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const logoutHandler = async () => {
    axios.post("/api/auth/logout");
    localStorage.removeItem("userInfo");

    toast({
      title: "Logout Successful.",
      status: "success",
      duration: 1000,
      isClosable: true,
      position: "bottom",
    });

    setSelectedChat(undefined);
    setChats([]);
    history.push("/");
  };

  const toast = useToast();

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    // if (!search) {
    //   toast({
    //     title: "Please Enter something in search",
    //     status: "warning",
    //     duration: 5000,
    //     isClosable: true,
    //     position: "top-left",
    //   });
    //   return;
    // }

    try {
      setLoading(true);

      const { data } = await axios.get(`/api/users?search=${search}`);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip
          label="Search Users to chat"
          hasArrow="true"
          placement="bottom-end"
        >
          <Button
            variant="variant"
            onClick={onOpen}
            bg="rgba(104, 218, 243, 0.42)" // Setting background color with transparency
            backdropFilter="blur(20px)" // Applying backdrop filter with blur
            borderColor="rgba(255,255,255,0.3)" // Setting border color with transparency
            boxShadow="0 1px 12px rgba(0,0,0,0.25)" // Adding box shadow
          >
            <FaSearch />
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          <b>Chatify</b>
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <IoIosNotifications
                style={{ fontSize: "30px", margin: "2px 1px 1px 1px" }}
              />
            </MenuButton>
            <MenuList pl={2}>
              {/* <NotificationItem /> */}
              {!notification.length && "No New Message"}
              {notification.map((notif) => (
                <MenuItem
                  key={notification._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<GoChevronDown />}
              style={{ marginTop: "-15px" }}
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider></MenuDivider>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottom="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => handleSearch(e)}
              />
              {/* <Button>
                <MdOutlineTransitEnterexit fontSize="30px" />
              </Button> */}
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
