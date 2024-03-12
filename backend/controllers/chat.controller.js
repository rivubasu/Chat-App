import Chat from "../models/chat.model.js";
//import Message from "../models/message.model.js";
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";

export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    // $and: [
    //   { users: { $elemMatch: { $eq: req.user._id } } },
    //   { users: { $elemMatch: { $eq: userId } } },
    // ],
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      console.log("Error in Access Chat in Chat Controller", error.message);
      res.status(400);
      throw new Error(error.message);
    }
  }
});

export const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) //SORT CHATS FROM NEW TO OLD
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
export const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true, //return the updated document rather than the original one
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
// export const removeFromGroup = asyncHandler(async (req, res) => {
//   const { chatId, userId } = req.body;

//   // check if the requester is admin
//   const loggedInUser = req.user._id;
//   const groupUserHaveToBeAdded = await Chat.findOne({ _id: { $eq: chatId } });
//   if (!groupUserHaveToBeAdded) {
//     res.status(404);
//     throw new Error("This chat does not exist");
//   }
//   const admin = groupUserHaveToBeAdded.groupAdmin;
//   if (admin.toString() !== loggedInUser.toString()) {
//     res.status(401);
//     throw new Error("You are not the Group Admin");
//   }

//   //NOW REMOVE THE MEMBER FROM GROUP
//   const removed = await Chat.findByIdAndUpdate(
//     chatId,
//     {
//       $pull: { users: userId },
//     },
//     {
//       new: true,
//     }
//   )
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   if (!removed) {
//     res.status(404);
//     throw new Error("Chat Not Found");
//   } else {
//     res.json(removed);
//   }
// });

//MADE BY ME
export const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // Check if the chat exists
  const groupChat = await Chat.findById(chatId);
  if (!groupChat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  // Check if the user to be removed is a member of the chat
  const userToRemoveId = userId.toString();
  // if (!groupChat.users.includes(userToRemoveId)) {
  //   res.status(400);
  //   throw new Error("User is not a member of this chat");
  // }

  // If the user is removing themselves, or if the requester is the admin of the group, allow removal
  if (
    userToRemoveId === req.user._id.toString() ||
    groupChat.groupAdmin.toString() === req.user._id.toString()
  ) {
    // Remove the user from the group
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userToRemoveId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.json(updatedChat);
  }

  res.status(401);
  throw new Error("You are not not the admin");
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
export const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const loggedInUser = req.user._id;
  const groupUserHaveToBeAdded = await Chat.findOne({ _id: { $eq: chatId } });
  if (!groupUserHaveToBeAdded) {
    res.status(404);
    throw new Error("This chat does not exist");
  }
  const admin = groupUserHaveToBeAdded.groupAdmin;
  if (admin.toString() !== loggedInUser.toString()) {
    res.status(401);
    throw new Error("You are not the Group Admin");
  }

  //Now Add to the group
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

// export const sendMessage = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const { id: receiverId } = req.params;
//     const senderId = req.user._id;

//     let conversation = await Conversation.findOne({
//       participants: { $all: [senderId, receiverId] },
//     });

//     if (!conversation) {
//       conversation = await Conversation.create({
//         participants: [senderId, receiverId],
//       });
//     }

//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       message,
//     });

//     if (newMessage) {
//       conversation.messages.push(newMessage._id);
//     }
//     //SOCKET.IO FUNCTIONALITY WILL GO HERE

//     // await conversation.save();  if it takes 1 sec
//     // await newMessage.save();   it needs to wait 1 second

//     //this will run in parallel
//     await Promise.all([conversation.save(), newMessage.save()]);
//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.log("Error in sendMessage Controller", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// export const getMessages = async (req, res) => {
//   try {
//     const { id: userToChatId } = req.params;
//     const senderId = req.user._id;

//     const conversation = await Conversation.findOne({
//       participants: { $all: [senderId, userToChatId] },
//     }).populate("messages"); //NOT MESSAGE BUT ACTUAL MESSAGE

//     if (!conversation) {
//       return res.status(200).json([]);
//     }

//     const messages = conversation.messages;

//     res.status(200).json(messages);
//   } catch (error) {
//     console.log("Error in getMessage Controller", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
