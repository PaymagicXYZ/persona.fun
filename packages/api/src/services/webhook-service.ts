import { neynar } from './neynar'
import { getPersonas } from '@persona/db'
import { Redis } from 'ioredis'
import { logger } from '../utils/logger'

const redis = new Redis(process.env.REDIS_URL as string)
const WEBHOOK_ID_KEY = 'neynar:reply:webhook_id'

export class WebhookService {
  private static instance: WebhookService
  private webhookId: string | null = null
  private readonly baseUrl: string

  private constructor() {
    if (!process.env.API_BASE_URL) {
      throw new Error('API_BASE_URL environment variable is not set')
    }
    this.baseUrl = process.env.API_BASE_URL
  }

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService()
    }
    return WebhookService.instance
  }

  async initialize(): Promise<void> {
    try {
      const lockKey = 'webhook:initialization:lock'
      const lock = await redis.set(lockKey, '1', 'EX', 30, 'NX')

      if (!lock) {
        logger.warn('Another instance is initializing webhook, waiting...')
        await new Promise((resolve) => setTimeout(resolve, 5000))
        return this.initialize()
      }

      try {
        this.webhookId = await redis.get(WEBHOOK_ID_KEY)
        logger.info('Current webhook ID:', this.webhookId)

        if (this.webhookId) {
          try {
            const webhook = await neynar.getWebhook(this.webhookId)
            logger.info('Existing webhook validated:', webhook)

            // Only update FIDs if webhook is valid
            await this.updateWebhookFids()
            return
          } catch (error) {
            logger.error('Invalid webhook, cleaning up:', error)
            await this.deleteWebhook()
            this.webhookId = null
          }
        }

        // Only create new webhook if we don't have a valid one
        if (!this.webhookId) {
          logger.info('Creating new webhook...')
          await this.createWebhook()
        }
      } finally {
        logger.info('Releasing initialization lock')
        await redis.del(lockKey)
      }
    } catch (error) {
      logger.error('Webhook initialization failed:', error)
      throw error
    }
  }

  private async createWebhook() {
    const personas = await getPersonas()
    const fids = personas.map((p) => p.fid).filter(Boolean)
    console.log('fids', fids)
    if (fids.length === 0) {
      console.log('No personas found, skipping webhook creation')
      return
    }

    try {
      const response = await neynar.createWebhook(`${this.baseUrl}/webhooks/neynar`, fids)

      this.webhookId = response.webhook.webhook_id
      await redis.set(WEBHOOK_ID_KEY, response.webhook.webhook_id)
      console.log(`Created webhook with ID: ${response.webhook.webhook_id}`)
    } catch (error) {
      console.error('Failed to create webhook:', error)
      throw error
    }
  }

  async updateWebhookFids() {
    if (!this.webhookId) {
      console.log('No webhook ID found, skipping FID update')
      return
    }

    const personas = await getPersonas()
    const fids = personas.map((p) => p.fid).filter(Boolean)

    if (fids.length === 0) {
      console.log('No personas found, skipping FID update')
      return
    }

    try {
      const currentWebhook = await neynar.getWebhook(this.webhookId)
      const currentFids = new Set(
        currentWebhook.webhook.subscription.filters['cast.created'].mentioned_fids
      )
      const newFids = new Set(fids)

      const needsUpdate =
        fids.length !== currentFids.size || fids.some((fid) => !currentFids.has(fid))

      if (!needsUpdate) {
        console.log('FIDs are up to date, skipping update')
        return
      }

      await neynar.updateWebhook(
        this.webhookId,
        Array.from(newFids),
        `${this.baseUrl}/webhooks/neynar`
      )
      console.log(`Updated webhook FIDs: ${Array.from(newFids).join(', ')}`)
    } catch (error) {
      console.error('Failed to update webhook FIDs:', error)
      throw error
    }
  }

  async deleteWebhook() {
    if (!this.webhookId) return

    try {
      await neynar.deleteWebhook(this.webhookId)
      await redis.del(WEBHOOK_ID_KEY)
      this.webhookId = null
      console.log('Webhook deleted successfully')
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      throw error
    }
  }

  getWebhookId(): string | null {
    return this.webhookId
  }
}

export const webhookService = WebhookService.getInstance()
