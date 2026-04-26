const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');

// GET /api/conversations
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'name email role')
    .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) { next(err); }
};

// GET /api/conversations/:id
exports.getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    }).populate('participants', 'name email role');
    
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json(conversation);
  } catch (err) { next(err); }
};

// POST /api/conversations
exports.createConversation = async (req, res, next) => {
  try {
    const { participants, title, type } = req.body;
    
    // Ensure the current user is a participant
    const allParticipants = [...new Set([...participants, req.user._id.toString()])];
    
    // Check if a direct conversation already exists between these two users
    if (type === 'direct' && allParticipants.length === 2) {
      const existing = await Conversation.findOne({
        type: 'direct',
        participants: { $all: allParticipants, $size: 2 }
      });
      if (existing) return res.json(existing);
    }

    const conversation = await Conversation.create({
      participants: allParticipants,
      title: title || 'New Conversation',
      type: type || (allParticipants.length > 2 ? 'group' : 'direct'),
      admins: [req.user._id]
    });

    res.status(201).json(conversation);
  } catch (err) { next(err); }
};

// POST /api/conversations/:id/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    });

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const message = {
      sender: req.user._id,
      content,
      sentAt: new Date(),
      readBy: [req.user._id]
    };

    conversation.messages.push(message);
    conversation.lastMessage = {
      content,
      sender: req.user._id,
      sentAt: message.sentAt
    };
    
    await conversation.save();
    res.status(201).json(message);
  } catch (err) { next(err); }
};

// PATCH /api/conversations/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    });

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    conversation.messages.forEach(msg => {
      if (!msg.readBy.includes(req.user._id)) {
        msg.readBy.push(req.user._id);
      }
    });

    await conversation.save();
    res.json({ message: 'Messages marked as read' });
  } catch (err) { next(err); }
};
