import { TokenResponse } from "./tokens";

export type Persona = {
  id: number;
  name: string;
  fid: string;
  image_url: string;
  fc_url: string;
  x_url: string;
  token?: TokenResponse;
  post_count: number;
};
