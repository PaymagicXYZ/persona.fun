import { createElysia } from '../utils'
import { t } from 'elysia'
import { neynar } from '../services/neynar'
import { getPersonaByFid } from '@persona/db'
import { gpt } from '../services/gpt-service'

export const webhookRoutes = createElysia({ prefix: '/webhooks' }).post(
  '/neynar',
  async ({ body }) => {
    try {
      console.log('Received webhook:', body)
      
      const mentionedFid = body.data.mentioned_profiles[0].fid
      const persona = await getPersonaByFid(mentionedFid)

      if (!persona) {
        return {
          success: false,
          error: 'Persona not found',
        }
      }

      // Transform the message using persona's personality
      const response = await gpt.transformInput(
        body.data.text,
        persona.persona_personality
      )

      if (!response) {
        throw new Error('Failed to generate response')
      }

      // Post response
      await neynar.post({
        tokenAddress: persona.token.address,
        text: response,
        embeds: [],
        parent: body.data.hash
      })

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
      data: t.Object({
        hash: t.String(),
        text: t.String(),
        mentioned_profiles: t.Array(
          t.Object({
            fid: t.Number(),
            username: t.String(),
          })
        ),
      }),
    }),
  }
)
