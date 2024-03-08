import { Stack } from "@chakra-ui/react";
import { Skeleton } from "@chakra-ui/skeleton";
import React from "react";

const ChatLoading = () => {
  return (
    <Stack>
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
      <Skeleton startColor="pink.500" endColor="blue.500" height="45px" />
    </Stack>
  );
};

export default ChatLoading;
