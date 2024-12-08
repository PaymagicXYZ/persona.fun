import { SupabaseDatabaseAdapter } from '@ai16z/adapter-supabase'
import { elizaLogger, type Goal, type UUID } from '@ai16z/eliza'
import { v4 as uuid } from 'uuid'

export class SupabaseAdapterV2 extends SupabaseDatabaseAdapter {
  constructor(url: string, key: string) {
    super(url, key)
  }

  async getRoom(roomId: UUID): Promise<UUID | null> {
    if (!roomId) {
      return null
    }

    const { data, error } = await this.supabase
      .from('rooms')
      .select('id')
      .eq('id', roomId)
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(`Error getting room: ${error.message}`)
    }

    return data ? (data.id as UUID) : null
  }

  async createRoom(roomId?: UUID): Promise<UUID> {
    roomId = roomId || (uuid() as UUID)
    console.log('Creating room', roomId)
    console.log('supabase instance', this.supabase.schema('public'))
    const { data, error } = await this.supabase.rpc('create_room', {
      room_id: roomId,
    })

    if (error) {
      throw new Error(`Error creating room: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from room creation')
    }

    return data[0].id as UUID
  }

  async addParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
    const { error } = await this.supabase
      .from('participants')
      .insert({ id: uuid(), userId: userId, roomId: roomId })

    if (error) {
      console.error(`Error adding participant: ${error.message}`)
      return false
    }
    return true
  }

  async getGoals(params: {
    roomId: UUID
    userId?: UUID | null
    onlyInProgress?: boolean
    count?: number
  }): Promise<Goal[]> {
    const opts = {
      query_room_id: params.roomId,
      query_user_id: params.userId,
      only_in_progress: params.onlyInProgress,
      row_count: params.count,
    }

    const { data: goals, error } = await this.supabase.rpc('get_goals', opts)

    if (error) {
      throw new Error(error.message)
    }

    return goals
  }

  async setCache(params: {
    key: string;
    agentId: UUID;
    value: string;
  }): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('cache')
        .upsert(
          {
            key: params.key,
            agentId: params.agentId,
            value: params.value,
            createdAt: new Date().toISOString()
          },
          {
            onConflict: 'key,agentId'
          }
        );

      if (error) {
        elizaLogger.error("Error setting cache", {
          error: error.message,
          key: params.key,
          agentId: params.agentId,
        });
        return false;
      }

      return true;
    } catch (error) {
      elizaLogger.error("Supabase error in setCache", {
        error: error instanceof Error ? error.message : String(error),
        key: params.key,
        agentId: params.agentId,
      });
      return false;
    }
  }

  async getCache(params: {
    key: string;
    agentId: UUID;
  }): Promise<string | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('cache')
        .select('value')
        .eq('key', params.key)
        .eq('agentId', params.agentId)
        .maybeSingle();

      if (error) {
        elizaLogger.error("Error fetching cache", {
          error: error.message,
          key: params.key,
          agentId: params.agentId,
        });
        return undefined;
      }

      return data?.value ?? undefined;
    } catch (error) {
      elizaLogger.error("Supabase error in getCache", {
        error: error instanceof Error ? error.message : String(error),
        key: params.key,
        agentId: params.agentId,
      });
      return undefined;
    }
  }

  async deleteCache(params: {
    key: string;
    agentId: UUID;
  }): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('cache')
        .delete()
        .eq('key', params.key)
        .eq('agentId', params.agentId);

      if (error) {
        elizaLogger.error("Error deleting cache", {
          error: error.message,
          key: params.key,
          agentId: params.agentId,
        });
        return false;
      }

      return true;
    } catch (error) {
      elizaLogger.error("Supabase error in deleteCache", {
        error: error instanceof Error ? error.message : String(error),
        key: params.key,
        agentId: params.agentId,
      });
      return false;
    }
  }
}
