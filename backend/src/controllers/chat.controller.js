const Message = require('../models/Message');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            throw new ApiError(400, "Receiver ID and message content are required");
        }

        const message = await Message.create({
            senderId,
            receiverId,
            content
        });

        res.status(201).json(new ApiResponse(210, { message }, "Message sent successfully"));
    } catch (error) {
        next(error);
    }
};

exports.getChatHistory = async (req, res, next) => {
    try {
        const myId = req.user.id;
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }

        // Fetch messages between current user and specified user
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userId },
                { senderId: userId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        // Mark incoming messages as read
        await Message.updateMany(
            { senderId: userId, receiverId: myId, isRead: false },
            { isRead: true }
        );

        res.status(200).json(new ApiResponse(200, { messages }, "Chat history retrieved"));
    } catch (error) {
        next(error);
    }
};
