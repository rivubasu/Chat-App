import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";

// /api/users?search=rivu
export const getUsersForSidebar = asyncHandler(async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({
        _id: { $ne: loggedInUserId },
      })
      .select("-password"); // exclude the current user from the list of users to show

    res.send(users);
  } catch (error) {
    console.log("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
