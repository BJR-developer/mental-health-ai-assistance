export interface Message {
  text: string;
  sender: "user" | "ai";
}

export enum Language {
  English = "en",
  Bengali = "bn",
}
