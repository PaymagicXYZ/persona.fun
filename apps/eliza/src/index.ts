import { elizaLogger } from '@ai16z/eliza'
export { SupabaseAdapterV2 } from './SupabaseAdapterV2'

import { startAgents } from './eliza'

startAgents().catch((error) => {
  elizaLogger.error('Unhandled error in startAgents:', error)
  process.exit(1)
})