import type { ThemeRegistration } from "shiki";

export const devlogTheme: ThemeRegistration = {
  name: "devlog-theme",
  type: "dark",
  bg: "#1c1c21",
  fg: "#e8e8f0",
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#55556a",
        fontStyle: "italic",
      },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier", "entity.name.tag"],
      settings: {
        foreground: "#c9762f",
      },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: {
        foreground: "#4ade80",
      },
    },
    {
      scope: ["constant.numeric", "number", "constant.language", "boolean"],
      settings: {
        foreground: "#f4c542",
      },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: {
        foreground: "#8ab4f8",
      },
    },
    {
      scope: ["punctuation", "delimiter", "keyword.operator"],
      settings: {
        foreground: "#8888a4",
      },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
      settings: {
        foreground: "#5b9bd9",
      },
    },
    {
      scope: ["variable", "identifier"],
      settings: {
        foreground: "#e8e8f0",
      },
    },
  ],
};
