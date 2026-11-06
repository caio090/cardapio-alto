import { emptyBody, emptyFinance, emptyPage, emptyStages, type ProductDoc } from "./model";

export const newId = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

export function blankProduct(name: string, niche: string): ProductDoc {
  const t = now();
  return {
    id: newId(),
    productId: null,
    createdAt: t,
    updatedAt: t,
    name,
    niche,
    versionLabel: "0.1",
    responsaveis: "",
    descricao: "",
    dadosFicticios: false,
    currentStage: "publico_problema",
    body: emptyBody(),
    stages: emptyStages(),
    finance: emptyFinance(),
    page: emptyPage(),
    deliverable: { title: name, subtitle: "", versionLabel: "0.1", disclaimer: "", sections: [] },
    drive: {},
  };
}

