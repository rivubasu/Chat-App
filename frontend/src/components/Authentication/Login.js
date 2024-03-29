import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { BiSolidHide } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa";
import { useHistory } from "react-router-dom";

const Login = () => {
  const toast = useToast();
  const history = useHistory();
  const Email = useRef();
  const Password = useRef();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [GuestEmail, setGuestEmail] = useState();
  const [GuestPassword, setGuestPassword] = useState();

  const [shouldRefresh, setShouldRefresh] = useState(false);
  useEffect(() => {
    if (shouldRefresh) {
      // Refresh the page
      window.location.reload();
      // Set the state to prevent further refreshes
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);
    if (!Email.current.value || !Password.current.value) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const email = Email.current.value;
      const password = Password.current.value;

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/auth/login",
        { email, password },
        config
      );
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast({
        title: "Login Successful.",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "bottom",
      });

      setTimeout(() => {
        setLoading(false);

        history.push("/chats");
        setShouldRefresh(true);
      }, 1000);
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
  };

  return (
    <VStack spacing="5px" color="black">
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input placeholder="Enter your Email" ref={Email} value={GuestEmail} />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            ref={Password}
            value={GuestPassword}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? <BiSolidHide /> : <FaRegEye />}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
        //bg="rgba(242, 92, 250, 0.8)" // Setting background color with transparency
        backdropFilter="blur(20px)" // Applying backdrop filter with blur
        borderColor="rgba(255,255,255,0.3)" // Setting border color with transparency
        boxShadow="0 1px 12px rgba(0,0,0,0.25)" // Adding box shadow
      >
        Login
      </Button>
      <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        onClick={() => {
          setGuestEmail("guest@example.com");
          setGuestPassword("123456");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
