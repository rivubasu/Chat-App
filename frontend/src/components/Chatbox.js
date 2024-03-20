import { Box } from "@chakra-ui/layout";
// import "./styles.css";
import { ChatState } from "../Context/ChatProvider";
import SingleChat from "./SingleChat";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      //bg="white"
      width={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
      bg="rgba(228, 181, 174, 0.22)" // Setting background color with transparency
      backdropFilter="blur(20px)" // Applying backdrop filter with blur
      borderColor="rgba(255,255,255,0.3)" // Setting border color with transparency
      boxShadow="0 1px 12px rgba(0,0,0,0.25)" // Adding box shadow
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
