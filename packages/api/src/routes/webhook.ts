import { createElysia } from '../utils'
import { t } from 'elysia'
import { neynar } from '../services/neynar'
import { getPersonaByFid } from '@persona/db'
import { gpt } from '../services/gpt-service'

const REQUIRED_TOKENS_FOR_RESPONSE = 1 // Define the token cost for auto-responses

export const webhookRoutes = createElysia({ prefix: '/webhooks' }).post(
  '/neynar',
  async ({ body }) => {
    try {
      const { event_type, data } = body

      if (event_type !== 'mention' && event_type !== 'reply') {
        return {
          success: false,
          error: 'Unsupported event type',
        }
      }

      // Get the mentioned persona
      const mentionedFid = data.target_fid
      const persona = await getPersonaByFid(mentionedFid)

      if (!persona) {
        return {
          success: false,
          error: 'Persona not found',
        }
      }

      // Get the cast that triggered the webhook
      const cast = await neynar.getCast(data.cast.hash)
      if (!cast) {
        return {
          success: false,
          error: 'Cast not found',
        }
      }

      // TODO: possible add a token requirement for retagging a persona
      // Check if the user has enough tokens for the response
      // const hasEnoughTokens = await checkTokenBalance(
      //   cast.cast.author.fid,
      //   persona.token.address,
      //   REQUIRED_TOKENS_FOR_RESPONSE
      // )

      // if (!hasEnoughTokens) {
      //   // Optionally respond that they need tokens
      //   await neynar.post({
      //     tokenAddress: persona.token.address,
      //     text: `@${cast.cast.author.username} You need ${REQUIRED_TOKENS_FOR_RESPONSE} ${persona.token.symbol} tokens to interact with me!`,
      //     embeds: [],
      //     parent: cast.cast.hash,
      //   })
      //   return { success: false, error: 'Insufficient tokens' }
      // }

      // Generate response using the persona's personality
      const response = await gpt.transformInput({
        input: cast.cast.text,
        personality: persona.persona_personality,
        context: {
          userUsername: cast.cast.author.username,
          isReply: event_type === 'reply',
          previousMessage: event_type === 'reply' ? cast.cast.text : undefined,
        },
      })

      // Post response
      await neynar.post({
        tokenAddress: persona.token.address,
        text: response,
        embeds: [],
        parent: cast.cast.hash,
      })

      // Deduct tokens for the interaction
      await deductTokens(
        cast.cast.author.fid,
        persona.token.address,
        REQUIRED_TOKENS_FOR_RESPONSE
      )

      return { success: true }
    } catch (error) {
      console.error('Webhook error:', error)
      return {
        success: false,
        error: 'Internal server error',
      }
    }
  },
  {
    body: t.Object({
      event_type: t.String(),
      data: t.Object({
        target_fid: t.Number(),
        cast: t.Object({
          hash: t.String(),
          author: t.Object({
            fid: t.Number(),
            username: t.String(),
          }),
          text: t.String(),
        }),
      }),
    }),
  }
)
