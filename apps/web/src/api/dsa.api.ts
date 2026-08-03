import { client } from "./client";

export const dsaApi = {
  getStats: () => client.get("/dsa/statistics").then((r) => r.data),
};
