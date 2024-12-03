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
      personas: {
        Row: {
          created_at: string
          fc_profile: Json | null
          fid: number
          id: number
          image_url: string | null
          name: string
          personality: string
          private_key: string | null
          signer_uuid: string
          token_id: number | null
        }
        Insert: {
          created_at?: string
          fc_profile?: Json | null
          fid: number
          id?: number
          image_url?: string | null
          name: string
          personality: string
          private_key?: string | null
          signer_uuid: string
          token_id?: number | null
        }
        Update: {
          created_at?: string
          fc_profile?: Json | null
          fid?: number
          id?: number
          image_url?: string | null
          name?: string
          personality?: string
          private_key?: string | null
          signer_uuid?: string
          token_id?: number | null
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
      tokens: {
        Row: {
          address: string
          base_scan_url: string
          chain_id: number
          created_at: string
          delete_amount: string
          dex_screener_url: string
          id: number
          image_url: string | null
          name: string
          post_amount: string
          promote_amount: string
          supply: number
          symbol: string
        }
        Insert: {
          address: string
          base_scan_url: string
          chain_id?: number
          created_at?: string
          delete_amount?: string
          dex_screener_url: string
          id?: number
          image_url?: string | null
          name: string
          post_amount?: string
          promote_amount?: string
          supply?: number
          symbol: string
        }
        Update: {
          address?: string
          base_scan_url?: string
          chain_id?: number
          created_at?: string
          delete_amount?: string
          dex_screener_url?: string
          id?: number
          image_url?: string | null
          name?: string
          post_amount?: string
          promote_amount?: string
          supply?: number
          symbol?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
          token_id: number
          token_created_at: string
          token_address: string
          token_name: string
          token_symbol: string
          token_supply: number
          token_image_url: string
          token_chain_id: number
          token_post_amount: string
          token_promote_amount: string
          token_delete_amount: string
          token_base_scan_url: string
          token_dex_screener_url: string
        }[]
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
