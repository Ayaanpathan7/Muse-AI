import { Modality } from "@google/genai";

export interface User {
  email: string;
  name?: string;
  isRegistered: boolean;
  preferences: {
    agentId: string;
  };
}

export enum Section {
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  ANALYZE = 'ANALYZE',
  CONTENT = 'CONTENT',
  INTERVIEW = 'INTERVIEW'
}

export enum VoiceModeCategory {
  MOTIVATION = 'Motivation',
  ADULT = 'Adult (Mature Advice)',
  MEDITATION = 'Meditation',
  THERAPY = 'Therapy',
  STORYTELLER = 'Storyteller',
  ASSISTANT = 'Assistant',
  ROMANTIC = 'Romantic Motivation'
}

export interface AgentPersona {
  id: string;
  name: string;
  voiceName: string; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
  gender: 'male' | 'female';
  style: string; // 'Strong', 'Bold', 'Soft', 'Deep'
  gradient: string; // CSS gradient class for avatar
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string;
}

export interface DocumentAnalysis {
  summary: string;
  explanation: string;
}

export type HandwritingStyle = 'hand1' | 'hand2' | 'hand3' | 'hand4';

export interface ContentGenerationConfig {
    aspectRatio: string;
    style?: string;
}

// Live API Types
export interface LiveConfig {
  voiceName: string;
  systemInstruction: string;
}

// Global Window Augmentation
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
    webkitAudioContext?: typeof AudioContext;
  }
}