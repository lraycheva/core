import { DesktopAgent } from "@finos/fdc3";

export type IntentsAPI = Pick<
  DesktopAgent,
  "open" | "findIntent" | "findIntentsByContext" | "raiseIntent" | "raiseIntentForContext" | "addIntentListener" | "getInfo"
> & {
};
