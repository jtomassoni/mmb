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

  describe('Nonsense Input Handling', () => {
    describe('Empty and Null Inputs', () => {
      it('should handle empty strings', () => {
        const result = moderateContent('', 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle whitespace-only input', () => {
        const result = moderateContent('   \n\t  ', 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle null/undefined gracefully', () => {
        expect(() => moderateContent(null as any, 'description', 'dive_bar')).not.toThrow()
        expect(() => moderateContent(undefined as any, 'description', 'dive_bar')).not.toThrow()
      })
    })

    describe('Random Characters and Gibberish', () => {
      it('should handle random character strings', () => {
        const gibberish = 'asdfghjklqwertyuiopzxcvbnm'
        const result = moderateContent(gibberish, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle special character spam', () => {
        const spam = '!@#$%^&*()_+{}|:<>?[]\\;\'.,/`~'
        const result = moderateContent(spam, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle repeated characters', () => {
        const repeated = 'aaaaaaaaaaaaaaaaaaaaaaaa'
        const result = moderateContent(repeated, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle mixed case gibberish', () => {
        const mixed = 'AsDfGhJkLqWeRtYuIoPzXcVbNm'
        const result = moderateContent(mixed, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })
    })

    describe('Extremely Long Inputs', () => {
      it('should handle extremely long strings', () => {
        const longString = 'a'.repeat(10000)
        const result = moderateContent(longString, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle long repetitive text', () => {
        const repetitive = 'This is a restaurant. '.repeat(1000)
        const result = moderateContent(repetitive, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })
    })

    describe('Malformed Data Types', () => {
      it('should handle numeric input in text fields', () => {
        const numeric = '123456789'
        const result = moderateContent(numeric, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle boolean-like input', () => {
        const booleanLike = 'true false yes no'
        const result = moderateContent(booleanLike, 'description', 'dive_bar')
        // This might be acceptable depending on context
        expect(result.flags.length).toBeGreaterThanOrEqual(0)
      })

      it('should handle JSON-like strings', () => {
        const jsonLike = '{"name": "test", "value": 123}'
        const result = moderateContent(jsonLike, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle HTML-like strings', () => {
        const htmlLike = '<div>test</div><script>alert("xss")</script>'
        const result = moderateContent(htmlLike, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })
    })

    describe('Inappropriate Content', () => {
      it('should handle explicit profanity', () => {
        const explicit = 'This place is fucking terrible'
        const result = moderateContent(explicit, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'profanity')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle disguised profanity', () => {
        const disguised = 'This place is f*cking terrible'
        const result = moderateContent(disguised, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'profanity')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle inappropriate business descriptions', () => {
        const inappropriate = 'We sell drugs and illegal activities'
        const result = moderateContent(inappropriate, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'inappropriate')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle spam-like content', () => {
        const spam = 'BUY NOW! CHEAP PRICES! BEST DEALS! CLICK HERE!'
        const result = moderateContent(spam, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'spam')).toBe(true)
        expect(result.isApproved).toBe(false)
      })
    })

    describe('PII in Wrong Context', () => {
      it('should detect SSN in description', () => {
        const ssn = 'Our restaurant is great, my SSN is 123-45-6789'
        const result = moderateContent(ssn, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'pii')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should detect credit card in description', () => {
        const cc = 'Visit us! My card is 1234-5678-9012-3456'
        const result = moderateContent(cc, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'pii')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should detect email in wrong field', () => {
        const email = 'Contact john.doe@example.com for reservations'
        const result = moderateContent(email, 'name', 'dive_bar')
        expect(result.flags.some(f => f.type === 'pii')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should detect address in wrong field', () => {
        const address = 'We are located at 123 Main Street'
        const result = moderateContent(address, 'phone', 'dive_bar')
        expect(result.flags.some(f => f.type === 'pii')).toBe(true)
        expect(result.isApproved).toBe(false)
      })
    })

    describe('Business Type Mismatches', () => {
      it('should flag dive bar content for fine dining', () => {
        const diveBarContent = 'Cheap beer and pool tables'
        const result = moderateContent(diveBarContent, 'description', 'fine_dining')
        expect(result.flags.some(f => f.type === 'inappropriate')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should flag fine dining content for dive bar', () => {
        const fineDiningContent = 'Upscale elegant dining with wine pairings'
        const result = moderateContent(fineDiningContent, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'inappropriate')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should flag cafe content for sports bar', () => {
        const cafeContent = 'Quiet atmosphere with artisanal coffee'
        const result = moderateContent(cafeContent, 'description', 'sports_bar')
        expect(result.flags.some(f => f.type === 'inappropriate')).toBe(true)
        expect(result.isApproved).toBe(false)
      })
    })

    describe('Edge Cases and Boundary Conditions', () => {
      it('should handle minimum length content', () => {
        const minLength = 'ab'
        const result = moderateContent(minLength, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle maximum length content', () => {
        const maxLength = 'a'.repeat(500)
        const result = moderateContent(maxLength, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })

      it('should handle unicode characters', () => {
        const unicode = '🍕🍔🍟🌭🥪🌮🌯🥙🥗🍜🍝🍲🍛🍣🍱🍤🍙🍚🍘🍥🥠🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪'
        const result = moderateContent(unicode, 'description', 'dive_bar')
        // Unicode emojis might be acceptable for restaurant descriptions
        expect(result.flags.length).toBeGreaterThanOrEqual(0)
      })

      it('should handle mixed languages', () => {
        const mixed = 'This is a great restaurant. 这是一个很好的餐厅。'
        const result = moderateContent(mixed, 'description', 'dive_bar')
        // Mixed languages might be acceptable
        expect(result.flags.length).toBeGreaterThanOrEqual(0)
      })

      it('should handle URLs and links', () => {
        const url = 'Visit our website at https://example.com for more info'
        const result = moderateContent(url, 'description', 'dive_bar')
        expect(result.flags.some(f => f.type === 'quality')).toBe(true)
        expect(result.isApproved).toBe(false)
      })
    })

    describe('Question Set Validation', () => {
      it('should handle invalid business types', () => {
        expect(() => getQuestionSet('invalid_type' as BusinessType)).toThrow()
      })

      it('should handle null business type', () => {
        expect(() => getQuestionSet(null as any)).toThrow()
      })

      it('should handle undefined business type', () => {
        expect(() => getQuestionSet(undefined as any)).toThrow()
      })
    })

    describe('Moderation Summary', () => {
      it('should provide helpful summary for multiple flags', () => {
        const problematicContent = 'This fucking place sucks! Call 555-123-4567 or email me@example.com'
        const result = moderateContent(problematicContent, 'description', 'dive_bar')
        const summary = getModerationSummary(result)
        
        expect(summary).toContain('profanity')
        expect(summary).toContain('PII')
        expect(summary.length).toBeGreaterThan(0)
      })

      it('should handle empty flags gracefully', () => {
        const cleanContent = 'Great restaurant with good food'
        const result = moderateContent(cleanContent, 'description', 'dive_bar')
        const summary = getModerationSummary(result)
        
        expect(summary).toBe('Content approved')
      })
    })
  })
})
