import { client } from "./client";
import { detectTimezone } from "../lib/timezone";

export const authApi = {
  profile: () => client.get("/auth/profile").then((r) => r.data),
  login: (dto: { email?: string; identifier?: string; password: string }) =>
    client
      .post("/auth/login", {
        identifier: dto.identifier ?? dto.email,
        password: dto.password,
        timezone: detectTimezone(),
      })
      .then((r) => r.data),
  logout: () => client.post("/auth/logout").then((r) => r.data),
  register: (dto: any) =>
    client.post("/auth/register", dto).then((r) => r.data),
};
