import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WHATSAPP_URL } from "@/lib/cta";

export const metadata: Metadata = {
  title: "Política de Privacidade | Cardápio Alto",
  description:
    "Como o Cardápio Alto coleta, usa e protege as informações de quem visita o site e faz o diagnóstico.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-cream-border py-8">
      <h2 className="text-xl font-bold text-heading-dark sm:text-2xl">{title}</h2>
      <div className="mt-3 max-w-2xl space-y-3 text-base leading-relaxed text-[#1a1206]/70">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-cream pt-28">
        <div className="mx-auto max-w-3xl px-6 pb-20 sm:px-8 sm:pb-28">
          <p className="text-sm font-medium text-bg-deep">Cardápio Alto</p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,2.75rem)] font-black leading-tight text-heading-dark">
            Política de Privacidade
          </h1>
          <p className="mt-4 text-sm text-[#1a1206]/50">
            Última atualização: 18 de agosto de 2026.
          </p>

          <Section title="1. Quem é o Cardápio Alto">
            <p>
              O Cardápio Alto é uma assessoria para negócios de alimentação —
              restaurantes, delivery, hamburguerias, pizzarias e operações
              parecidas — nascida em Floriano, Piauí. Esta página explica, em
              linguagem simples, quais informações podemos coletar através
              deste site e do processo de diagnóstico, e como elas são
              usadas.
            </p>
          </Section>

          <Section title="2. Quais dados podem ser coletados">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Nome</li>
              <li>Telefone / WhatsApp</li>
              <li>E-mail, quando informado</li>
              <li>Instagram</li>
              <li>Cidade e estado</li>
              <li>Nome e tipo do negócio</li>
              <li>Respostas fornecidas no diagnóstico</li>
              <li>Dados de origem de tráfego (de onde você veio até nós)</li>
              <li>UTMs (parâmetros de campanha)</li>
              <li>Identificadores de campanha, conjunto de anúncios e anúncio, quando disponíveis</li>
              <li>Página de entrada (landing page)</li>
              <li>Informações técnicas necessárias ao funcionamento do site (como dados básicos de navegação)</li>
            </ul>
          </Section>

          <Section title="3. Como os dados são coletados">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Diretamente pelo site (por exemplo, ao clicar em um botão de diagnóstico)</li>
              <li>Pelo Typebot, durante a conversa de diagnóstico</li>
              <li>Por formulários e fluxos vindos de anúncios da Meta (Instagram/Facebook), quando aplicável</li>
              <li>Pelo WhatsApp, quando você entra em contato por lá</li>
              <li>
                Por cookies e armazenamento local usados para entender de
                onde veio a visita (atribuição), e por ferramentas de
                analytics, apenas quando estiverem configuradas e ativas
              </li>
            </ul>
          </Section>

          <Section title="4. Para que os dados são usados">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Realizar o diagnóstico do seu negócio</li>
              <li>Entrar em contato com você</li>
              <li>Qualificar a solicitação</li>
              <li>Prestar os serviços contratados</li>
              <li>Melhorar o site e o atendimento</li>
              <li>Entender de qual campanha ou canal um lead veio</li>
              <li>Segurança e prevenção de uso indevido do site</li>
            </ul>
          </Section>

          <Section title="5. Serviços externos que podem processar dados">
            <p>
              Alguns dados podem passar por ferramentas de terceiros que dão
              suporte à operação do Cardápio Alto. Listamos aqui o que
              podemos utilizar — nem todas estão necessariamente ativas o
              tempo todo:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Meta (Instagram/Facebook), quando houver campanhas ativas</li>
              <li>Google, Google Tag Manager e Google Analytics, quando configurados</li>
              <li>Typebot, para conduzir o diagnóstico</li>
              <li>Supabase, para armazenar as informações com segurança</li>
              <li>Telegram, apenas para notificação interna da nossa equipe sobre novos contatos — não é usado para falar com você</li>
              <li>Vercel, para hospedar o site</li>
              <li>WhatsApp, para conversas diretas com nossa equipe</li>
            </ul>
          </Section>

          <Section title="6. Não vendemos seus dados">
            <p>
              O Cardápio Alto não vende, aluga ou comercializa suas
              informações para terceiros.
            </p>
          </Section>

          <Section title="7. Retenção e exclusão">
            <p>
              Mantemos os dados pelo tempo necessário para prestar o
              diagnóstico e o atendimento, ou até que você solicite a
              exclusão. Não existe um prazo fixo aplicável a todos os casos
              — o tempo de retenção depende do contexto de cada solicitação
              e da nossa relação comercial com você.
            </p>
          </Section>

          <Section title="8. Seus direitos">
            <p>Você pode solicitar, a qualquer momento:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Acesso aos seus dados</li>
              <li>Correção de informações incorretas</li>
              <li>Exclusão dos seus dados</li>
              <li>Esclarecimentos sobre como seus dados são tratados</li>
            </ul>
          </Section>

          <Section title="9. Contato">
            <p>
              Para qualquer dúvida sobre esta política ou para exercer os
              direitos acima, fale com a gente pelo WhatsApp:
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-semibold text-bg-deep underline underline-offset-4"
            >
              Falar no WhatsApp
            </a>
          </Section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
