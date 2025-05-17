// pages/api/products.ts

import {
  createProduct,
  listProducts,
} from "../../controllers/productController";

export default async function handler(
  req: import("next").NextApiRequest,
  res: import("next").NextApiResponse
) {
  if (req.method === "GET") {
    return listProducts(req, res);
  }
  if (req.method === "POST") {
    return createProduct(req, res);
  }
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
