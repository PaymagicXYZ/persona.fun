export interface UserResponse {
  id: number;
  display_name: string;
  address: string;
  created_at: any;
  is_existing: boolean;
  token: string;
  background_gradient: string;
  pfp_url?: string;
  verificationToken?: string;
}
