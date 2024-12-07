import { SupabaseDatabaseAdapter } from '@ai16z/adapter-supabase'
import type { UUID } from '@ai16z/eliza'

export class SupabaseAdapterV2 extends SupabaseDatabaseAdapter {
  getRoom(roomId: UUID): Promise<UUID | null> {
    return this.db
      .selectFrom('rooms')
      .select('id')
      .eq('id', roomId)
      .limit(1)
      .maybeSingle()
  }
}
