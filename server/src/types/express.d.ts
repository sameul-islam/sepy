declare global {
  namespace Express {
    interface Locals {
      validatedData: {
        body: unknown;
        params: unknown;
        query: unknown;
      };
    }
  }
}

export {};