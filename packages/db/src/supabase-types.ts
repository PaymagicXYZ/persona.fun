export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          avatarUrl: string | null
          createdAt: string | null
          details: Json | null
          email: string
          id: string
          name: string | null
          username: string | null
        }
        Insert: {
          avatarUrl?: string | null
          createdAt?: string | null
          details?: Json | null
          email: string
          id: string
          name?: string | null
          username?: string | null
        }
        Update: {
          avatarUrl?: string | null
          createdAt?: string | null
          details?: Json | null
          email?: string
          id?: string
          name?: string | null
          username?: string | null
        }
        Relationships: []
      }
      cache: {
        Row: {
          agentId: string
          createdAt: string | null
          expiresAt: string | null
          key: string
          value: Json | null
        }
        Insert: {
          agentId: string
          createdAt?: string | null
          expiresAt?: string | null
          key: string
          value?: Json | null
        }
        Update: {
          agentId?: string
          createdAt?: string | null
          expiresAt?: string | null
          key?: string
          value?: Json | null
        }
        Relationships: []
      }
      chat: {
        Row: {
          background_gradient: string
          created_at: string
          display_name: string
          id: number
          message: string
          persona_fid: number
          pfp_url: string | null
          user_id: number
        }
        Insert: {
          background_gradient?: string
          created_at?: string
          display_name?: string
          id?: number
          message: string
          persona_fid: number
          pfp_url?: string | null
          user_id: number
        }
        Update: {
          background_gradient?: string
          created_at?: string
          display_name?: string
          id?: number
          message?: string
          persona_fid?: number
          pfp_url?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "chat_persona_id_fkey"
            columns: ["persona_fid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["fid"]
          },
          {
            foreignKeyName: "chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          createdAt: string | null
          description: string | null
          id: string
          name: string | null
          objectives: Json
          roomId: string | null
          status: string | null
          userId: string | null
        }
        Insert: {
          createdAt?: string | null
          description?: string | null
          id: string
          name?: string | null
          objectives?: Json
          roomId?: string | null
          status?: string | null
          userId?: string | null
        }
        Update: {
          createdAt?: string | null
          description?: string | null
          id?: string
          name?: string | null
          objectives?: Json
          roomId?: string | null
          status?: string | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_room"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          body: Json
          createdAt: string | null
          id: string
          roomId: string
          type: string
          userId: string
        }
        Insert: {
          body: Json
          createdAt?: string | null
          id?: string
          roomId: string
          type: string
          userId: string
        }
        Update: {
          body?: Json
          createdAt?: string | null
          id?: string
          roomId?: string
          type?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_room"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      memories_1024: {
        Row: {
          agentId: string | null
          content: Json
          createdAt: string | null
          embedding: string | null
          id: string
          roomId: string | null
          type: string
          unique: boolean
          userId: string | null
        }
        Insert: {
          agentId?: string | null
          content: Json
          createdAt?: string | null
          embedding?: string | null
          id: string
          roomId?: string | null
          type: string
          unique?: boolean
          userId?: string | null
        }
        Update: {
          agentId?: string | null
          content?: Json
          createdAt?: string | null
          embedding?: string | null
          id?: string
          roomId?: string | null
          type?: string
          unique?: boolean
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent"
            columns: ["agentId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_1024_agentId_fkey"
            columns: ["agentId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_1024_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_1024_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      memories_1536: {
        Row: {
          agentId: string | null
          content: Json
          createdAt: string | null
          embedding: string | null
          id: string
          roomId: string | null
          type: string
          unique: boolean
          userId: string | null
        }
        Insert: {
          agentId?: string | null
          content: Json
          createdAt?: string | null
          embedding?: string | null
          id: string
          roomId?: string | null
          type: string
          unique?: boolean
          userId?: string | null
        }
        Update: {
          agentId?: string | null
          content?: Json
          createdAt?: string | null
          embedding?: string | null
          id?: string
          roomId?: string | null
          type?: string
          unique?: boolean
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent"
            columns: ["agentId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_1536_agentId_fkey"
            columns: ["agentId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_1536_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_1536_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      memories_384: {
        Row: {
          agentId: string | null
          content: Json
          createdAt: string | null
          embedding: string | null
          id: string
          roomId: string | null
          type: string
          unique: boolean
          userId: string | null
        }
        Insert: {
          agentId?: string | null
          content: Json
          createdAt?: string | null
          embedding?: string | null
          id: string
          roomId?: string | null
          type: string
          unique?: boolean
          userId?: string | null
        }
        Update: {
          agentId?: string | null
          content?: Json
          createdAt?: string | null
          embedding?: string | null
          id?: string
          roomId?: string | null
          type?: string
          unique?: boolean
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent"
            columns: ["agentId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_384_agentId_fkey"
            columns: ["agentId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_384_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_384_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          createdAt: string | null
          id: string
          last_message_read: string | null
          roomId: string | null
          userId: string | null
          userState: string | null
        }
        Insert: {
          createdAt?: string | null
          id: string
          last_message_read?: string | null
          roomId?: string | null
          userId?: string | null
          userState?: string | null
        }
        Update: {
          createdAt?: string | null
          id?: string
          last_message_read?: string | null
          roomId?: string | null
          userId?: string | null
          userState?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_room"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          created_at: string
          eliza_character: Json | null
          fc_profile: Json | null
          fc_url: string | null
          fid: number
          id: number
          image_url: string | null
          is_visible: boolean
          name: string
          personality: string
          private_key: string | null
          shape_image_url: string | null
          signer_uuid: string
          social_pfp_url: string | null
          token_id: number | null
          x_credentials: Json | null
          x_url: string | null
        }
        Insert: {
          created_at?: string
          eliza_character?: Json | null
          fc_profile?: Json | null
          fc_url?: string | null
          fid: number
          id?: number
          image_url?: string | null
          is_visible?: boolean
          name: string
          personality: string
          private_key?: string | null
          shape_image_url?: string | null
          signer_uuid: string
          social_pfp_url?: string | null
          token_id?: number | null
          x_credentials?: Json | null
          x_url?: string | null
        }
        Update: {
          created_at?: string
          eliza_character?: Json | null
          fc_profile?: Json | null
          fc_url?: string | null
          fid?: number
          id?: number
          image_url?: string | null
          is_visible?: boolean
          name?: string
          personality?: string
          private_key?: string | null
          shape_image_url?: string | null
          signer_uuid?: string
          social_pfp_url?: string | null
          token_id?: number | null
          x_credentials?: Json | null
          x_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personas_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      post_mapping: {
        Row: {
          best_of_hash: string | null
          cast_hash: string
          created_at: string
          tweet_id: string | null
        }
        Insert: {
          best_of_hash?: string | null
          cast_hash: string
          created_at?: string
          tweet_id?: string | null
        }
        Update: {
          best_of_hash?: string | null
          cast_hash?: string
          created_at?: string
          tweet_id?: string | null
        }
        Relationships: []
      }
      post_reveal: {
        Row: {
          address: string | null
          cast_hash: string
          created_at: string
          reveal_hash: string | null
          reveal_phrase: string | null
          signature: string | null
        }
        Insert: {
          address?: string | null
          cast_hash: string
          created_at?: string
          reveal_hash?: string | null
          reveal_phrase?: string | null
          signature?: string | null
        }
        Update: {
          address?: string | null
          cast_hash?: string
          created_at?: string
          reveal_hash?: string | null
          reveal_phrase?: string | null
          signature?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          created_at: string
          id: number
          persona_id: number
          platform: string
          post: Json | null
          social_post_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          persona_id: number
          platform: string
          post?: Json | null
          social_post_id: string
        }
        Update: {
          created_at?: string
          id?: number
          persona_id?: number
          platform?: string
          post?: Json | null
          social_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          createdAt: string | null
          id: string
          status: string | null
          userA: string
          userB: string
          userId: string
        }
        Insert: {
          createdAt?: string | null
          id: string
          status?: string | null
          userA: string
          userB: string
          userId: string
        }
        Update: {
          createdAt?: string | null
          id?: string
          status?: string | null
          userA?: string
          userB?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_a"
            columns: ["userA"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_b"
            columns: ["userB"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_userA_fkey"
            columns: ["userA"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_userB_fkey"
            columns: ["userB"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          createdAt: string | null
          id: string
        }
        Insert: {
          createdAt?: string | null
          id: string
        }
        Update: {
          createdAt?: string | null
          id?: string
        }
        Relationships: []
      }
      tokens: {
        Row: {
          address: string
          base_scan_url: string
          chain_id: number
          created_at: string
          decimals: number
          delete_amount: string
          dex_screener_url: string
          id: number
          image_url: string | null
          name: string
          pair_address: string | null
          post_amount: string
          promote_amount: string
          supply: string
          symbol: string
          uniswap_url: string | null
        }
        Insert: {
          address: string
          base_scan_url: string
          chain_id?: number
          created_at?: string
          decimals?: number
          delete_amount?: string
          dex_screener_url: string
          id?: number
          image_url?: string | null
          name: string
          pair_address?: string | null
          post_amount?: string
          promote_amount?: string
          supply: string
          symbol: string
          uniswap_url?: string | null
        }
        Update: {
          address?: string
          base_scan_url?: string
          chain_id?: number
          created_at?: string
          decimals?: number
          delete_amount?: string
          dex_screener_url?: string
          id?: number
          image_url?: string | null
          name?: string
          pair_address?: string | null
          post_amount?: string
          promote_amount?: string
          supply?: string
          symbol?: string
          uniswap_url?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string
          background_gradient: string
          created_at: string
          display_name: string
          id: number
          pfp_url: string | null
        }
        Insert: {
          address: string
          background_gradient?: string
          created_at?: string
          display_name: string
          id?: number
          pfp_url?: string | null
        }
        Update: {
          address?: string
          background_gradient?: string
          created_at?: string
          display_name?: string
          id?: number
          pfp_url?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      memories: {
        Row: {
          agentId: string | null
          content: Json | null
          createdAt: string | null
          embedding: string | null
          id: string | null
          roomId: string | null
          type: string | null
          unique: boolean | null
          userId: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          agentId: string | null
          content: Json | null
          createdAt: string | null
          embedding: string | null
          id: string | null
          roomId: string | null
          type: string | null
          unique: boolean | null
          userId: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_similarity_and_insert: {
        Args: {
          query_table_name: string
          query_userId: string
          query_content: Json
          query_roomId: string
          query_embedding: string
          similarity_threshold: number
          query_createdAt: string
        }
        Returns: undefined
      }
      count_memories: {
        Args: {
          query_table_name: string
          query_roomId: string
          query_unique?: boolean
        }
        Returns: number
      }
      create_room: {
        Args: {
          room_id: string
        }
        Returns: {
          id: string
        }[]
      }
      get_embedding_dimension: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_embedding_list: {
        Args: {
          query_table_name: string
          query_threshold: number
          query_input: string
          query_field_name: string
          query_field_sub_name: string
          query_match_count: number
        }
        Returns: {
          embedding: string
          levenshtein_score: number
        }[]
      }
      get_goals: {
        Args: {
          query_room_id: string
          query_user_id?: string
          only_in_progress?: boolean
          row_count?: number
        }
        Returns: {
          createdAt: string | null
          description: string | null
          id: string
          name: string | null
          objectives: Json
          roomId: string | null
          status: string | null
          userId: string | null
        }[]
      }
      get_participant_userState: {
        Args: {
          roomId: string
          userId: string
        }
        Returns: string
      }
      get_persona_by_token_address: {
        Args: {
          search_address: string
        }
        Returns: {
          persona_id: number
          persona_created_at: string
          persona_name: string
          persona_image_url: string
          persona_fid: number
          persona_signer_uuid: string
          persona_personality: string
          persona_token_id: number
          persona_fc_profile: Json
          persona_fc_url: string
          persona_x_url: string
          token_id: number
          token_created_at: string
          token_address: string
          token_name: string
          token_symbol: string
          token_supply: string
          token_image_url: string
          token_chain_id: number
          token_post_amount: string
          token_promote_amount: string
          token_delete_amount: string
          token_base_scan_url: string
          token_dex_screener_url: string
          token_uniswap_url: string
        }[]
      }
      get_persona_post_count: {
        Args: {
          persona_id: number
        }
        Returns: number
      }
      get_relationship: {
        Args: {
          usera: string
          userb: string
        }
        Returns: {
          createdAt: string | null
          id: string
          status: string | null
          userA: string
          userB: string
          userId: string
        }[]
      }
      remove_memories: {
        Args: {
          query_table_name: string
          query_roomId: string
        }
        Returns: undefined
      }
      search_memories: {
        Args: {
          query_table_name: string
          query_roomId: string
          query_embedding: string
          query_match_threshold: number
          query_match_count: number
          query_unique: boolean
        }
        Returns: {
          id: string
          userId: string
          content: Json
          createdAt: string
          similarity: number
          roomId: string
          embedding: string
        }[]
      }
      set_participant_userState: {
        Args: {
          roomId: string
          userId: string
          state: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
