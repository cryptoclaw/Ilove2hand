// types/next-connect/index.d.ts
import type { NextApiRequest, NextApiResponse } from "next";

declare function nextConnect<
  Req = NextApiRequest,
  Res = NextApiResponse
>(opts?: {
  onError?: (err: Error, req: Req, res: Res) => void;
  onNoMatch?: (req: Req, res: Res) => void;
}): any;

export default nextConnect;
