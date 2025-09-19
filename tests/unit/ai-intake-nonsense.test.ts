import { moderateContent, getModerationSummary } from '../../src/lib/content-moderation'
import { getQuestionSet } from '../../src/lib/ai-intake'
import { 
  ALL_NONSENSE_TEST_CASES,
  EMPTY_INPUTS,
  GIBBERISH_INPUTS,
  EXTREME_LENGTH_INPUTS,
  MALFORMED_DATA_INPUTS,
  INAPPROPRIATE_CONTENT_INPUTS,
  PII_WRONG_CONTEXT_INPUTS,
  BUSINESS_TYPE_MISMATCH_INPUTS,
  EDGE_CASE_INPUTS,
  VALID_INPUTS,
  getTestCasesByCategory,
  getTestCasesByFlag
} from '../fixtures/nonsense-inputs'

describe('AI Intake - Nonsense Input Handling', () => {
  describe('Empty and Null Inputs', () => {
    EMPTY_INPUTS.forEach(testCase => {
      it(`should handle ${testCase.name}: ${testCase.description}`, () => {
        const result = moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        
        expect(result.isApproved).toBe(testCase.shouldApprove)
        testCase.expectedFlags.forEach(flag => {
          expect(result.flags.some(f => f.type === flag)).toBe(true)
        })
      })
    })
  })

  describe('Random Characters and Gibberish', () => {
    GIBBERISH_INPUTS.forEach(testCase => {
      it(`should handle ${testCase.name}: ${testCase.description}`, () => {
        const result = moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        
        expect(result.isApproved).toBe(testCase.shouldApprove)
        testCase.expectedFlags.forEach(flag => {
          expect(result.flags.some(f => f.type === flag)).toBe(true)
        })
      })
    })
  })

  describe('Extremely Long Inputs', () => {
    EXTREME_LENGTH_INPUTS.forEach(testCase => {
      it(`should handle ${testCase.name}: ${testCase.description}`, () => {
        const result = moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        
        expect(result.isApproved).toBe(testCase.shouldApprove)
        testCase.expectedFlags.forEach(flag => {
          expect(result.flags.some(f => f.type === flag)).toBe(true)
        })
      })
    })
  })

  describe('Malformed Data Types', () => {
    MALFORMED_DATA_INPUTS.forEach(testCase => {
      it(`should handle ${testCase.name}: ${testCase.description}`, () => {
        const result = moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        
        expect(result.isApproved).toBe(testCase.shouldApprove)
        testCase.expectedFlags.forEach(flag => {
          expect(result.flags.some(f => f.type === flag)).toBe(true)
        })
      })
    })
  })

  describe('Inappropriate Content', () => {
    INAPPROPRIATE_CONTENT_INPUTS.forEach(testCase => {
      it(`should handle ${testCase.name}: ${testCase.description}`, () => {
        const result = moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        
        expect(result.isApproved).toBe(testCase.shouldApprove)
        testCase.expectedFlags.forEach(flag => {
          expect(result.flags.some(f => f.type === flag)).toBe(true)
        })
      })
    })
  })

  describe('PII in Wrong Context', () => {
    PII_WRONG_CONTEXT_INPUTS.forEach(testCase => {
      it(`should handle ${testCase.name}: ${testCase.description}`, () => {
        const result = moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        
        expect(result.isApproved).toBe(testCase.shouldApprove)
        testCase.expectedFlags.forEach(flag => {
          expect(result.flags.some(f => f.type === flag)).toBe(true)
        })
      })
    })
  })

  describe('Business Type Mismatches', () => {
    BUSINESS_TYPE_MISMATCH_INPUTS.forEach(testCase => {
      it(`should handle ${testCase.name}: ${testCase.description}`, () => {
        const result = moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        
        expect(result.isApproved).toBe(testCase.shouldApprove)
        testCase.expectedFlags.forEach(flag => {
          expect(result.flags.some(f => f.type === flag)).toBe(true)
        })
      })
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    EDGE_CASE_INPUTS.forEach(testCase => {
      it(`should handle ${testCase.name}: ${testCase.description}`, () => {
        const result = moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        
        expect(result.isApproved).toBe(testCase.shouldApprove)
        testCase.expectedFlags.forEach(flag => {
          expect(result.flags.some(f => f.type === flag)).toBe(true)
        })
      })
    })
  })

  describe('Valid Inputs (Control Group)', () => {
    VALID_INPUTS.forEach(testCase => {
      it(`should approve ${testCase.name}: ${testCase.description}`, () => {
        const result = moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        
        expect(result.isApproved).toBe(testCase.shouldApprove)
        expect(result.flags.length).toBe(0)
      })
    })
  })

  describe('Comprehensive Test Coverage', () => {
    it('should handle all test cases without throwing errors', () => {
      ALL_NONSENSE_TEST_CASES.forEach(testCase => {
        expect(() => {
          moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        }).not.toThrow()
      })
    })

    it('should provide consistent results for identical inputs', () => {
      const testInput = 'This is a test input'
      const result1 = moderateContent(testInput, 'description', 'dive_bar')
      const result2 = moderateContent(testInput, 'description', 'dive_bar')
      
      expect(result1.isApproved).toBe(result2.isApproved)
      expect(result1.flags.length).toBe(result2.flags.length)
    })

    it('should handle case sensitivity correctly', () => {
      const upperCase = 'THIS IS A TEST'
      const lowerCase = 'this is a test'
      const mixedCase = 'This Is A Test'
      
      const result1 = moderateContent(upperCase, 'description', 'dive_bar')
      const result2 = moderateContent(lowerCase, 'description', 'dive_bar')
      const result3 = moderateContent(mixedCase, 'description', 'dive_bar')
      
      // All should be approved (assuming they're valid content)
      expect(result1.isApproved).toBe(true)
      expect(result2.isApproved).toBe(true)
      expect(result3.isApproved).toBe(true)
    })
  })

  describe('Performance Tests', () => {
    it('should handle large number of test cases efficiently', () => {
      const startTime = Date.now()
      
      // Run all test cases
      ALL_NONSENSE_TEST_CASES.forEach(testCase => {
        moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000) // 5 seconds
    })

    it('should handle very long inputs efficiently', () => {
      const veryLongInput = 'a'.repeat(100000) // 100k characters
      const startTime = Date.now()
      
      const result = moderateContent(veryLongInput, 'description', 'dive_bar')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(result.isApproved).toBe(false)
      expect(duration).toBeLessThan(1000) // 1 second
    })
  })

  describe('Moderation Summary Tests', () => {
    it('should provide helpful summaries for problematic content', () => {
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

    it('should provide different summaries for different flag types', () => {
      const profanityContent = 'This place is damn good'
      const piiContent = 'Call us at (555) 123-4567'
      const spamContent = 'BUY NOW! CHEAP PRICES!'
      
      const profanityResult = moderateContent(profanityContent, 'description', 'dive_bar')
      const piiResult = moderateContent(piiContent, 'description', 'dive_bar')
      const spamResult = moderateContent(spamContent, 'description', 'dive_bar')
      
      const profanitySummary = getModerationSummary(profanityResult)
      const piiSummary = getModerationSummary(piiResult)
      const spamSummary = getModerationSummary(spamResult)
      
      expect(profanitySummary).toContain('profanity')
      expect(piiSummary).toContain('PII')
      expect(spamSummary).toContain('spam')
    })
  })

  describe('Question Set Validation', () => {
    it('should handle invalid business types gracefully', () => {
      expect(() => getQuestionSet('invalid_type' as any)).toThrow()
    })

    it('should handle null business type gracefully', () => {
      expect(() => getQuestionSet(null as any)).toThrow()
    })

    it('should handle undefined business type gracefully', () => {
      expect(() => getQuestionSet(undefined as any)).toThrow()
    })

    it('should provide valid question sets for all business types', () => {
      const businessTypes = ['dive_bar', 'cafe', 'fine_dining', 'sports_bar']
      
      businessTypes.forEach(type => {
        const questionSet = getQuestionSet(type as any)
        expect(questionSet).toBeDefined()
        expect(questionSet.questions.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Regression Tests', () => {
    it('should maintain consistent behavior across multiple runs', () => {
      const testCases = getTestCasesByCategory('gibberish')
      
      testCases.forEach(testCase => {
        // Run multiple times to ensure consistency
        const results = Array.from({ length: 5 }, () => 
          moderateContent(testCase.input, testCase.field as any, testCase.businessType as any)
        )
        
        // All results should be identical
        const firstResult = results[0]
        results.forEach(result => {
          expect(result.isApproved).toBe(firstResult.isApproved)
          expect(result.flags.length).toBe(firstResult.flags.length)
        })
      })
    })

    it('should handle edge cases that previously caused issues', () => {
      // Test cases that might have caused issues in the past
      const edgeCases = [
        { input: '', field: 'description', businessType: 'dive_bar' },
        { input: null, field: 'description', businessType: 'dive_bar' },
        { input: undefined, field: 'description', businessType: 'dive_bar' },
        { input: 'a'.repeat(10000), field: 'description', businessType: 'dive_bar' }
      ]
      
      edgeCases.forEach(testCase => {
        expect(() => {
          moderateContent(testCase.input as any, testCase.field as any, testCase.businessType as any)
        }).not.toThrow()
      })
    })
  })
})
