import { client } from "./client";

export const authApi = {
  profile: () => client.get("/auth/profile").then((r) => r.data),
  login: (dto: any) => client.post("/auth/login", dto).then((r) => r.data),
  logout: () => client.post("/auth/logout").then((r) => r.data),
  register: (dto: any) =>
    client.post("/auth/register", dto).then((r) => r.data),
};
