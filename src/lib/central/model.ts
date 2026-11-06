// Modelo de dados da Central de Produtos. Arquivo puro (sem I/O) para poder
// ser usado em telas, PDFs e testes.

import type { BaseDoc } from "./store/types";

/* ------------------------------------------------------------------ */
/* Estados de decisão                                                  */
/* ------------------------------------------------------------------ */

export type DecisionStatus = "pendente" | "hipotese" | "decidido" | "testado" | "validado";

export const DECISION_STATUS: Record<DecisionStatus, { label: string; help: string; tone: string }> = {
  pendente: { label: "Pendente", help: "Informação ou ação ainda não concluída.", tone: "gray" },
  hipotese: { label: "Hipótese", help: "Proposta que ainda será confrontada com uso, compra ou dados.", tone: "amber" },
  decidido: { label: "Decidido", help: "Escolha feita; pode ainda precisar de teste.", tone: "blue" },
  testado: { label: "Testado", help: "Passou por um teste registrado (método, período e resultado).", tone: "violet" },
  validado: {
    label: "Validado no contexto",
    help: "Conclusão delimitada por fonte, público, período, método, amostra, resultado e limitações.",
    tone: "green",
  },
};

export interface ValidationRecord {
  fonte: string;
  publico: string;
  periodo: string;
  metodo: string;
  amostra: string;
  resultado: string;
  limitacoes: string;
}

export const VALIDATION_FIELDS: { key: keyof ValidationRecord; label: string; placeholder: string }[] = [
  { key: "fonte", label: "Fonte", placeholder: "De onde vem a informação (entrevistas, pedidos da Cakto...)" },
  { key: "publico", label: "Público", placeholder: "Quem participou ou comprou" },
  { key: "periodo", label: "Período", placeholder: "Ex.: 10/11 a 20/11/2026" },
  { key: "metodo", label: "Método", placeholder: "Como foi verificado" },
  { key: "amostra", label: "Amostra / denominador", placeholder: "Ex.: 4 de 5 participantes; 3 compras em 120 visitas" },
  { key: "resultado", label: "Resultado", placeholder: "O que foi observado" },
  { key: "limitacoes", label: "Limitações", placeholder: "O que não dá para concluir" },
];

const TESTED_REQUIRED: (keyof ValidationRecord)[] = ["metodo", "periodo", "resultado"];

// Regra central: "testado" e "validado" exigem registro. Pesquisa superficial
// ou nota dada por IA não bastam — o formulário obriga a dizer fonte,
// amostra e limitações.
export function checkDecisionStatus(
  status: DecisionStatus,
  validation: Partial<ValidationRecord> | undefined
): { ok: true } | { ok: false; missing: string[] } {
  const required =
    status === "validado"
      ? VALIDATION_FIELDS.map((f) => f.key)
      : status === "testado"
        ? TESTED_REQUIRED
        : [];
  const missing = required
    .filter((key) => !validation?.[key]?.trim())
    .map((key) => VALIDATION_FIELDS.find((f) => f.key === key)!.label);
  return missing.length ? { ok: false, missing } : { ok: true };
}

/* ------------------------------------------------------------------ */
/* Corpo do Produto                                                    */
/* ------------------------------------------------------------------ */

export interface BodyField {
  value: string;
  status: DecisionStatus;
  validation?: Partial<ValidationRecord>;
  updatedAt?: string;
}

export interface BodyFieldDef {
  key: string;
  label: string;
  group: string;
  help: string;
  placeholder: string;
}

export const BODY_GROUPS = [
  "Identidade",
  "Público e problema",
  "Solução e entrega",
  "Oferta",
  "Venda e teste",
] as const;

export const BODY_FIELDS: BodyFieldDef[] = [
  { key: "formato", group: "Identidade", label: "Formato", help: "O que o comprador recebe, em uma frase.", placeholder: "Ex.: PDF com instruções, exemplos e prompts copiáveis; sem aulas" },
  { key: "publico", group: "Público e problema", label: "Público (quem compra)", help: "Quem decide e paga.", placeholder: "Ex.: dono de pequena lanchonete" },
  { key: "usuarioFinal", group: "Público e problema", label: "Usuário final (quem usa)", help: "Pode ser diferente de quem compra.", placeholder: "Ex.: dono ou funcionário que faz a divulgação" },
  { key: "problema", group: "Público e problema", label: "Problema observável", help: "Uma tarefa concreta e a dificuldade vista na rotina, não uma área ampla.", placeholder: "Ex.: preparar a imagem da promoção do dia com foto do próprio lanche" },
  { key: "alternativas", group: "Público e problema", label: "Alternativas atuais", help: "Como a pessoa resolve hoje e quanto custa cada caminho.", placeholder: "Editor, funcionário, designer, reaproveitar peças, deixar de postar..." },
  { key: "solucao", group: "Solução e entrega", label: "Solução", help: "O processo que o produto ensina e o resultado delimitado.", placeholder: "Processo em passos para..." },
  { key: "entregaveis", group: "Solução e entrega", label: "Entregáveis", help: "Lista do que é entregue ao comprador. Um item por linha.", placeholder: "Guia em PDF\nAnexo de prompts" },
  { key: "requisitos", group: "Solução e entrega", label: "Requisitos do comprador", help: "Ferramentas, acessos e custos adicionais que o comprador precisa ter.", placeholder: "Ex.: ferramenta de IA de imagem (alguns planos são pagos), editor simples" },
  { key: "promessa", group: "Oferta", label: "Promessa (em linguagem do comprador)", help: "O que a pessoa aprende ou consegue fazer. Sem prometer vendas ou tempo sem evidência.", placeholder: "Aprenda a..." },
  { key: "limites", group: "Oferta", label: "Limites (o que não inclui)", help: "Evita expectativa errada e reembolso.", placeholder: "Não inclui artes prontas, gestão de anúncios..." },
  { key: "preco", group: "Oferta", label: "Preço", help: "Valor e condições. Use o painel financeiro para a conta.", placeholder: "A definir" },
  { key: "custos", group: "Oferta", label: "Custos", help: "Taxas, tributos, entrega, suporte, reembolsos.", placeholder: "A apurar" },
  { key: "suporte", group: "Oferta", label: "Suporte", help: "Canal, prazo de resposta e escopo.", placeholder: "A definir" },
  { key: "canais", group: "Venda e teste", label: "Canais de aquisição", help: "Por onde as pessoas vão conhecer o produto.", placeholder: "Ex.: anúncios Meta, indicação" },
  { key: "funil", group: "Venda e teste", label: "Funil (caminho de compra)", help: "Do primeiro contato ao acesso ao material.", placeholder: "Anúncio → página → checkout → acesso → suporte" },
  { key: "planoTeste", group: "Venda e teste", label: "Plano de teste", help: "Pergunta, método, limite de gasto e critério de parada.", placeholder: "Pergunta: ... Método: ... Limite: ..." },
];

export function emptyBody(): Record<string, BodyField> {
  return Object.fromEntries(BODY_FIELDS.map((f) => [f.key, { value: "", status: "pendente" as DecisionStatus }]));
}

/* ------------------------------------------------------------------ */
/* Mapa da operação                                                    */
/* ------------------------------------------------------------------ */

export type StageKey =
  | "publico_problema"
  | "evidencia_amostra"
  | "oferta"
  | "produto"
  | "pagina_checkout"
  | "entrega"
  | "medicao"
  | "anuncios"
  | "diagnostico"
  | "crescimento";

export type StageStatus = "nao_iniciado" | "em_andamento" | "concluido" | "bloqueado";

export const STAGE_STATUS: Record<StageStatus, string> = {
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  bloqueado: "Bloqueado",
};

export interface ChecklistItemDef {
  id: string;
  text: string;
  /** "teste real" diferencia, por exemplo, "cadastrado" de "testado como comprador". */
  kind?: "cadastro" | "teste_real";
}

export interface StageDef {
  key: StageKey;
  label: string;
  short: string;
  help: { oQueE: string; quandoUsar: string; oQuePreparar: string; comoAvaliar: string };
  insumos: string[];
  entregas: string[];
  dependencias: StageKey[];
  checklist: ChecklistItemDef[];
}

export const STAGES: StageDef[] = [
  {
    key: "publico_problema",
    label: "Público e problema",
    short: "Público",
    help: {
      oQueE: "Descobrir quem executa a tarefa, em que situação e com quais recursos.",
      quandoUsar: "Antes de produzir qualquer material.",
      oQuePreparar: "Lista de 3 a 5 pessoas do público para conversar e exemplos reais do trabalho delas.",
      comoAvaliar: "Você consegue descrever uma tarefa delimitada e a dificuldade observada, com exemplos.",
    },
    insumos: ["Contatos do público", "Exemplos recentes do trabalho"],
    entregas: ["Descrição do público e do problema observável"],
    dependencias: [],
    checklist: [
      { id: "pp1", text: "Conversei com pessoas que fazem a tarefa (não só opinião sobre a ideia)" },
      { id: "pp2", text: "Vi exemplos reais e recentes do trabalho" },
      { id: "pp3", text: "Alternativas atuais e seus custos registrados" },
    ],
  },
  {
    key: "evidencia_amostra",
    label: "Evidência e amostra",
    short: "Evidência",
    help: {
      oQueE: "Testar uma entrega pequena antes do produto inteiro.",
      quandoUsar: "Depois de entender o problema, antes de produzir o material completo.",
      oQuePreparar: "Um exercício curto e uma orientação de uma página.",
      comoAvaliar: "A pessoa entende, executa e aceita usar o resultado sem você conduzir cada passo.",
    },
    insumos: ["Amostra do método", "Roteiro de teste"],
    entregas: ["Registro do teste de aplicação (tentativas, dúvidas, intervenções)"],
    dependencias: ["publico_problema"],
    checklist: [
      { id: "ea1", text: "Amostra aplicada por alguém do público", kind: "teste_real" },
      { id: "ea2", text: "Dúvidas e intervenções registradas" },
      { id: "ea3", text: "Sinal de compra concreto registrado (não só “eu compraria”)" },
    ],
  },
  {
    key: "oferta",
    label: "Oferta",
    short: "Oferta",
    help: {
      oQueE: "Explicar resultado, formato, requisitos, limites, preço e suporte.",
      quandoUsar: "Quando há uma tarefa delimitada e uma amostra aplicável.",
      oQuePreparar: "Ficha de uma página e estimativa de custos.",
      comoAvaliar: "Um comprador entende público, resultado, entrega e limites sem você explicar.",
    },
    insumos: ["Corpo do Produto preenchido", "Estimativa de custos"],
    entregas: ["Ficha da oferta"],
    dependencias: ["evidencia_amostra"],
    checklist: [
      { id: "of1", text: "Promessa sem garantia de vendas ou de tempo sem evidência" },
      { id: "of2", text: "Requisitos e custos adicionais informados" },
      { id: "of3", text: "Preço com conta de margem feita" },
    ],
  },
  {
    key: "produto",
    label: "Produto (método e entregáveis)",
    short: "Produto",
    help: {
      oQueE: "Produzir o material que o cliente compra e testar se funciona com quem compra.",
      quandoUsar: "Depois de fechar o escopo da oferta.",
      oQuePreparar: "Referências reais, exemplos com direito de uso e prompts testados.",
      comoAvaliar: "Uma pessoa do público aplica o material sem sua intervenção constante.",
    },
    insumos: ["Escopo da oferta", "Referências e exemplos"],
    entregas: ["PDF revisado", "Anexos", "Exemplos com direitos de uso"],
    dependencias: ["oferta"],
    checklist: [
      { id: "pr1", text: "Prompts testados em ferramenta real (data, ferramenta, plano registrados)", kind: "teste_real" },
      { id: "pr2", text: "Exemplos com direitos de uso; demonstrações fictícias identificadas" },
      { id: "pr3", text: "PDF legível no celular, prompts copiáveis" },
      { id: "pr4", text: "Entregáveis aprovados com link do Drive anexado" },
    ],
  },
  {
    key: "pagina_checkout",
    label: "Página e checkout",
    short: "Página",
    help: {
      oQueE: "Apresentar a oferta e receber o pagamento por um caminho confiável.",
      quandoUsar: "Quando produto e oferta estão definidos.",
      oQuePreparar: "Textos, demonstração, preço, link de checkout.",
      comoAvaliar: "Página, checkout e arquivo contam a mesma promessa; tudo funciona no celular.",
    },
    insumos: ["Ficha da oferta", "Demonstração", "Imagens"],
    entregas: ["Página revisada", "Link de checkout correto"],
    dependencias: ["produto"],
    checklist: [
      { id: "pc1", text: "Produto e oferta cadastrados na plataforma de pagamento", kind: "cadastro" },
      { id: "pc2", text: "Nome público alinhado (página, cobrança, arquivo)" },
      { id: "pc3", text: "Página revisada no celular (botões, preço, requisitos)" },
      { id: "pc4", text: "Checkout testado como comprador", kind: "teste_real" },
    ],
  },
  {
    key: "entrega",
    label: "Entrega",
    short: "Entrega",
    help: {
      oQueE: "Garantir que o comprador recebe e abre o material.",
      quandoUsar: "Antes de qualquer venda real.",
      oQuePreparar: "Arquivo final, mensagem de acesso, canal de suporte.",
      comoAvaliar: "O comprador de teste recebe e abre o arquivo — marcar opção no painel não basta.",
    },
    insumos: ["Arquivo final", "Configuração de entrega"],
    entregas: ["Fluxo de entrega e suporte testado"],
    dependencias: ["pagina_checkout"],
    checklist: [
      { id: "en1", text: "Entrega configurada no painel", kind: "cadastro" },
      { id: "en2", text: "Comprador de teste recebeu e abriu o arquivo no celular", kind: "teste_real" },
      { id: "en3", text: "Canal e prazo de suporte informados" },
    ],
  },
  {
    key: "medicao",
    label: "Medição",
    short: "Medição",
    help: {
      oQueE: "Registrar visitas, checkouts e pagamentos aprovados de forma confiável.",
      quandoUsar: "Antes de colocar dinheiro em anúncios.",
      oQuePreparar: "Pixel/eventos, UTMs padronizadas, pedido de teste.",
      comoAvaliar: "Pagamento aprovado não é confundido com Pix gerado; pedido de teste aparece nos relatórios.",
    },
    insumos: ["Página publicada", "Checkout"],
    entregas: ["Eventos testados", "Padrão de UTM"],
    dependencias: ["entrega"],
    checklist: [
      { id: "me1", text: "Eventos de compra disparam só em pagamento aprovado", kind: "teste_real" },
      { id: "me2", text: "Receptor de webhook testado (válido, inválido, repetido)", kind: "teste_real" },
      { id: "me3", text: "UTMs atravessam até o checkout" },
    ],
  },
  {
    key: "anuncios",
    label: "Anúncios",
    short: "Anúncios",
    help: {
      oQueE: "Teste pago pequeno, com hipótese, limite e critério de parada.",
      quandoUsar: "Com margem calculada, medição testada e teto de verba combinado.",
      oQuePreparar: "Hipótese de mensagem, 2 criativos, teto total, CPA alvo.",
      comoAvaliar: "O teste termina com conclusão registrada — inclusive “inconclusivo”.",
    },
    insumos: ["Criativos aprovados", "CPA alvo", "Teto de verba autorizado"],
    entregas: ["Plano de teste registrado", "Rascunho de campanha"],
    dependencias: ["medicao"],
    checklist: [
      { id: "an1", text: "Teto total de verba e responsável combinados" },
      { id: "an2", text: "Hipótese e critério de parada registrados" },
      { id: "an3", text: "Criativos mostram o produto real, sem promessa de venda" },
    ],
  },
  {
    key: "diagnostico",
    label: "Diagnóstico",
    short: "Diagnóstico",
    help: {
      oQueE: "Ler os dados por etapa do funil antes de mudar algo.",
      quandoUsar: "Ao fechar um ciclo de teste.",
      oQuePreparar: "Dados alinhados por período e fuso; pagamentos reconciliados.",
      comoAvaliar: "Hipótese específica para o ponto onde houve perda.",
    },
    insumos: ["Relatório Meta", "Pagamentos Cakto", "Custos"],
    entregas: ["Relatório por etapa", "Registro de decisão"],
    dependencias: ["anuncios"],
    checklist: [
      { id: "di1", text: "Período, fuso e atribuição alinhados" },
      { id: "di2", text: "Pagamentos aprovados, pendentes e reembolsos separados" },
      { id: "di3", text: "Decisão registrada (pode ser inconclusiva)" },
    ],
  },
  {
    key: "crescimento",
    label: "Crescimento",
    short: "Crescimento",
    help: {
      oQueE: "Aumentar de forma controlada quando margem, caixa e entrega suportam.",
      quandoUsar: "Só depois de medição confiável e margem positiva observada.",
      oQuePreparar: "Histórico, margem real, caixa disponível (não saldo a receber).",
      comoAvaliar: "Contribuição adicional maior que gasto adicional.",
    },
    insumos: ["Histórico de ciclos", "Margem observada"],
    entregas: ["Plano de aumento controlado"],
    dependencias: ["diagnostico"],
    checklist: [
      { id: "cr1", text: "Mais que uma venda isolada, incerteza compreendida" },
      { id: "cr2", text: "Caixa disponível para anúncios antes do recebimento" },
      { id: "cr3", text: "Entrega e suporte aguentam o novo volume" },
    ],
  },
];

export const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s) => [s.key, s])) as Record<StageKey, StageDef>;

export interface StageState {
  status: StageStatus;
  responsavel: string;
  evidenciaConclusao: string;
  checklist: Record<string, boolean>;
  notas: string;
}

export function emptyStages(): Record<StageKey, StageState> {
  return Object.fromEntries(
    STAGES.map((s) => [
      s.key,
      { status: "nao_iniciado", responsavel: "", evidenciaConclusao: "", checklist: {}, notas: "" },
    ])
  ) as Record<StageKey, StageState>;
}

/* ------------------------------------------------------------------ */
/* Finanças                                                            */
/* ------------------------------------------------------------------ */

/** null = desconhecido. Nunca preencher com número que pareça real. */
export interface FinanceInputs {
  preco: number | null;
  taxaPercentual: number | null;
  taxaFixa: number | null;
  tributosPercentual: number | null;
  custoVariavel: number | null;
  reembolsoPercentual: number | null;
  contribuicaoDesejada: number | null;
  custosFixosMensais: number | null;
  gastoAnuncios: number | null;
  comprasAprovadas: number | null;
  receitaAprovada: number | null;
  reembolsosValor: number | null;
  saldoAReceber: number | null;
  caixaDisponivel: number | null;
  periodo: string;
  fonteDados: string;
}

export function emptyFinance(): FinanceInputs {
  return {
    preco: null,
    taxaPercentual: null,
    taxaFixa: null,
    tributosPercentual: null,
    custoVariavel: null,
    reembolsoPercentual: null,
    contribuicaoDesejada: null,
    custosFixosMensais: null,
    gastoAnuncios: null,
    comprasAprovadas: null,
    receitaAprovada: null,
    reembolsosValor: null,
    saldoAReceber: null,
    caixaDisponivel: null,
    periodo: "",
    fonteDados: "",
  };
}

/* ------------------------------------------------------------------ */
/* Página e checkout                                                   */
/* ------------------------------------------------------------------ */

export type SalesPath = "indefinido" | "pagina_enxuta" | "checkout_direto" | "conversa";

export const SALES_PATHS: Record<SalesPath, { label: string; when: string }> = {
  indefinido: { label: "Ainda não escolhido", when: "" },
  pagina_enxuta: {
    label: "Página enxuta + checkout",
    when: "O comprador precisa entender o método antes de pagar (ex.: distinguir guia de serviço).",
  },
  checkout_direto: {
    label: "Checkout direto",
    when: "O público já entende a oferta e o anúncio explica o necessário. Menos etapas não garante mais compras.",
  },
  conversa: {
    label: "Venda por conversa",
    when: "Para aprender objeções e acompanhar os primeiros usos. Registre o esforço: não prova que a página venderia sozinha.",
  },
};

export const PAGE_CHECKS: { id: string; text: string }[] = [
  { id: "celular", text: "Lida no celular: textos, botões e imagens sem corte" },
  { id: "links", text: "Links de checkout e confirmação verificados" },
  { id: "texto", text: "Texto revisado, sem promessa de vendas, urgência ou depoimento inventado" },
  { id: "requisitos", text: "Requisitos e custos adicionais visíveis antes da compra" },
  { id: "preco", text: "Preço igual na página, no checkout e no Corpo do Produto" },
  { id: "entrega", text: "Forma de entrega e suporte coerentes com o que está configurado" },
];

export interface PageCheckout {
  caminho: SalesPath;
  justificativa: string;
  caminhoStatus: DecisionStatus;
  titulo: string;
  subtitulo: string;
  secoes: string;
  demonstracao: string;
  faq: string;
  checkoutUrl: string;
  confirmacaoUrl: string;
  plataforma: string;
  cadastroObservado: string;
  cadastroConfirmado: boolean;
  checks: Record<string, { ok: boolean; at?: string }>;
}

export function emptyPage(): PageCheckout {
  return {
    caminho: "indefinido",
    justificativa: "",
    caminhoStatus: "pendente",
    titulo: "",
    subtitulo: "",
    secoes: "",
    demonstracao: "",
    faq: "",
    checkoutUrl: "",
    confirmacaoUrl: "",
    plataforma: "",
    cadastroObservado: "",
    cadastroConfirmado: false,
    checks: {},
  };
}

/* ------------------------------------------------------------------ */
/* Entregável (PDF vendido)                                            */
/* ------------------------------------------------------------------ */

export interface DeliverableSection {
  id: string;
  kicker: string;
  title: string;
  body: string;
  steps: string;
  prompt: string;
  promptLabel: string;
  checklist: string;
  table: string;
  note: string;
  noteTone: "dica" | "atencao";
  imageFileId: string;
  imageCaption: string;
}

export interface DeliverableDoc {
  title: string;
  subtitle: string;
  versionLabel: string;
  disclaimer: string;
  sections: DeliverableSection[];
}

export function emptySection(id: string): DeliverableSection {
  return {
    id,
    kicker: "",
    title: "Nova seção",
    body: "",
    steps: "",
    prompt: "",
    promptLabel: "",
    checklist: "",
    table: "",
    note: "",
    noteTone: "dica",
    imageFileId: "",
    imageCaption: "",
  };
}

/* ------------------------------------------------------------------ */
/* Documentos persistidos                                              */
/* ------------------------------------------------------------------ */

export interface ProductDoc extends BaseDoc {
  name: string;
  niche: string;
  versionLabel: string;
  responsaveis: string;
  descricao: string;
  /** Dados fictícios de demonstração nunca se misturam a dados reais. */
  dadosFicticios: boolean;
  currentStage: StageKey;
  body: Record<string, BodyField>;
  stages: Record<StageKey, StageState>;
  finance: FinanceInputs;
  page: PageCheckout;
  deliverable: DeliverableDoc;
  drive: { folderId?: string; folderUrl?: string; folderName?: string; owner?: string; checkedAt?: string };
  archived?: boolean;
}

export type EvidenceKind =
  | "entrevista"
  | "teste_uso"
  | "compra"
  | "dados"
  | "relato_terceiro"
  | "pesquisa_superficial"
  | "pontuacao_ia";

export const EVIDENCE_KINDS: Record<EvidenceKind, { label: string; strength: string; provesDemand: boolean }> = {
  entrevista: { label: "Conversa / entrevista", strength: "Ajuda a compreender o problema", provesDemand: false },
  teste_uso: { label: "Teste de uso", strength: "Verifica se a pessoa consegue aplicar", provesDemand: false },
  compra: { label: "Compra ou compromisso concreto", strength: "Verifica disposição de pagar", provesDemand: true },
  dados: { label: "Dados documentados", strength: "Sustentam o resultado naquele contexto", provesDemand: false },
  relato_terceiro: { label: "Relato de terceiro", strength: "Inspiração a investigar", provesDemand: false },
  pesquisa_superficial: { label: "Pesquisa superficial", strength: "Não comprova demanda", provesDemand: false },
  pontuacao_ia: { label: "Pontuação gerada por IA", strength: "Não comprova demanda", provesDemand: false },
};

export interface EvidenceDoc extends BaseDoc, Partial<ValidationRecord> {
  title: string;
  kind: EvidenceKind;
  fieldKeys: string[];
  ficticio: boolean;
}

export type TaskStatus = "a_fazer" | "fazendo" | "feito";

export interface TaskDoc extends BaseDoc {
  stageKey: StageKey;
  title: string;
  responsavel: string;
  status: TaskStatus;
  dependsOn: string[];
  evidencia: string;
  order: number;
}

export interface VersionDoc extends BaseDoc {
  number: number;
  label: string;
  note: string;
  snapshot: { product: ProductDoc; evidences: EvidenceDoc[]; tasks: TaskDoc[] };
}

export type FileCategory =
  | "referencia"
  | "imagem_original"
  | "prompt"
  | "versao_gerada"
  | "criativo_aprovado"
  | "arquivo_final"
  | "documento_interno";

export const FILE_CATEGORIES: Record<FileCategory, { label: string; help: string }> = {
  referencia: { label: "Referências", help: "Documentação, exemplos de terceiros, pesquisas." },
  imagem_original: { label: "Imagens originais", help: "Fotos reais, logo. Nunca são sobrescritas." },
  prompt: { label: "Prompts", help: "Textos de prompt usados ou testados." },
  versao_gerada: { label: "Versões geradas", help: "Resultados de geração ou edição, ainda não aprovados." },
  criativo_aprovado: { label: "Criativos aprovados", help: "Peças aprovadas para uso." },
  arquivo_final: { label: "Entregáveis (arquivos finais)", help: "O que o comprador recebe." },
  documento_interno: { label: "Documentos internos", help: "Corpo do Produto, planos, relatórios." },
};

export type Material = "guia_geral" | "corpo_produto" | "entregavel" | "outro";

export const MATERIALS: Record<Material, string> = {
  guia_geral: "Guia geral de operação",
  corpo_produto: "Corpo do Produto (interno)",
  entregavel: "Entregável vendido",
  outro: "Outro",
};

export type ApprovalStatus = "rascunho" | "em_revisao" | "aprovado" | "reprovado";

export const APPROVAL: Record<ApprovalStatus, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

export interface LinkCheck {
  status: "nao_verificado" | "ok" | "quebrado" | "erro";
  httpStatus?: number;
  message?: string;
  checkedAt?: string;
}

export interface FileDoc extends BaseDoc {
  name: string;
  kind: "arquivo" | "link";
  category: FileCategory;
  material: Material;
  approval: ApprovalStatus;
  version: string;
  origin: string;
  storageKey?: string;
  contentType?: string;
  size?: number;
  url?: string;
  linkCheck?: LinkCheck;
  /** Link do Google Drive. "verificado" só quando a integração confirmou o arquivo. */
  drive?: {
    url: string;
    source: "manual" | "integracao";
    fileId?: string;
    verifiedAt?: string;
    owner?: string;
    permission?: string;
    error?: string;
  };
  notes: string;
  ficticio: boolean;
}

export type CreativeOperation = "geracao" | "edicao" | "montagem" | "exportacao";

export const CREATIVE_OPERATIONS: Record<CreativeOperation, string> = {
  geracao: "Geração de imagem (nova)",
  edicao: "Edição de imagem existente",
  montagem: "Montagem de texto e logo (editor)",
  exportacao: "Exportação",
};

export interface CreativeAttempt {
  id: string;
  operation: CreativeOperation;
  fileId: string;
  prompt: string;
  provedor: string;
  modelo: string;
  data: string;
  custo: string;
  placeholder: boolean;
  observacao: string;
}

export interface CreativeDoc extends BaseDoc {
  conceito: string;
  mensagem: string;
  publico: string;
  formato: string;
  variante: string;
  direitosUso: string;
  hipotese: string;
  briefing: { referencias: string; texto: string; restricoes: string };
  referenceFileIds: string[];
  attempts: CreativeAttempt[];
  review: Record<string, boolean>;
  reviewStatus: ApprovalStatus;
  approvedAttemptId: string;
  demonstracaoFicticia: boolean;
}

export const CREATIVE_REVIEW: { id: string; text: string }[] = [
  { id: "ingredientes", text: "Ingredientes e porção iguais ao produto real" },
  { id: "texto", text: "Texto e preço corretos (finalizados em editor)" },
  { id: "logo", text: "Logo original, sem deformação" },
  { id: "promessa", text: "Sem promessa de venda, escassez ou depoimento inventado" },
  { id: "legivel", text: "Legível no celular" },
  { id: "direitos", text: "Direitos de uso das imagens conferidos" },
];

export interface ExperimentDoc extends BaseDoc {
  pergunta: string;
  hipotese: string;
  metodo: string;
  limite: string;
  criterioParada: string;
  periodo: string;
  resultado: string;
  conclusao: "em_andamento" | "confirmada" | "refutada" | "inconclusiva";
  proximoPasso: string;
}

export interface CaseDoc extends BaseDoc {
  titulo: string;
  fonte: string;
  contexto: string;
  intervencao: string;
  comparacao: string;
  periodo: string;
  custos: string;
  resultado: string;
  limitacoes: string;
  transferencia: string;
  nivel: "relato_terceiro" | "dados_documentados" | "teste_controlado" | "reproducao_local";
  statusLocal: "hipotese_local" | "testado_localmente" | "inconclusivo";
}

export interface HistoryDoc extends BaseDoc {
  action: string;
  detail: string;
}
