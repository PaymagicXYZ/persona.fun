import { PostgresDatabaseAdapter } from '@ai16z/adapter-postgres'
import { SqliteDatabaseAdapter } from '@ai16z/adapter-sqlite'
import { AutoClientInterface } from '@ai16z/client-auto'
import { DirectClientInterface } from '@ai16z/client-direct'
import { DiscordClientInterface } from '@ai16z/client-discord'
import { TelegramClientInterface } from '@ai16z/client-telegram'
import { TwitterClientInterface } from '@ai16z/client-twitter'
import { FarcasterAgentClient } from '@ai16z/client-farcaster'
import {
  type Action,
  AgentRuntime,
  CacheManager,
  type Character,
  DbCacheAdapter,
  FsCacheAdapter,
  type IAgentRuntime,
  type ICacheManager,
  type IDatabaseAdapter,
  type Memory,
  type IDatabaseCacheAdapter,
  ModelProviderName,
  elizaLogger,
  settings,
  stringToUuid,
  validateCharacterConfig,
  ModelClass,
  type HandlerCallback,
  type State,
  composeContext,
  booleanFooter,
  messageCompletionFooter,
  generateTrueOrFalse,
  generateMessageResponse,
  type Content,
  type Plugin,
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
      tippingPlugin,
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

const maxTipsInARow = 1

const tipUserAction: Action = {
  name: 'TIP_USER',
  similes: ['GIVE_TIP', 'REWARD_USER'],
  description:
    "Should tip the user based on the positivity of the message. Use a random tim amount between 1 and 10000 which should be included in the generated message's footer",

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('Validating message: ', message)
    // Simple positivity check (replace with actual sentiment analysis)
    const recentMessagesData = await runtime.messageManager.getMemories({
      roomId: message.roomId,
      count: 1,
      unique: false,
    })
    const agentMessages = recentMessagesData.filter(
      (m: { userId: any }) => m.userId === runtime.agentId
    )

    // check if the last message was a tip
    if (agentMessages) {
      const lastMessages = agentMessages.slice(0, maxTipsInARow)
      if (lastMessages.length >= maxTipsInARow) {
        const allTips = lastMessages.every(
          (m: { content: any }) => (m.content as Content).action === 'TIP_USER'
        )
        if (allTips) {
          return false
        }
      }
    }
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('Validating message: ', message)
    return true
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ) => {
    console.log('🎯 TipUserAction handler started:', {
      messageId: message.id,
      userId: message.userId,
    })

    if (!state) {
      console.log('⚠️ No state provided, composing new state')
      state = (await runtime.composeState(message)) as State
    }

    state = await runtime.updateRecentMessageState(state)
    console.log('📝 Updated state with recent messages:', {
      messageCount: state.recentMessagesData?.length,
    })

    async function _shouldContinue(state: State): Promise<boolean> {
      console.log('🤔 Checking if should continue with tip')
      const shouldRespondContext = composeContext({
        state,
        template: shouldContinueTemplate,
      })

      const response = await generateTrueOrFalse({
        context: shouldRespondContext,
        modelClass: ModelClass.SMALL,
        runtime,
      })
      console.log('✅ Should continue decision:', response)
      return response
    }

    const shouldContinue = await _shouldContinue(state)
    if (!shouldContinue) {
      elizaLogger.log('Not elaborating, returning')
      return
    }

    console.log('💬 Generating tip response')
    const context = composeContext({
      state,
      template:
        runtime.character.templates?.continueMessageHandlerTemplate ||
        runtime.character.templates?.messageHandlerTemplate ||
        messageHandlerTemplate,
    })
    const { userId, roomId } = message

    const response = await generateMessageResponse({
      runtime,
      context,
      modelClass: ModelClass.LARGE,
    })
    console.log('💡 Generated response:', {
      action: response.action,
      hasText: !!response.text,
    })

    response.inReplyTo = message.id

    runtime.databaseAdapter.log({
      body: { message, context, response },
      userId,
      roomId,
      type: 'TIP_USER',
    })
    console.log('📝 Logged action to database:', { type: 'TIP_USER', userId, roomId })

    // prevent repetition
    const messageExists = state.recentMessagesData
      .filter((m: { userId: any }) => m.userId === runtime.agentId)
      .slice(0, maxTipsInARow + 1)
      .some((m: { content: any }) => m.content === message.content)

    if (messageExists) {
      console.log('⚠️ Message already exists, skipping response')
      return
    }

    console.log('🚀 Executing callback with response')
    await callback(response)

    // if the action is TIP_USER, check if we are over maxTipsInARow
    if (response.action === 'TIP_USER') {
      console.log('🔍 Checking tip frequency limits')
      const agentMessages = state.recentMessagesData
        .filter((m: { userId: any }) => m.userId === runtime.agentId)
        .map((m: { content: any }) => (m.content as Content).action)

      const lastMessages = agentMessages.slice(0, maxTipsInARow)
      console.log('📊 Recent tip history:', {
        recentTipCount: lastMessages.length,
        maxAllowed: maxTipsInARow,
      })

      if (lastMessages.length >= maxTipsInARow) {
        const allContinues = lastMessages.every(
          (m: string | undefined) => m === 'TIP_USER'
        )
        if (allContinues) {
          console.log('⛔ Max consecutive tips reached, nullifying action')
          response.action = null
        }
      }
    }

    console.log('✅ Handler completed successfully:', {
      finalAction: response.action,
      messageId: message.id,
    })
    return response
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

export const messageHandlerTemplate =
  // {{goals}}
  `# Action Examples
{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}
{{knowledge}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions: Write the next message for {{agentName}} indicating the tipped amount from 1 to 1000 (randomly).
` + messageCompletionFooter

export const shouldContinueTemplate =
  `# Task: Decide if {{agentName}} should tip the user based on the positivity of the message.

{{agentName}} is brief, and doesn't want to be annoying. {{agentName}} will only tip if the message is positive.

Based on the following conversation, should {{agentName}} tip the user? YES or NO

{{recentMessages}}

Should {{agentName}} tip the user? ` + booleanFooter

const tippingPlugin: Plugin = {
  name: 'tipping',
  description: 'Agent tipping with basic actions and evaluators',
  actions: [tipUserAction],
  evaluators: [],
  providers: [],
}
