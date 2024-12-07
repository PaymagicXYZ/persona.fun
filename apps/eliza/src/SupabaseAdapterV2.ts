import { SupabaseDatabaseAdapter } from '@ai16z/adapter-supabase'
import type { UUID } from '@ai16z/eliza'
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
        .from("participants")
        .insert({ id: uuid(), userId: userId, roomId: roomId });

    if (error) {
        console.error(`Error adding participant: ${error.message}`);
        return false;
    }
    return true;
}
}
