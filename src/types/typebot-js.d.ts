// @typebot.io/js ships no type declarations. Minimal ambient shim so the
// dynamic import in DiagnosticEmbed type-checks.
declare module "@typebot.io/js/web" {
  interface TypebotStandardOptions {
    typebot: string;
    prefilledVariables?: Record<string, string>;
  }

  interface TypebotApi {
    initStandard(options: TypebotStandardOptions): void;
  }

  const Typebot: TypebotApi;
  export default Typebot;
}
