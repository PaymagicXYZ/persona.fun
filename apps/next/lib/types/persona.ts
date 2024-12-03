export type Persona = {
  id: number;
  name: string;
  fid: string;
  image_url: string;
  token?: {
    id: number;
    address: string;
    name: string;
    symbol: string;
    supply: number;
    post_amount: number;
    delete_amount: number;
    promote_amount: number;
    base_scan_url: string;
    dex_screener_url: string;
  };
};
