import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || {}
  );

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const { selectedChat, setSelectedChat } = ChatState();

  const isAdminLoggedIn = selectedChat.groupAdmin._id === user._id;

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(`/api/users?search=${search}`);
      console.log(data);
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
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) {
      toast({
        title: "Group Name cannot be empty.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      setRenameLoading(true);

      const { data } = await axios.put("/api/chat/rename", {
        chatId: selectedChat._id,
        chatName: groupChatName,
      });

      console.log(data._id);
      // setSelectedChat("");
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleAddUser = async (user1) => {
    const selectedChatUserIds = selectedChat.users.map((user) =>
      String(user._id)
    );
    const userToAddId = String(user1._id);
    if (selectedChatUserIds.includes(userToAddId)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    const GroupAdminId = String(selectedChat.groupAdmin._id);
    const LoggedInUserId = String(user._id);
    if (GroupAdminId !== LoggedInUserId) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.put("/api/chat/groupadd", {
        chatId: selectedChat._id,
        userId: user1._id,
      });

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  // const handleRemove = async (user1) => {
  //   if (
  //     String(selectedChat.groupAdmin._id) !== String(user._id) &&
  //     String(user1._id) !== String(user._id)
  //   ) {
  //     toast({
  //       title: "Only admins can remove someone!",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //       position: "bottom",
  //     });
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const { data } = await axios.put("/api/chat/groupremove", {
  //       chatId: selectedChat._id,
  //       userId: user1._id,
  //     });

  //     user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
  //     setFetchAgain(!fetchAgain);
  //     // fetchMessages();
  //     setLoading(false);
  //   } catch (error) {
  //     toast({
  //       title: "Error Occured!",
  //       description: error.response.data.message,
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //       position: "bottom",
  //     });
  //     setLoading(false);
  //   }
  //   setGroupChatName("");
  // };

  //Made by me

  const handleRemove = async (user1) => {
    try {
      setLoading(true);

      // Check if the user is the group admin or is removing themselves from the group
      const isAdminOrSelf =
        String(selectedChat.groupAdmin._id) === String(user._id) ||
        String(user1._id) === String(user._id);

      // If the user is not the group admin and is not removing themselves, show an error
      if (!isAdminOrSelf) {
        toast({
          title: "Permission Denied!",
          description: "You are not a admin",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
        return;
      }

      // If the user is removing themselves, set selectedChat to null
      if (String(user1._id) === String(user._id)) {
        setSelectedChat();
      }

      const { data } = await axios.put("/api/chat/groupremove", {
        chatId: selectedChat._id,
        userId: user1._id,
      });

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <Box width="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={String(selectedChat.groupAdmin._id)}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Group Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              {isAdminLoggedIn && ( //Only admins can see the option for adding others
                <Input
                  placeholder="Add User to group"
                  mb={1}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              )}
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
