import { BusinessType, getQuestionSet, getBusinessTypeDisplayName } from '../../src/lib/ai-intake'
import { moderateContent, getModerationSummary } from '../../src/lib/content-moderation'

describe('AI Intake System', () => {
  describe('Question Sets', () => {
    it('should have question sets for all business types', () => {
      const businessTypes: BusinessType[] = [
        'dive_bar', 'cafe', 'fine_dining', 'sports_bar',
        'family_restaurant', 'brewery', 'pizzeria', 'food_truck'
      ]

      businessTypes.forEach(type => {
        const questionSet = getQuestionSet(type)
        expect(questionSet).toBeDefined()
        expect(questionSet.questions.length).toBeGreaterThan(0)
        // Note: Some business types reuse question sets, so we check the original type
        expect(['dive_bar', 'cafe', 'fine_dining', 'sports_bar']).toContain(questionSet.businessType)
      })
    })

    it('should have required fields for dive bar', () => {
      const questionSet = getQuestionSet('dive_bar')
      const requiredQuestions = questionSet.questions.filter(q => q.required)
      
      expect(requiredQuestions.length).toBeGreaterThan(0)
      expect(requiredQuestions.some(q => q.id === 'name')).toBe(true)
      expect(requiredQuestions.some(q => q.id === 'address')).toBe(true)
      expect(requiredQuestions.some(q => q.id === 'phone')).toBe(true)
      expect(requiredQuestions.some(q => q.id === 'email')).toBe(true)
    })

    it('should have business-specific questions', () => {
      const diveBarSet = getQuestionSet('dive_bar')
      const cafeSet = getQuestionSet('cafe')
      
      expect(diveBarSet.questions.some(q => q.id === 'pool_tables')).toBe(true)
      expect(cafeSet.questions.some(q => q.id === 'wifi')).toBe(true)
    })
  })

  describe('Content Moderation', () => {
    it('should detect profanity', () => {
      const result = moderateContent('This is damn good food', 'description', 'dive_bar')
      
      expect(result.flags.some(f => f.type === 'profanity')).toBe(true)
      // Note: Content with medium severity profanity may still be approved
      expect(result.flags.length).toBeGreaterThan(0)
    })

    it('should detect PII in wrong fields', () => {
      const result = moderateContent('Call us at (555) 123-4567', 'description', 'dive_bar')
      
      // The phone pattern should match (555) 123-4567 format
      expect(result.flags.some(f => f.type === 'pii')).toBe(true)
    })

    it('should allow PII in correct fields', () => {
      const result = moderateContent('(555) 123-4567', 'phone', 'dive_bar')
      
      expect(result.isApproved).toBe(true)
      expect(result.flags.some(f => f.type === 'pii')).toBe(false)
    })

    it('should check content quality', () => {
      const result = moderateContent('a', 'description', 'dive_bar')
      
      expect(result.flags.some(f => f.type === 'quality')).toBe(true)
    })

    it('should check business appropriateness', () => {
      const result = moderateContent('Upscale elegant dining', 'description', 'dive_bar')
      
      expect(result.flags.some(f => f.type === 'inappropriate')).toBe(true)
    })
  })

  describe('Business Type Display', () => {
    it('should return proper display names', () => {
      expect(getBusinessTypeDisplayName('dive_bar')).toBe('Dive Bar')
      expect(getBusinessTypeDisplayName('cafe')).toBe('Café')
      expect(getBusinessTypeDisplayName('fine_dining')).toBe('Fine Dining')
    })
  })
})
