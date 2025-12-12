import { AgentPersona, VoiceModeCategory } from './types';

export const AGENTS: AgentPersona[] = [
  { 
      id: '1', 
      name: 'Nova', 
      voiceName: 'Kore', 
      gender: 'female', 
      style: 'Professional & Direct', 
      gradient: 'from-emerald-500 to-teal-700',
      description: 'A highly organized and articulate executive assistant. Perfect for professional tasks and structured planning.'
  },
  { 
      id: '2', 
      name: 'Sage', 
      voiceName: 'Zephyr', 
      gender: 'male', 
      style: 'Calm & Mindful', 
      gradient: 'from-blue-400 to-cyan-300',
      description: 'A calm, balanced presence. Ideal for meditation, therapy, and thoughtful conversation.'
  },
  { 
      id: '3', 
      name: 'Orion', 
      voiceName: 'Fenrir', 
      gender: 'male', 
      style: 'Deep & Analytical', 
      gradient: 'from-indigo-500 to-purple-800',
      description: 'Deep-voiced and authoritative. Great for technical analysis, storytelling, and complex problem solving.'
  },
  { 
      id: '4', 
      name: 'Lyra', 
      voiceName: 'Puck', 
      gender: 'female', 
      style: 'Creative & Playful', 
      gradient: 'from-pink-500 to-rose-400',
      description: 'Energetic and imaginative. The best choice for brainstorming, content creation, and casual chat.'
  },
  { 
      id: '5', 
      name: 'Echo', 
      voiceName: 'Charon', 
      gender: 'male', 
      style: 'Objective & Steady', 
      gradient: 'from-slate-500 to-gray-700',
      description: 'A steady, neutral voice of reason. Excellent for news, summaries, and unbiased advice.'
  }
];

export const VOICE_CATEGORIES = [
  { id: VoiceModeCategory.MOTIVATION, label: 'Motivation', icon: 'Zap', color: 'text-yellow-400' },
  { id: VoiceModeCategory.MEDITATION, label: 'Meditation', icon: 'Leaf', color: 'text-green-400' },
  { id: VoiceModeCategory.THERAPY, label: 'Therapy', icon: 'HeartHandshake', color: 'text-blue-400' },
  { id: VoiceModeCategory.STORYTELLER, label: 'Storyteller', icon: 'BookOpen', color: 'text-purple-400' },
  { id: VoiceModeCategory.ASSISTANT, label: 'Assistant', icon: 'Bot', color: 'text-gray-400' },
  { id: VoiceModeCategory.ROMANTIC, label: 'Romantic', icon: 'Heart', color: 'text-pink-400' },
  { id: VoiceModeCategory.ADULT, label: 'Adult Advice', icon: 'ShieldAlert', color: 'text-red-400' },
];

export const SYSTEM_PROMPTS = {
  DEFAULT: "You are Muse AI, a helpful, intelligent assistant.",
  INTERVIEW: "You are a professional, strict but fair job interviewer. You are conducting a mock interview. Start by asking what role the user is applying for. Ask one question at a time. Listen to the answer, provide brief feedback, and then ask the next question.",
  LANGUAGE_TUTOR: "You are a friendly language tutor. Your goal is to help the user improve their language skills through conversation. Correct their grammar gently and suggest better vocabulary. Keep the conversation engaging.",
  VOICE_BASE: "You are a voice assistant in a specific mode. Keep responses concise and conversational.",
  HANDWRITING: "Analyze the provided text or document and re-write the content as if it were a student assignment. Keep the tone human.",
  VISUAL_GAME: "You are a visual language teacher. The user has generated an image. Ask them to describe it, or ask specific questions about objects in the image to test their vocabulary.",
};

export const CONTENT_STYLES = [
    { id: 'none', label: 'No Style' },
    { id: 'photorealistic', label: 'Photorealistic' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'anime', label: 'Anime' },
    { id: 'digital-art', label: 'Digital Art' },
    { id: 'oil-painting', label: 'Oil Painting' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'sketch', label: 'Pencil Sketch' },
    { id: '3d-render', label: '3D Render' },
];

export const ASPECT_RATIOS = [
    { id: '1:1', label: 'Square (1:1)' },
    { id: '16:9', label: 'Widescreen (16:9)' },
    { id: '9:16', label: 'Portrait (9:16)' },
    { id: '4:3', label: 'Standard (4:3)' },
    { id: '3:4', label: 'Vertical (3:4)' },
];