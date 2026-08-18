// Typebot "Diagnóstico Cardápio Alto" — usado dentro de /diagnostico via
// embed Standard (@typebot.io/js). A URL completa fica aqui só de referência;
// o embed usa apenas o slug.
export const TYPEBOT_URL = "https://typebot.co/diagn-stico-card-pio-alto-u8npp5o";
export const TYPEBOT_SLUG = "diagn-stico-card-pio-alto-u8npp5o";

// Rota interna planejada (embed do Typebot) — ainda não construída.
// Nenhuma seção da landing deve apontar pra ela diretamente enquanto isso;
// usar DIAGNOSTIC_HREF abaixo, que sempre resolve pra um destino real.
export const DIAGNOSTIC_ROUTE = "/diagnostico";

// Enquanto /diagnostico não existir, todo CTA de diagnóstico vai direto
// pro Typebot externo (nova aba) em vez de cair num link quebrado.
// Trocar para DIAGNOSTIC_ROUTE assim que o embed estiver no ar — é o
// único lugar que precisa mudar (ver <DiagnosticCTA />).
export const DIAGNOSTIC_HREF = TYPEBOT_URL;
export const DIAGNOSTIC_IS_EXTERNAL = true;

// WhatsApp real do Cardápio Alto — canal de contato direto, separado do
// fluxo de diagnóstico (que continua exclusivamente pelo Typebot).
export const WHATSAPP_URL =
  "https://wa.me/5589994584163?text=Ol%C3%A1%21%20Conheci%20o%20Card%C3%A1pio%20Alto%20e%20quero%20saber%20mais%20sobre%20a%20an%C3%A1lise%20de%20delivery";
