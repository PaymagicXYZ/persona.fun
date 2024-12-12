import { TokenResponse } from "./tokens";

export type Persona = {
  id: number;
  name: string;
  fid: number;
  image_url: string;
  shape_image_url: string;
  fc_url: string;
  x_url: string;
  token?: TokenResponse;
  post_count: number;
};
