import { requireAdminSession } from "@/lib/admin/auth";
import { listCases } from "@/lib/central/repo";
import type { CaseDoc } from "@/lib/central/model";
import { Badge, Card, Empty, Flash, Help, inputCls, labelCls, readFlash, type SP } from "@/components/central/ui";
import { SubmitButton } from "@/components/central/submit-button";
import { saveCaseAction } from "../actions";

export const dynamic = "force-dynamic";

const NIVEL: Record<CaseDoc["nivel"], string> = {
  relato_terceiro: "Relato de terceiro — inspiração a investigar",
  dados_documentados: "Dados documentados — sustentam o resultado naquele contexto",
  teste_controlado: "Teste controlado — relação causal dentro das condições do teste",
  reproducao_local: "Reprodução no nosso produto",
};
const STATUS: Record<CaseDoc["statusLocal"], { label: string; tone: string }> = {
  hipotese_local: { label: "Hipótese local", tone: "amber" },
  testado_localmente: { label: "Testado localmente", tone: "green" },
  inconclusivo: { label: "Inconclusivo", tone: "gray" },
};

const FIELDS: [keyof CaseDoc, string, string][] = [
  ["fonte", "Fonte", "Autor, link, data e permissão"],
  ["contexto", "Contexto", "Nicho, público, preço, canal, maturidade"],
  ["intervencao", "Intervenção", "O que mudou, quando e com qual custo"],
  ["comparacao", "Comparação", "Contra o quê foi comparado"],
  ["periodo", "Período", ""],
  ["custos", "Custos", ""],
  ["resultado", "Resultado", "Métrica, denominador e valores"],
  ["limitacoes", "Limitações", "Sazonalidade, seleção, atribuição..."],
  ["transferencia", "Condições de transferência", "O que se parece com nosso produto e o que precisa de novo teste"],
];

function CaseForm({ c }: { c?: CaseDoc }) {
  return (
    <form action={saveCaseAction} className="mt-3 grid gap-2 sm:grid-cols-2">
      {c && <input type="hidden" name="id" value={c.id} />}
      {c && <input type="hidden" name="createdAt" value={c.createdAt} />}
      <div className="sm:col-span-2">
        <label className={labelCls}>Título</label>
        <input name="titulo" defaultValue={c?.titulo} required className={inputCls} />
      </div>
      {FIELDS.map(([k, label, ph]) => (
        <div key={k}>
          <label className={labelCls}>{label}</label>
          <input name={k} defaultValue={c ? String(c[k] ?? "") : ""} placeholder={ph} className={inputCls} />
        </div>
      ))}
      <div>
        <label className={labelCls}>Nível de evidência</label>
        <select name="nivel" defaultValue={c?.nivel ?? "relato_terceiro"} className={inputCls}>
          {Object.entries(NIVEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Situação no nosso contexto</label>
        <select name="statusLocal" defaultValue={c?.statusLocal ?? "hipotese_local"} className={inputCls}>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2"><SubmitButton>Salvar caso</SubmitButton></div>
    </form>
  );
}

export default async function CasosPage({ searchParams }: { searchParams: SP }) {
  await requireAdminSession();
  const { msg, err } = await readFlash(searchParams);
  const cases = await listCases();
  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Central de Produtos</p>
        <h1 className="mt-1 text-2xl font-bold">Casos e playbooks</h1>
      </div>
      <Flash msg={msg} err={err} />
      <Help
        label="Para que serve a biblioteca"
        oQueE="Registro de casos (seus e de terceiros) com contexto, resultado e limitações — não uma coleção de promessas de sucesso."
        quandoUsar="Quando encontrar uma estratégia que pode servir, e ao fechar seus próprios testes."
        oQuePreparar="Fonte acessível e o que de fato foi medido."
        comoAvaliar="Estratégia de terceiro é hipótese local até ser testada aqui. Nenhum nível de evidência garante repetição."
      />
      {cases.length === 0 ? (
        <Empty title="Nenhum caso registrado">Ainda não há caso de vendas do Criador PNG — a biblioteca cresce com testes reais.</Empty>
      ) : (
        <div className="space-y-2">
          {cases.map((c) => (
            <Card key={c.id}>
              <details>
                <summary className="list-none [&::-webkit-details-marker]:hidden flex cursor-pointer flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{c.titulo}</span>
                  <span className="flex gap-1.5">
                    <Badge tone="blue">{NIVEL[c.nivel].split(" — ")[0]}</Badge>
                    <Badge tone={STATUS[c.statusLocal].tone}>{STATUS[c.statusLocal].label}</Badge>
                  </span>
                </summary>
                <CaseForm c={c} />
              </details>
            </Card>
          ))}
        </div>
      )}
      <Card>
        <h2 className="font-semibold">Novo caso</h2>
        <CaseForm />
      </Card>
    </main>
  );
}
