/* services/productService.ts */
import * as model from "@/models/productModel";

export async function listProducts() {
  return model.findAllProducts();
}

export async function getProduct(id: string) {
  const product = await model.findProductById(id);
  if (!product) throw new Error("Product not found");
  return product;
}
