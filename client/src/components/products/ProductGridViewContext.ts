import { createContext } from "react";

export type ProductGridView = "comfortable" | "compact";

export const ProductGridViewContext =
  createContext<ProductGridView>("compact");