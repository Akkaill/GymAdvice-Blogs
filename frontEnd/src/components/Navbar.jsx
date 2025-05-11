import { Container, Flex, HStack, Text } from "@chakra-ui/react";

import React from "react";
import { Link } from "react-router-dom";
import { CiHeart, CiSquarePlus, CiSun } from "react-icons/ci";

const Navbar = () => {
  return (
    <Container maxW={"1140"} px={4}>
      <Flex
        h={17}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={{
          base: "column",
          sm: "row",
        }}
      >
        <Text
          fontSize={{ base: "24", sm: "28" }}
          fontWeight={"bold"}
          textTransform={"uppercase"}
          textAlign={"center"}
          bgClip={"text"}
          bgColor={"black"}
        >
          <Link to={"/"}>Gym Advice </Link>
        </Text>
        <HStack alignItems={"center"} wordSpacing={2}>
          <Link to={"/create"}>
            <CiSquarePlus />
          </Link>
          <Link>
            <CiSun />
          </Link>
          <Link to={"/favorite"}>
            <CiHeart />
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
