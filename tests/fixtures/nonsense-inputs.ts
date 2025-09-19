// Test fixtures for nonsense input scenarios
export interface NonsenseTestCase {
  name: string
  input: string
  field: string
  businessType: string
  expectedFlags: string[]
  shouldApprove: boolean
  description: string
}

export const EMPTY_INPUTS: NonsenseTestCase[] = [
  {
    name: 'empty_string',
    input: '',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Empty string input'
  },
  {
    name: 'whitespace_only',
    input: '   \n\t  ',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Whitespace-only input'
  },
  {
    name: 'null_input',
    input: null as any,
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Null input'
  },
  {
    name: 'undefined_input',
    input: undefined as any,
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Undefined input'
  }
]

export const GIBBERISH_INPUTS: NonsenseTestCase[] = [
  {
    name: 'random_characters',
    input: 'asdfghjklqwertyuiopzxcvbnm',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Random character string'
  },
  {
    name: 'special_characters',
    input: '!@#$%^&*()_+{}|:<>?[]\\;\'.,/`~',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Special character spam'
  },
  {
    name: 'repeated_characters',
    input: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Repeated characters'
  },
  {
    name: 'mixed_case_gibberish',
    input: 'AsDfGhJkLqWeRtYuIoPzXcVbNm',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Mixed case gibberish'
  },
  {
    name: 'keyboard_mash',
    input: 'qwertyuiopasdfghjklzxcvbnm',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Keyboard mashing'
  }
]

export const EXTREME_LENGTH_INPUTS: NonsenseTestCase[] = [
  {
    name: 'extremely_long',
    input: 'a'.repeat(10000),
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Extremely long string'
  },
  {
    name: 'long_repetitive',
    input: 'This is a restaurant. '.repeat(1000),
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Long repetitive text'
  },
  {
    name: 'single_char_repeat',
    input: 'a'.repeat(5000),
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Single character repeated many times'
  }
]

export const MALFORMED_DATA_INPUTS: NonsenseTestCase[] = [
  {
    name: 'numeric_only',
    input: '123456789',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Numeric input in text field'
  },
  {
    name: 'boolean_like',
    input: 'true false yes no',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Boolean-like input'
  },
  {
    name: 'json_like',
    input: '{"name": "test", "value": 123}',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'JSON-like string'
  },
  {
    name: 'html_like',
    input: '<div>test</div><script>alert("xss")</script>',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'HTML-like string with potential XSS'
  },
  {
    name: 'sql_like',
    input: "SELECT * FROM users WHERE id = '1' OR '1'='1'",
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'SQL-like injection attempt'
  }
]

export const INAPPROPRIATE_CONTENT_INPUTS: NonsenseTestCase[] = [
  {
    name: 'explicit_profanity',
    input: 'This place is fucking terrible',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['profanity'],
    shouldApprove: false,
    description: 'Explicit profanity'
  },
  {
    name: 'disguised_profanity',
    input: 'This place is f*cking terrible',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['profanity'],
    shouldApprove: false,
    description: 'Disguised profanity'
  },
  {
    name: 'illegal_activities',
    input: 'We sell drugs and illegal activities',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['inappropriate'],
    shouldApprove: false,
    description: 'Inappropriate business description'
  },
  {
    name: 'spam_content',
    input: 'BUY NOW! CHEAP PRICES! BEST DEALS! CLICK HERE!',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['spam'],
    shouldApprove: false,
    description: 'Spam-like content'
  },
  {
    name: 'offensive_language',
    input: 'This place is run by idiots and morons',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['profanity'],
    shouldApprove: false,
    description: 'Offensive language'
  }
]

export const PII_WRONG_CONTEXT_INPUTS: NonsenseTestCase[] = [
  {
    name: 'ssn_in_description',
    input: 'Our restaurant is great, my SSN is 123-45-6789',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['pii'],
    shouldApprove: false,
    description: 'SSN in wrong field'
  },
  {
    name: 'credit_card_in_description',
    input: 'Visit us! My card is 1234-5678-9012-3456',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['pii'],
    shouldApprove: false,
    description: 'Credit card in wrong field'
  },
  {
    name: 'email_in_name_field',
    input: 'Contact john.doe@example.com for reservations',
    field: 'name',
    businessType: 'dive_bar',
    expectedFlags: ['pii'],
    shouldApprove: false,
    description: 'Email in wrong field'
  },
  {
    name: 'address_in_phone_field',
    input: 'We are located at 123 Main Street',
    field: 'phone',
    businessType: 'dive_bar',
    expectedFlags: ['pii'],
    shouldApprove: false,
    description: 'Address in wrong field'
  },
  {
    name: 'multiple_pii',
    input: 'Call (555) 123-4567 or email me@example.com, SSN 123-45-6789',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['pii'],
    shouldApprove: false,
    description: 'Multiple PII types'
  }
]

export const BUSINESS_TYPE_MISMATCH_INPUTS: NonsenseTestCase[] = [
  {
    name: 'dive_bar_for_fine_dining',
    input: 'Cheap beer and pool tables',
    field: 'description',
    businessType: 'fine_dining',
    expectedFlags: ['inappropriate'],
    shouldApprove: false,
    description: 'Dive bar content for fine dining'
  },
  {
    name: 'fine_dining_for_dive_bar',
    input: 'Upscale elegant dining with wine pairings',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['inappropriate'],
    shouldApprove: false,
    description: 'Fine dining content for dive bar'
  },
  {
    name: 'cafe_for_sports_bar',
    input: 'Quiet atmosphere with artisanal coffee',
    field: 'description',
    businessType: 'sports_bar',
    expectedFlags: ['inappropriate'],
    shouldApprove: false,
    description: 'Cafe content for sports bar'
  },
  {
    name: 'sports_bar_for_cafe',
    input: 'Big screen TVs and loud music',
    field: 'description',
    businessType: 'cafe',
    expectedFlags: ['inappropriate'],
    shouldApprove: false,
    description: 'Sports bar content for cafe'
  }
]

export const EDGE_CASE_INPUTS: NonsenseTestCase[] = [
  {
    name: 'minimum_length',
    input: 'ab',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Minimum length content'
  },
  {
    name: 'maximum_length',
    input: 'a'.repeat(500),
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'Maximum length content'
  },
  {
    name: 'unicode_emojis',
    input: '🍕🍔🍟🌭🥪🌮🌯🥙🥗🍜🍝🍲🍛🍣🍱🍤🍙🍚🍘🍥🥠🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: [],
    shouldApprove: true,
    description: 'Unicode emojis (might be acceptable)'
  },
  {
    name: 'mixed_languages',
    input: 'This is a great restaurant. 这是一个很好的餐厅。',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: [],
    shouldApprove: true,
    description: 'Mixed languages (might be acceptable)'
  },
  {
    name: 'urls_and_links',
    input: 'Visit our website at https://example.com for more info',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: ['quality'],
    shouldApprove: false,
    description: 'URLs and links'
  }
]

export const VALID_INPUTS: NonsenseTestCase[] = [
  {
    name: 'valid_dive_bar',
    input: 'Great dive bar with cheap beer and pool tables',
    field: 'description',
    businessType: 'dive_bar',
    expectedFlags: [],
    shouldApprove: true,
    description: 'Valid dive bar description'
  },
  {
    name: 'valid_cafe',
    input: 'Cozy cafe with artisanal coffee and pastries',
    field: 'description',
    businessType: 'cafe',
    expectedFlags: [],
    shouldApprove: true,
    description: 'Valid cafe description'
  },
  {
    name: 'valid_fine_dining',
    input: 'Upscale restaurant with fine wine and elegant atmosphere',
    field: 'description',
    businessType: 'fine_dining',
    expectedFlags: [],
    shouldApprove: true,
    description: 'Valid fine dining description'
  },
  {
    name: 'valid_sports_bar',
    input: 'Sports bar with big screen TVs and game day specials',
    field: 'description',
    businessType: 'sports_bar',
    expectedFlags: [],
    shouldApprove: true,
    description: 'Valid sports bar description'
  }
]

// Combine all test cases
export const ALL_NONSENSE_TEST_CASES: NonsenseTestCase[] = [
  ...EMPTY_INPUTS,
  ...GIBBERISH_INPUTS,
  ...EXTREME_LENGTH_INPUTS,
  ...MALFORMED_DATA_INPUTS,
  ...INAPPROPRIATE_CONTENT_INPUTS,
  ...PII_WRONG_CONTEXT_INPUTS,
  ...BUSINESS_TYPE_MISMATCH_INPUTS,
  ...EDGE_CASE_INPUTS,
  ...VALID_INPUTS
]

// Helper function to get test cases by category
export function getTestCasesByCategory(category: string): NonsenseTestCase[] {
  switch (category) {
    case 'empty': return EMPTY_INPUTS
    case 'gibberish': return GIBBERISH_INPUTS
    case 'extreme_length': return EXTREME_LENGTH_INPUTS
    case 'malformed': return MALFORMED_DATA_INPUTS
    case 'inappropriate': return INAPPROPRIATE_CONTENT_INPUTS
    case 'pii': return PII_WRONG_CONTEXT_INPUTS
    case 'business_mismatch': return BUSINESS_TYPE_MISMATCH_INPUTS
    case 'edge_cases': return EDGE_CASE_INPUTS
    case 'valid': return VALID_INPUTS
    default: return ALL_NONSENSE_TEST_CASES
  }
}

// Helper function to get test cases by expected flag type
export function getTestCasesByFlag(flagType: string): NonsenseTestCase[] {
  return ALL_NONSENSE_TEST_CASES.filter(testCase => 
    testCase.expectedFlags.includes(flagType)
  )
}
