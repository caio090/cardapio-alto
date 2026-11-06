// Importação inicial do Criador PNG a partir do "Corpo do Produto v1"
// (5/11/2026) e do guia em PDF v0.1. Estados copiados do documento:
// nada aqui está validado — não há vendas, testes de uso nem campanhas.

import { blankProduct, newId, now } from "./factory";
import {
  emptySection,
  type BodyField,
  type DecisionStatus,
  type DeliverableSection,
  type ProductDoc,
  type StageKey,
  type TaskDoc,
} from "./model";

const f = (value: string, status: DecisionStatus): BodyField => ({ value, status, updatedAt: now() });

function section(p: Partial<DeliverableSection>): DeliverableSection {
  return { ...emptySection(newId()), ...p };
}

export function buildCriadorPng(): { product: ProductDoc; tasks: TaskDoc[] } {
  const product = blankProduct("Criador PNG", "Pequenas lanchonetes · imagens de divulgação");
  product.versionLabel = "1";
  product.descricao =
    "PDF com instruções, exemplos e prompts copiáveis para o dono ou a equipe de pequenas lanchonetes preparar imagens de lanches e promoções do dia a dia. Sem aulas.";
  product.currentStage = "produto";

  product.body = {
    formato: f("PDF com instruções, exemplos e prompts copiáveis; sem aulas", "decidido"),
    publico: f("Dono ou equipe de pequena lanchonete que prepara a própria divulgação", "decidido"),
    usuarioFinal: f("Dono ou funcionário que prepara as postagens do dia a dia", "decidido"),
    problema: f(
      "Preparar divulgação recorrente de lanches e promoções, com referências da própria empresa e revisão de qualidade. Falta de tempo e dificuldade de consistência são hipóteses iniciais; frequência, intensidade e disposição de compra precisam ser investigadas.",
      "hipotese"
    ),
    alternativas: f(
      "Editor de imagem, contratar serviço, delegar a funcionário, reutilizar peças antigas ou deixar de postar. Custos de cada caminho ainda não levantados.",
      "pendente"
    ),
    solucao: f(
      "Processo guiado: preparar referências → preencher orientação → gerar rascunho → revisar fidelidade → finalizar e publicar. Se a IA alterar o produto, preservar a foto real (recorte PNG) e gerar só o fundo; texto, preço e logo finalizados em editor.",
      "decidido"
    ),
    entregaveis: f("Guia em PDF\nAnexo de prompts copiáveis\nChecklist de revisão", "decidido"),
    requisitos: f(
      "Celular ou computador; ferramenta de IA que gere ou edite imagem a partir de foto (recursos e custos dependem do plano); editor de imagem simples; fotos reais dos lanches, logo e cores.",
      "decidido"
    ),
    promessa: f(
      "Aprenda a preparar imagens dos seus lanches e promoções com um guia em PDF, exemplos e prompts adaptáveis, usando suas fotos e referências de marca.",
      "hipotese"
    ),
    limites: f(
      "Não inclui gestão de tráfego, postagem automática, serviço individual de criação nem artes prontas. Cardápio é outra oferta possível no futuro. Sem garantia de vendas ou de economia de tempo.",
      "decidido"
    ),
    preco: f(
      "A definir. Observado na Cakto (leitura em 06/11/2026): cadastro “LKT PNG” ativo com oferta de R$ 19,90 — valor cadastrado, não confirmado como preço decidido.",
      "pendente"
    ),
    custos: f("Taxas da venda, tributos, entrega, suporte e provisão de reembolsos a apurar.", "pendente"),
    suporte: f("Canal, prazo e escopo a definir.", "pendente"),
    canais: f("Anúncios Meta ou indicação (hipótese inicial).", "hipotese"),
    funil: f(
      "Anúncio ou indicação → página enxuta → checkout Cakto → acesso ao PDF → aplicação e suporte. Funil proposto, ainda não usado.",
      "hipotese"
    ),
    planoTeste: f(
      "Ciclo 1: o dono entende guia × serviço? Consegue produzir uma peça utilizável com a amostra? Há disposição de pagar? A receita cobre custos e aquisição? Teste de uso com 3 a 5 pessoas antes de teste pago.",
      "pendente"
    ),
  };

  // As etapas anteriores NÃO são presumidas validadas.
  product.stages.publico_problema.notas = "Público decidido; problema ainda é hipótese — faltam conversas registradas.";
  product.stages.evidencia_amostra.notas = "Nenhum teste de uso registrado.";
  product.stages.oferta.notas = "Ficha da oferta em rascunho (produtos/criador-png/oferta.md). Preço e suporte pendentes.";
  product.stages.produto.status = "em_andamento";
  product.stages.produto.notas = "Guia v0.1 em rascunho. Prompts ainda não testados em ferramenta real.";
  product.stages.pagina_checkout.notas =
    "Leitura da Cakto em 06/11/2026: produto “LKT PNG” (id 60094297…) ativo, oferta qxyu3q2 R$ 19,90, 0 pedidos, categoria “Música e Artes”, descrição sobre direção de arte/moodboard — não coincide com o posicionamento atual. Nenhum webhook cadastrado via API. Confirmar qual cadastro usar antes de criar outro ou alterar algo.";
  product.stages.pagina_checkout.checklist = { pc1: true };

  product.page.plataforma = "Cakto";
  product.page.cadastroObservado = "LKT PNG";
  product.page.cadastroConfirmado = false;
  product.page.caminho = "pagina_enxuta";
  product.page.caminhoStatus = "hipotese";
  product.page.justificativa =
    "O público precisa distinguir um guia em PDF de um serviço de criação; a página mostra processo, exemplos, requisitos e preço antes do pagamento.";
  product.page.titulo = "Imagens dos seus lanches, com a cara da sua lanchonete.";
  product.page.subtitulo =
    "Um guia em PDF com processo passo a passo e prompts adaptáveis para preparar imagens de lanches e promoções usando suas próprias fotos e sua marca.";

  product.deliverable = {
    title: "Criador PNG",
    subtitle: "Como preparar imagens dos seus lanches e promoções usando suas fotos, sua marca e prompts adaptáveis.",
    versionLabel: "0.2 — edição de teste",
    disclaimer:
      "Material de orientação para executar. Não inclui artes prontas, design personalizado, gestão de anúncios nem garantia de vendas. Resultados variam conforme ferramenta, plano, fotos e aplicação.",
    sections: [
      section({
        kicker: "Comece aqui",
        title: "O que este guia faz por você",
        body: "Um processo de cinco passos para transformar a foto real de um lanche e as informações de uma promoção em uma imagem pronta para postar, com a cara da sua lanchonete.\n\nA IA ajuda a montar a imagem, mas pode errar ingredientes, letras e preços. Por isso há um passo inteiro de revisão.",
        steps: "Preparar referências\nDefinir a peça\nGerar rascunho\nRevisar fidelidade\nFinalizar e publicar",
        checklist:
          "Celular ou computador com internet\nFerramenta de IA que gere ou edite imagem a partir de foto (alguns planos são pagos)\nEditor de imagem simples\nFotos reais dos seus lanches",
        note: "Primeiro exercício: escolha um lanche e uma promoção real desta semana e siga o guia até o fim com esse único caso.",
        noteTone: "dica",
      }),
      section({
        kicker: "Capítulo 1",
        title: "Prepare suas referências",
        body: "A IA só consegue representar a sua lanchonete se você mostrar como ela é. Este banco de referências é feito uma vez.\n\n- Luz natural, perto de uma janela, sem flash direto\n- Fundo limpo: bancada lisa, tábua ou papel\n- O lanche inteiro no quadro, de frente ou levemente de cima\n- Monte como você entrega: mesma embalagem, mesma porção",
        table:
          "Campo | Exemplo\nNome no cardápio | X-Bacon da Casa\nIngredientes, de baixo para cima | pão, alface, hambúrguer 150 g, cheddar, bacon, molho, pão\nEmbalagem | papel kraft dobrado",
        note: "Com a lista exata de ingredientes, a IA tem menos espaço para inventar o que você não serve.",
        noteTone: "atencao",
      }),
      section({
        kicker: "Capítulo 2",
        title: "Defina a peça antes de pedir a imagem",
        table:
          "Decisão | Pergunta | Opções comuns\nCanal | Onde vai aparecer? | Feed, stories/status, app de entrega\nFormato | Qual proporção? | 4:5, 9:16, 1:1 (confira no app)\nProduto | Qual o protagonista? | Lanche, combo, porção\nObjetivo | O que a pessoa deve fazer? | Pedir hoje, conhecer novidade",
        note: "Uma peça, uma mensagem. Três promoções = três imagens.",
      }),
      section({
        kicker: "Capítulo 3",
        title: "Use o método: o prompt-base",
        body: "Rota A: envie a foto real e peça para melhorar cenário e luz, mantendo o lanche.\nRota B: recorte o lanche (PNG com fundo transparente), peça só o fundo e monte no editor — o lanche fica 100% original.",
        promptLabel: "PROMPT-BASE",
        prompt:
          "TAREFA: Crie uma imagem de divulgação para uma lanchonete, usando a foto enviada como referência principal do produto.\nPRODUTO (não alterar): [nome do lanche]. Ingredientes visíveis, de baixo para cima: [lista]. Mantenha exatamente estes ingredientes, a mesma quantidade, o mesmo pão e a mesma embalagem da foto. Não acrescente nenhum ingrediente.\nIDENTIDADE: Lanchonete [nome], estilo [estilo]. Cores: [cor 1] e [cor 2].\nCOMPOSIÇÃO: Lanche em destaque, cerca de metade da imagem, [posição]. Fundo [descrição]. Luz quente e natural, aparência realista.\nFORMATO: [4:5 / 9:16 / 1:1].\nESPAÇO PARA TEXTO: Deixe uma área livre [no topo / embaixo].\nRESTRIÇÕES: Não escreva textos, números ou preços. Não crie logotipos. Sem pessoas ou marcas. Aparência de foto real.",
      }),
      section({
        kicker: "Capítulo 4",
        title: "Revise e refine",
        body: "Uma imagem bonita que mostra outro lanche não serve. Revise com a foto original ao lado e peça uma correção por vez.",
        checklist:
          "Ingredientes iguais à ficha, nada a mais nem a menos\nPorção do mesmo tamanho\nPão e embalagem que você usa\nSem texto, número, preço ou logo inventado\nSem marcas de outras empresas\nEspaço livre para título e preço",
        promptLabel: "CORREÇÃO",
        prompt: "Remova [ingrediente] do lanche. Mantenha todo o resto exatamente igual: enquadramento, fundo, luz e os demais ingredientes.",
        note: "Se depois de 3 tentativas o lanche continuar diferente do real, mude para a Rota B.",
        noteTone: "atencao",
      }),
      section({
        kicker: "Capítulo 5",
        title: "Finalize e publique",
        body: "Texto, preço e logo vão no editor, não na IA.\n\n- Título curto, até 5 palavras\n- Preço em destaque; preço antigo menor e riscado\n- Logo original (PNG) sempre no mesmo canto\n- Chamada com o canal de pedido",
        checklist: "Abrir no celular no tamanho real\nLer o preço em voz alta e conferir com o caixa\nConferir data e condição da promoção\nSalvar com nome e data",
      }),
      section({
        kicker: "Exemplo completo",
        title: "Do zero à peça final (exemplo didático)",
        body: "Exemplo com uma lanchonete fictícia (“Lanchonete Exemplo”). Nomes, preços e produto são ilustrativos e não representam um negócio real.",
        table:
          "Item | Valor do exemplo\nLanche | Cheeseburger: pão com gergelim, hambúrguer, 2 fatias de queijo prato, cebola roxa, molho\nPeça | Promoção do dia, feed 4:5\nOferta | de R$ 24 por R$ 19, só hoje (valores fictícios)",
        note: "Imagens de antes e depois serão inseridas após testar o método com usuários. Até lá, nenhuma imagem é apresentada como resultado.",
        noteTone: "atencao",
      }),
      section({
        kicker: "Resolva problemas",
        title: "Quando a IA erra",
        table:
          "Problema | O que fazer\nLanche genérico | Reenvie a foto como referência principal; se persistir, Rota B\nIngrediente a mais | Liste de baixo para cima e use o prompt de correção\nTexto ou preço errado | Peça sem texto e escreva no editor\nLogo deformado | Nunca peça o logo à IA; cole o arquivo original\nAparência artificial | Peça menos brilho e aparência de foto real",
      }),
    ],
  };

  const t = now();
  const task = (stageKey: StageKey, title: string, order: number, status: TaskDoc["status"] = "a_fazer"): TaskDoc => ({
    id: newId(),
    productId: product.id,
    createdAt: t,
    updatedAt: t,
    stageKey,
    title,
    responsavel: "",
    status,
    dependsOn: [],
    evidencia: "",
    order,
  });

  const tasks: TaskDoc[] = [
    task("publico_problema", "Conversar com 3 a 5 donos de lanchonete usando o roteiro de descoberta", 1),
    task("evidencia_amostra", "Teste de aplicação da amostra (cap. 3 e 4) com promoção real", 2),
    task("produto", "Testar prompt-base e Rota B em ferramenta real e registrar data, ferramenta e plano", 3),
    task("produto", "Inserir imagens reais de antes e depois no exemplo (com permissão de uso)", 4),
    task("produto", "Revisar o PDF no celular e conferir prompts copiáveis", 5),
    task("oferta", "Fechar preço, suporte e requisitos com custos reais", 6),
    task("pagina_checkout", "Confirmar qual cadastro da Cakto usar (observado: LKT PNG) antes de criar ou alterar", 7),
    task("entrega", "Teste completo como comprador: pagamento, acesso e abertura do PDF no celular", 8),
    task("medicao", "Configurar e testar medição; separar Pix gerado de pagamento aprovado", 9),
    task("anuncios", "Definir teto de verba, responsável e critério de parada", 10),
  ];
  // dependências simples: o teste do PDF depende dos prompts testados
  tasks[4].dependsOn = [tasks[2].id];
  tasks[7].dependsOn = [tasks[6].id];

  return { product, tasks };
}
