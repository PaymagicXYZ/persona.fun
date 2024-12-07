import { SupabaseDatabaseAdapter } from '@ai16z/adapter-supabase'
import type { UUID } from '@ai16z/eliza'
import { v4 as uuid } from "uuid";

export class SupabaseAdapterV2 extends SupabaseDatabaseAdapter {
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
    roomId = roomId ?? (uuid() as UUID);
    const { data, error } = await this.supabase.rpc("create_room", {
        roomId,
    });

    if (error) {
        throw new Error(`Error creating room: ${error.message}`);
    }

    if (!data || data.length === 0) {
        throw new Error("No data returned from room creation");
    }

    return data[0].id as UUID;
}
}
