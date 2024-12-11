import {
  composeActionExamples,
  formatActions,
  formatActionNames,
  type Action,
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
} from '@ai16z/eliza'
import { describe, expect, it } from 'vitest'
// import { tipUserAction } from '../eliza'

describe('Actions', () => {
  const mockActions: Action[] = [
    {
      name: 'tipUser',
      description: 'Tips users based on the positivity of their messages.',
      examples: [
        [
          {
            user: '{{user1}}',
            content: { text: 'This is a great service!' },
          },
          {
            user: '{{agent}}',
            content: {
              text: "Thank you for your positive message! You've been tipped $5.00.",
              action: 'TIP_USER',
            },
          },
        ],
      ],
      similes: [],
      // biome-ignore lint/complexity/useArrowFunction: <explanation>
      handler: function (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state?: State,
        _options?: { [key: string]: unknown },
        _callback?: HandlerCallback
      ): Promise<unknown> {
        return 1
        throw new Error('Function not implemented.')
      },
      // biome-ignore lint/complexity/useArrowFunction: <explanation>
      validate: function (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
      ): Promise<boolean> {
        // Simple positivity check (replace with actual sentiment analysis)
        const positiveWords = ['great', 'awesome', 'fantastic', 'good']
        const messageText = (_message.content as any).text.toLowerCase()
        return positiveWords.some((word) => messageText.includes(word))
      },
    },
  ]

  describe('tipUserAction', () => {
    it('should validate positive messages', () => {
      const result = composeActionExamples(mockActions, 2)
      expect(result).toBe(1)
    })
  })
})
