'use client'

import { useState, useEffect, useRef } from 'react'
import { BusinessType, Question, QuestionSet, IntakeSession } from '../lib/ai-intake'
import { ChatMessage, ChatSession, getSystemPrompt, getWelcomeMessage, getFollowUpPrompt, getValidationPrompt, getCompletionMessage, generateQuestionPrompt } from '../lib/ai-prompts'
import { moderateContent, ModerationResult } from '../lib/content-moderation'

interface AIIntakeChatProps {
  businessType: BusinessType
  onComplete: (answers: Record<string, any>) => void
  onPreview: (answers: Record<string, any>) => void
}

export default function AIIntakeChat({ businessType, onComplete, onPreview }: AIIntakeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [moderationResults, setModerationResults] = useState<ModerationResult[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get question set for business type
  const questionSet = require('../lib/ai-intake').getQuestionSet(businessType)
  const allQuestions = [...questionSet.questions, ...questionSet.followUpQuestions]

  useEffect(() => {
    // Initialize chat with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(businessType),
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    
    // Set first question
    if (allQuestions.length > 0) {
      setCurrentQuestionId(allQuestions[0].id)
    }
  }, [businessType])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      questionId: currentQuestionId || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Moderate content first
      const moderationResult = moderateContent(inputValue.trim(), currentQuestionId || 'unknown', businessType)
      
      if (!moderationResult.isApproved) {
        // Show moderation flags
        const moderationMessage: ChatMessage = {
          id: `moderation-${Date.now()}`,
          role: 'assistant',
          content: `I noticed some issues with your response: ${moderationResult.flags.map(f => f.message).join(', ')}. ${moderationResult.reason || 'Please try again.'}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, moderationMessage])
        setIsLoading(false)
        return
      }

      // Process the answer
      const processedAnswer = await processAnswer(inputValue.trim(), currentQuestionId, answers)
      
      // Update answers
      const newAnswers = { ...answers, ...processedAnswer }
      setAnswers(newAnswers)
      
      // Store moderation result
      setModerationResults(prev => [...prev, moderationResult])

      // Generate AI response
      const aiResponse = await generateAIResponse(processedAnswer, currentQuestionId, newAnswers, questionSet)
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      // Move to next question or complete
      if (aiResponse.nextQuestionId) {
        setCurrentQuestionId(aiResponse.nextQuestionId)
        setCurrentStep(prev => prev + 1)
      } else {
        // All questions completed
        setShowPreview(true)
        setCurrentQuestionId(null)
      }

    } catch (error) {
      console.error('Error processing answer:', error)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Could you try again?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const processAnswer = async (input: string, questionId: string | null, currentAnswers: Record<string, any>) => {
    if (!questionId) return {}

    const question = allQuestions.find(q => q.id === questionId)
    if (!question) return {}

    // Basic validation
    if (question.required && !input.trim()) {
      throw new Error('This field is required')
    }

    // Type-specific processing
    let processedValue: any = input.trim()

    switch (question.type) {
      case 'boolean':
        processedValue = /^(yes|y|true|1|yeah|sure|ok|okay)$/i.test(input)
        break
      case 'number':
        const num = parseInt(input)
        if (isNaN(num)) throw new Error('Please enter a valid number')
        if (question.validation?.min && num < question.validation.min) {
          throw new Error(`Please enter a number at least ${question.validation.min}`)
        }
        if (question.validation?.max && num > question.validation.max) {
          throw new Error(`Please enter a number no more than ${question.validation.max}`)
        }
        processedValue = num
        break
      case 'email':
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(input)) {
          throw new Error('Please enter a valid email address')
        }
        break
      case 'phone':
        if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(input)) {
          throw new Error('Please enter a phone number in the format: (303) 555-0123')
        }
        break
    }

    return { [questionId]: processedValue }
  }

  const generateAIResponse = async (processedAnswer: Record<string, any>, questionId: string | null, allAnswers: Record<string, any>, questionSet: QuestionSet) => {
    if (!questionId) {
      return {
        content: getCompletionMessage(businessType),
        nextQuestionId: null
      }
    }

    const question = allQuestions.find(q => q.id === questionId)
    if (!question) {
      return {
        content: 'Great! Let me ask you about something else.',
        nextQuestionId: null
      }
    }

    // Check if we need follow-up questions
    const followUpQuestions = questionSet.followUpQuestions.filter(fq => {
      // Simple logic: if this question was answered positively, ask follow-up
      if (question.type === 'boolean' && processedAnswer[questionId] === true) {
        return fq.id.includes(questionId.replace('_', '')) || fq.id.includes(questionId)
      }
      return false
    })

    // Find next question
    const currentIndex = allQuestions.findIndex(q => q.id === questionId)
    let nextQuestionId: string | null = null

    if (followUpQuestions.length > 0) {
      // Ask follow-up question
      nextQuestionId = followUpQuestions[0].id
    } else {
      // Move to next main question
      const nextIndex = currentIndex + 1
      if (nextIndex < allQuestions.length) {
        nextQuestionId = allQuestions[nextIndex].id
      }
    }

    // Generate response
    let response = ''
    if (nextQuestionId) {
      const nextQuestion = allQuestions.find(q => q.id === nextQuestionId)
      if (nextQuestion) {
        response = generateQuestionPrompt(nextQuestion, businessType)
      } else {
        response = 'Tell me more about that.'
      }
    } else {
      response = getCompletionMessage(businessType)
    }

    return {
      content: response,
      nextQuestionId
    }
  }

  const handlePreview = () => {
    onPreview(answers)
  }

  const handleComplete = () => {
    onComplete(answers)
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{currentStep} / {allQuestions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / allQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Input Form */}
      {!showPreview && (
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      )}

      {/* Preview Actions */}
      {showPreview && (
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={handlePreview}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Preview Website
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Website
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
