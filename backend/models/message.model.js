import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    //createAt, updateAt => message.createdAt: 15:30
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
