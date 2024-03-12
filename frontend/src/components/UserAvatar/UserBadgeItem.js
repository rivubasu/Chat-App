import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/layout";
import { RiAdminFill } from "react-icons/ri";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      display="flex"
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      backgroundColor="magenta"
      color="white"
      cursor="pointer"
      onClick={handleFunction}
    >
      {user.name}
      {admin === String(user._id) && (
        <span style={{ marginRight: "2px" }}>
          {" "}
          <RiAdminFill color="blue" size="14px" />
        </span>
      )}
      <CloseIcon pl={1} />
    </Badge>
  );
};

export default UserBadgeItem;
