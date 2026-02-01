import * as chatService from "../services/chat.service.js";
import { success, fail } from "../utils/response.js";

export const getAllChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await chatService.getChats(userId);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

export const createNewChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    const chat = await chatService.createChat(userId, title);
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

export const getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const chat = await chatService.getChatById(id, userId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
  console.error('FETCH CHAT ERROR:', error);
  console.error('STACK:', error.stack);
  res.status(500).json({ 
    message: 'Failed to fetch chat',
    error: error.message
  });
}
};

export const deleteChatController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    await chatService.deleteChat(id, userId);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    
    if (error.message === 'Chat not found or access denied') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};