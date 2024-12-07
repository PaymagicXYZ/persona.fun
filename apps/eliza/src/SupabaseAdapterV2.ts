import { SupabaseDatabaseAdapter } from '@ai16z/adapter-supabase'
import type { UUID } from '@ai16z/eliza'

export class SupabaseAdapterV2 extends SupabaseDatabaseAdapter {
  async getRoom(roomId: UUID): Promise<UUID | null> {
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
}
