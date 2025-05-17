// pages/api/products/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import {
  listProducts,
  createProduct,
} from "../../../controllers/productController";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return listProducts(req, res);

    case "POST":
      return createProduct(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
