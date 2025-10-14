import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUserFromReq } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const user = await getSessionUserFromReq(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  return res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
