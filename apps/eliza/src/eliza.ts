import { PostgresDatabaseAdapter } from '@ai16z/adapter-postgres'
import { SqliteDatabaseAdapter } from '@ai16z/adapter-sqlite'
import { AutoClientInterface } from '@ai16z/client-auto'
import { DirectClientInterface } from '@ai16z/client-direct'
import { DiscordClientInterface } from '@ai16z/client-discord'
import { TelegramClientInterface } from '@ai16z/client-telegram'
import { TwitterClientInterface } from '@ai16z/client-twitter'
import { FarcasterAgentClient } from '@ai16z/client-farcaster'
import {
  Action,
  AgentRuntime,
  CacheManager,
  type Character,
  DbCacheAdapter,
  FsCacheAdapter,
  type IAgentRuntime,
  type ICacheManager,
  type IDatabaseAdapter,
  type IDatabaseCacheAdapter,
  Memory,
  ModelProviderName,
  elizaLogger,
  settings,
  stringToUuid,
  validateCharacterConfig,
} from '@ai16z/eliza'

import { bootstrapPlugin } from '@ai16z/plugin-bootstrap'

import { imageGenerationPlugin } from '@ai16z/plugin-image-generation'
import { createNodePlugin } from '@ai16z/plugin-node'
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yargs from 'yargs'
import { character as defaultCharacter } from './character'
import { getPersonaByFid, getPersonasByFids } from '@persona/db'
import { SupabaseDatabaseAdapter } from '@ai16z/adapter-supabase'
import { SupabaseAdapterV2 } from './SupabaseAdapterV2'
import { validate } from 'uuid'
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

export const wait = (minTime = 1000, maxTime = 3000) => {
  const waitTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime
  return new Promise((resolve) => setTimeout(resolve, waitTime))
}

function isAllStrings(arr: unknown[]): boolean {
  return Array.isArray(arr) && arr.every((item) => typeof item === 'string')
}

export function getTokenForProvider(provider: ModelProviderName, character: Character) {
  switch (provider) {
    case ModelProviderName.OPENAI:
      return character.settings?.secrets?.OPENAI_API_KEY || settings.OPENAI_API_KEY
    case ModelProviderName.ETERNALAI:
      return character.settings?.secrets?.ETERNALAI_API_KEY || settings.ETERNALAI_API_KEY
    // case ModelProviderName.LLAMACLOUD:
    // case ModelProviderName.TOGETHER:
    // 	return (
    // 		character.settings?.secrets?.LLAMACLOUD_API_KEY ||
    // 		settings.LLAMACLOUD_API_KEY ||
    // 		character.settings?.secrets?.TOGETHER_API_KEY ||
    // 		settings.TOGETHER_API_KEY ||
    // 		character.settings?.secrets?.XAI_API_KEY ||
    // 		settings.XAI_API_KEY ||
    // 		character.settings?.secrets?.OPENAI_API_KEY ||
    // 		settings.OPENAI_API_KEY
    // 	);
    case ModelProviderName.ANTHROPIC:
      return (
        character.settings?.secrets?.ANTHROPIC_API_KEY ||
        character.settings?.secrets?.CLAUDE_API_KEY ||
        settings.ANTHROPIC_API_KEY ||
        settings.CLAUDE_API_KEY
      )
    case ModelProviderName.REDPILL:
      return character.settings?.secrets?.REDPILL_API_KEY || settings.REDPILL_API_KEY
    case ModelProviderName.OPENROUTER:
      return character.settings?.secrets?.OPENROUTER || settings.OPENROUTER_API_KEY
    case ModelProviderName.GROK:
      return character.settings?.secrets?.GROK_API_KEY || settings.GROK_API_KEY
    case ModelProviderName.HEURIST:
      return character.settings?.secrets?.HEURIST_API_KEY || settings.HEURIST_API_KEY
    case ModelProviderName.GROQ:
      return character.settings?.secrets?.GROQ_API_KEY || settings.GROQ_API_KEY
    case ModelProviderName.GALADRIEL:
      return character.settings?.secrets?.GALADRIEL_API_KEY || settings.GALADRIEL_API_KEY
    case ModelProviderName.FAL:
      return character.settings?.secrets?.FAL_API_KEY || settings.FAL_API_KEY
    case ModelProviderName.ALI_BAILIAN:
      return (
        character.settings?.secrets?.ALI_BAILIAN_API_KEY || settings.ALI_BAILIAN_API_KEY
      )
    case ModelProviderName.VOLENGINE:
      return character.settings?.secrets?.VOLENGINE_API_KEY || settings.VOLENGINE_API_KEY
  }
}

function initializeDatabase(dataDir: string) {
  if (
    // biome-ignore lint/correctness/noConstantCondition: <explanation>
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.RAILWAY_ENVIRONMENT_NAME === 'production' &&
    // TODO: Remove this once we have a production database (postgres || supabase adapter)
    false
  ) {
    elizaLogger.info('Initializing Supabase connection...')
    const db = new SupabaseAdapterV2(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    // console.log('db', db)
    // Test the connection
    db.init()
      .then(() => {
        elizaLogger.success('Successfully connected to PostgreSQL database')
      })
      .catch((error) => {
        elizaLogger.error('Failed to connect to PostgreSQL:', error)
      })

    return db
  }
  const filePath = process.env.SQLITE_FILE ?? path.resolve(dataDir, 'db.sqlite')
  // ":memory:";
  const db = new SqliteDatabaseAdapter(new Database(filePath))
  return db
}

export async function initializeClients(character: Character, runtime: IAgentRuntime) {
  const clients = []
  console.log('Character clients:', character)
  const clientTypes = character.clients?.map((str) => str.toLowerCase()) || []
  console.log('Client types:', clientTypes)
  if (clientTypes.includes('auto')) {
    const autoClient = await AutoClientInterface.start(runtime)
    if (autoClient) clients.push(autoClient)
  }

  if (clientTypes.includes('discord')) {
    clients.push(await DiscordClientInterface.start(runtime))
  }

  if (clientTypes.includes('telegram')) {
    const telegramClient = await TelegramClientInterface.start(runtime)
    if (telegramClient) clients.push(telegramClient)
  }

  if (clientTypes.includes('farcaster')) {
    console.log('Starting Farcaster client')
    const farcasterClients = new FarcasterAgentClient(runtime)
    farcasterClients.start()
    clients.push(farcasterClients)
  }

  if (clientTypes.includes('twitter')) {
    console.log('Starting Twitter client')
    const twitterClients = await TwitterClientInterface.start(runtime)
    clients.push(twitterClients)
  }

  if (character.plugins?.length > 0) {
    for (const plugin of character.plugins) {
      if (plugin.clients) {
        for (const client of plugin.clients) {
          clients.push(await client.start(runtime))
        }
      }
    }
  }

  return clients
}

function getSecret(character: Character, secret: string) {
  return character.settings.secrets?.[secret] || process.env[secret]
}

let nodePlugin: any | undefined

export function createAgent(
  character: Character,
  db: IDatabaseAdapter,
  cache: ICacheManager,
  token: string
) {
  elizaLogger.success(
    elizaLogger.successesTitle,
    'Creating runtime for character',
    character.name
  )

  nodePlugin ??= createNodePlugin()

  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      // getSecret(character, "CONFLUX_CORE_PRIVATE_KEY") ? confluxPlugin : null,
      nodePlugin,
      getSecret(character, 'SOLANA_PUBLIC_KEY') ||
      // (getSecret(character, "WALLET_PUBLIC_KEY") &&
      // 	!getSecret(character, "WALLET_PUBLIC_KEY")?.startsWith("0x"))
      // 	? solanaPlugin
      // 	: null,
      getSecret(character, 'EVM_PRIVATE_KEY') ||
      // (getSecret(character, "WALLET_PUBLIC_KEY") &&
      // 	!getSecret(character, "WALLET_PUBLIC_KEY")?.startsWith("0x"))
      // 	? evmPlugin
      // 	: null,
      // getSecret(character, "ZEROG_PRIVATE_KEY") ? zgPlugin : null,
      // getSecret(character, "COINBASE_COMMERCE_KEY")
      // 	? coinbaseCommercePlugin
      // 	: null,
      getSecret(character, 'FAL_API_KEY') ||
      getSecret(character, 'OPENAI_API_KEY') ||
      getSecret(character, 'HEURIST_API_KEY')
        ? imageGenerationPlugin
        : null,
      // ...(getSecret(character, "COINBASE_API_KEY") &&
      // getSecret(character, "COINBASE_PRIVATE_KEY")
      // 	? [coinbaseMassPaymentsPlugin, tradePlugin]
      // 	: []),
      // getSecret(character, "WALLET_SECRET_SALT") ? teePlugin : null,
      // getSecret(character, "ALCHEMY_API_KEY") ? goatPlugin : null,
    ].filter(Boolean),
    providers: [],
    actions: [tipUserAction],
    services: [],
    managers: [],
    cacheManager: cache,
  })
}

function intializeFsCache(baseDir: string, character: Character) {
  const cacheDir = path.resolve(baseDir, character.id, 'cache')

  const cache = new CacheManager(new FsCacheAdapter(cacheDir))
  return cache
}

function intializeDbCache(character: Character, db: IDatabaseCacheAdapter) {
  const cache = new CacheManager(new DbCacheAdapter(db, character.id))
  return cache
}

async function startAgent(character: Character, directClient) {
  let db: IDatabaseAdapter & IDatabaseCacheAdapter
  try {
    character.id ??= stringToUuid(character.name)
    character.username ??= character.name

    const token = getTokenForProvider(character.modelProvider, character)
    const dataDir = path.join(__dirname, '../data')

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    db = initializeDatabase(dataDir) as IDatabaseAdapter & IDatabaseCacheAdapter

    await db.init()

    // TODO: Add cache
    const cache = intializeDbCache(character, db)
    const runtime = createAgent(character, db, cache, token)

    await runtime.initialize()

    const clients = await initializeClients(character, runtime)

    directClient.registerAgent(runtime)

    return clients
  } catch (error) {
    elizaLogger.error(`Error starting agent for character ${character.name}:`, error)
    console.error(error)
    if (db) {
      await db.close()
    }
    throw error
  }
}

export const startAgents = async () => {
  const directClient = await DirectClientInterface.start()

  // Directly load characters from Supabase
  // const characterData = await getPersonaByFid(893055)
  const charactersData = await getPersonasByFids([897311, 897281, 897284])
  const characters = charactersData?.map((char) => char.eliza_character) ?? [
    defaultCharacter,
  ]
  // const character = characterData?.eliza_character as unknown as Character
  // console.log('Character:', character)
  // const characters = [character ?? defaultCharacter] // Replace with Supabase loading logic

  try {
    for (const character of characters) {
      await startAgent(character, directClient)
    }
  } catch (error) {
    elizaLogger.error('Error starting agents:', error)
  }
}

startAgents().catch((error) => {
  elizaLogger.error('Unhandled error in startAgents:', error)
  process.exit(1)
})

export const tipUserAction: Action = {
  name: 'TIP_USER',
  similes: ['GIVE_TIP', 'REWARD_USER'],
  description: 'Tips users based on the positivity of their messages.',

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    // Simple positivity check (replace with actual sentiment analysis)
    const positiveWords = ['great', 'awesome', 'fantastic', 'good']
    const messageText = (message.content as any).text.toLowerCase()
    return positiveWords.some((word) => messageText.includes(word))
  },

  handler: async (runtime: IAgentRuntime, message: Memory) => {
    runtime.messageManager.createMemory({
      content: {
        text: "Thank you for your positive message! You've been tipped $5.00.",
      },
      userId: message.userId,
      agentId: message.agentId,
      roomId: message.roomId,
    })
    // Calculate tip amount based on positivity (simplified logic)
    const tipAmount = Math.random() * 10 // Random tip for demonstration

    // Append tip message to the response
    const response = `Thank you for your positive message! You've been tipped $${tipAmount.toFixed(2)}.`

    // Assuming the agent sends a response on Twitter/Farcaster
    const platformResponse = `${message.content.text}\n\n${response}`

    // Send the response (pseudo-code, replace with actual API call)
    // await runtime.documentsManager.

    // return true;
  },

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
}
