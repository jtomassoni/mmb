// src/lib/ai-prompts.ts
import { BusinessType, Question, QuestionSet } from './ai-intake'

export interface AIPrompt {
  id: string
  businessType: BusinessType
  questionId: string
  prompt: string
  followUpPrompt?: string
  validationPrompt?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  questionId?: string
}

export interface ChatSession {
  id: string
  businessType: BusinessType
  messages: ChatMessage[]
  currentQuestionId?: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

// System prompts for different business types
export const SYSTEM_PROMPTS: Record<BusinessType, string> = {
  dive_bar: `You are a helpful assistant helping to set up a dive bar's website. Dive bars are casual, local watering holes known for:
- Affordable drinks and simple food
- Pool tables, dart boards, and bar games
- Local regulars and friendly atmosphere
- Often have jukeboxes or simple entertainment
- May have happy hour specials

Ask questions in a casual, friendly tone. Keep responses conversational and encouraging.`,
  
  cafe: `You are a helpful assistant helping to set up a café's website. Cafés are cozy coffee shops known for:
- Fresh coffee, espresso drinks, and tea
- Light meals, pastries, and baked goods
- Comfortable seating for work or relaxation
- Often have WiFi and outdoor seating
- Friendly, welcoming atmosphere

Ask questions in a warm, inviting tone. Keep responses conversational and encouraging.`,
  
  fine_dining: `You are a helpful assistant helping to set up a fine dining restaurant's website. Fine dining restaurants are upscale establishments known for:
- High-quality cuisine and presentation
- Wine lists and sommelier service
- Reservations and dress codes
- Private dining and special events
- Professional, elegant service

Ask questions in a professional, refined tone. Keep responses sophisticated and encouraging.`,
  
  sports_bar: `You are a helpful assistant helping to set up a sports bar's website. Sports bars are entertainment venues known for:
- Multiple TVs showing sports games
- Game day specials and promotions
- Bar games like pool and darts
- Casual food and drinks
- Energetic, sports-focused atmosphere

Ask questions in an enthusiastic, sports-focused tone. Keep responses energetic and encouraging.`,
  
  family_restaurant: `You are a helpful assistant helping to set up a family restaurant's website. Family restaurants are casual dining establishments known for:
- Family-friendly atmosphere and menu
- Comfortable seating for all ages
- Reasonable prices and generous portions
- Often have kids' menus and high chairs
- Welcoming, inclusive environment

Ask questions in a warm, family-friendly tone. Keep responses welcoming and encouraging.`,
  
  brewery: `You are a helpful assistant helping to set up a brewery's website. Breweries are craft beer establishments known for:
- House-brewed beers and seasonal offerings
- Tasting rooms and brewery tours
- Often serve food to complement beers
- Local, artisanal atmosphere
- Beer education and community events

Ask questions in a knowledgeable, craft-focused tone. Keep responses informative and encouraging.`,
  
  pizzeria: `You are a helpful assistant helping to set up a pizzeria's website. Pizzerias are casual restaurants known for:
- Fresh, handmade pizzas
- Often have delivery and takeout
- Casual, family-friendly atmosphere
- May have other Italian dishes
- Quick, convenient service

Ask questions in a casual, Italian-inspired tone. Keep responses friendly and encouraging.`,
  
  food_truck: `You are a helpful assistant helping to set up a food truck's website. Food trucks are mobile food service businesses known for:
- Unique, often gourmet street food
- Flexible locations and schedules
- Social media presence for location updates
- Often have signature dishes
- Quick, convenient service

Ask questions in a casual, mobile-friendly tone. Keep responses dynamic and encouraging.`
}

// Welcome messages for different business types
export const WELCOME_MESSAGES: Record<BusinessType, string> = {
  dive_bar: "Hey there! I'm here to help you set up your dive bar's website. Let's make sure we capture everything that makes your bar special - from your pool tables to your signature drinks. What's the name of your bar?",
  
  cafe: "Welcome! I'm excited to help you create a website for your café. Let's showcase what makes your coffee shop unique - from your signature drinks to your cozy atmosphere. What's the name of your café?",
  
  fine_dining: "Good day! I'm here to help you establish a sophisticated online presence for your fine dining restaurant. Let's highlight what makes your establishment exceptional - from your wine selection to your chef's specialties. What's the name of your restaurant?",
  
  sports_bar: "Welcome! I'm here to help you set up your sports bar's website. Let's make sure we capture all the excitement - from your game day specials to your TV setup. What's the name of your sports bar?",
  
  family_restaurant: "Hello! I'm here to help you create a welcoming website for your family restaurant. Let's showcase what makes your place special for families - from your kids' menu to your friendly atmosphere. What's the name of your restaurant?",
  
  brewery: "Cheers! I'm here to help you set up your brewery's website. Let's highlight what makes your craft beer special - from your signature brews to your tasting room. What's the name of your brewery?",
  
  pizzeria: "Ciao! I'm here to help you create a website for your pizzeria. Let's showcase what makes your pizza special - from your signature pies to your family recipes. What's the name of your pizzeria?",
  
  food_truck: "Welcome! I'm here to help you set up your food truck's website. Let's highlight what makes your mobile kitchen special - from your signature dishes to your unique locations. What's the name of your food truck?"
}

// Follow-up prompts for incomplete answers
export const FOLLOW_UP_PROMPTS: Record<string, string> = {
  name: "That's a great name! Can you tell me more about what makes your place special?",
  description: "Perfect! Now let's get your contact information so customers can find you.",
  address: "Great! What's your phone number so customers can call you?",
  phone: "Excellent! What's your email address for customer inquiries?",
  email: "Perfect! Now let's talk about what makes your place unique. Do you have any special features or amenities?",
  pool_tables: "Awesome! How many pool tables do you have?",
  tvs: "Great! How many TVs do you have for watching sports?",
  wifi: "Perfect! What's your WiFi password for customers?",
  reservations: "Excellent! What phone number should customers call for reservations?",
  happy_hour: "Nice! What are your happy hour times?",
  live_music: "Cool! What kind of live music or entertainment do you have?",
  outdoor_seating: "Great! Do you have a patio or outdoor area?",
  dress_code: "Good to know! What are the details of your dress code?",
  signature_drink: "Perfect! What's your signature drink or cocktail?",
  signature_dish: "Excellent! What's your signature dish?",
  game_specials: "Awesome! What are your game day specials?",
  favorite_teams: "Great! Which local teams do you show games for?"
}

// Validation prompts for data quality
export const VALIDATION_PROMPTS: Record<string, string> = {
  email: "I need a valid email address. Please provide an email in the format: name@domain.com",
  phone: "I need a valid phone number. Please provide it in the format: (303) 555-0123",
  address: "I need a complete address. Please include street, city, state, and zip code.",
  name: "I need a name for your business. Please provide the full name.",
  description: "I need a description of your business. Please tell me what makes your place special."
}

// Completion messages
export const COMPLETION_MESSAGES: Record<BusinessType, string> = {
  dive_bar: "Perfect! I've got all the details about your dive bar. Let me create a preview of your website so you can see how it'll look to your customers.",
  
  cafe: "Excellent! I've captured everything about your café. Let me create a preview of your website so you can see how it'll look to your customers.",
  
  fine_dining: "Outstanding! I've gathered all the information about your fine dining restaurant. Let me create a preview of your website so you can see how it'll look to your customers.",
  
  sports_bar: "Fantastic! I've got all the details about your sports bar. Let me create a preview of your website so you can see how it'll look to your customers.",
  
  family_restaurant: "Wonderful! I've captured everything about your family restaurant. Let me create a preview of your website so you can see how it'll look to your customers.",
  
  brewery: "Excellent! I've got all the details about your brewery. Let me create a preview of your website so you can see how it'll look to your customers.",
  
  pizzeria: "Perfect! I've captured everything about your pizzeria. Let me create a preview of your website so you can see how it'll look to your customers.",
  
  food_truck: "Great! I've got all the details about your food truck. Let me create a preview of your website so you can see how it'll look to your customers."
}

// Helper functions
export function getSystemPrompt(businessType: BusinessType): string {
  return SYSTEM_PROMPTS[businessType]
}

export function getWelcomeMessage(businessType: BusinessType): string {
  return WELCOME_MESSAGES[businessType]
}

export function getFollowUpPrompt(questionId: string): string {
  return FOLLOW_UP_PROMPTS[questionId] || "Tell me more about that."
}

export function getValidationPrompt(questionId: string): string {
  return VALIDATION_PROMPTS[questionId] || "I need more information about that."
}

export function getCompletionMessage(businessType: BusinessType): string {
  return COMPLETION_MESSAGES[businessType]
}

// Generate natural language question
export function generateQuestionPrompt(question: Question, businessType: BusinessType): string {
  if (question.aiPrompt) {
    return question.aiPrompt
  }
  
  // Fallback to generic prompt
  return `Tell me about your ${question.label.toLowerCase()}.`
}

// Generate follow-up question
export function generateFollowUpPrompt(questionId: string, answer: any): string {
  const basePrompt = getFollowUpPrompt(questionId)
  
  // Customize based on answer
  if (questionId === 'pool_tables' && answer === true) {
    return "Awesome! How many pool tables do you have?"
  }
  
  if (questionId === 'tvs' && answer === true) {
    return "Great! How many TVs do you have for watching sports?"
  }
  
  if (questionId === 'wifi' && answer === true) {
    return "Perfect! What's your WiFi password for customers?"
  }
  
  return basePrompt
}
