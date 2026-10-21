# Comercial vertical — Cardápio Alto (Remotion)

Comercial de ~40 s, 1080×1920, 30 fps, H.264 + AAC, para Instagram Reels.
Projeto Remotion independente do site Next.js (pasta excluída do
`tsconfig`/ESLint da raiz).

> **Status: PRÉVIA — não finalizado.** Falta a narração (ver Pendências).
> O MP4 em `entregas/` tem trilha, efeitos, legendas e todas as cenas, mas
> não tem voz.

## Comandos

```bash
npm install
npm run dev               # Remotion Studio (preview interativo)
npm run narration:align   # sincroniza com public/audio/narracao/narracao.wav
npm run audio:build       # gera trilha + efeitos (python3, numpy, scipy)
npm run render:draft      # teste 540×960
npm run render            # final 1080×1920 + masterização -14 LUFS
npm run render:cover      # quadro de capa (out/capa.png)
```

Em ambientes sem download do Chrome Headless Shell, exporte
`REMOTION_BROWSER_EXECUTABLE=/caminho/do/headless_shell`.

## Como a montagem se sincroniza

`src/data/script.ts` tem o roteiro em 16 frases (cues).
`src/data/narration-timing.json` tem o início/fim de cada frase.
`src/data/timeline.ts` deriva tudo disso: fronteiras de cena, os 4 cortes
da cena 03, legendas palavra a palavra, ducking da música e posição dos
efeitos (`sound-cues.ts`). Hoje o JSON contém uma **estimativa** de ritmo
natural (`"source": "estimativa"`). Ao rodar `narration:align` com a
locução real, os tempos medidos substituem a estimativa e a duração final
passa a ser a da voz.

## Estrutura

```
src/
  Root.tsx                 composições: ComercialCardapioAlto, Capa (still)
  Commercial.tsx           cenas + transições + legendas + 4 trilhas de áudio
  Cover.tsx                quadro de capa
  theme.ts / fonts.ts      paleta, Cabinet Grotesk, áreas seguras do Reels
  components/
    FoodBroll.tsx          fotografia real em tela cheia, 1 movimento por plano
    PhoneMockup.tsx        celular genérico + selo "Simulação ilustrativa"
    MenuComparison.tsx     telas antes/depois, produto, carrinho, toque
    AnimatedHeadline.tsx   revelação editorial por máscara
    CaptionTrack.tsx       legendas com palavras-chave em destaque
    Transition.tsx         wipe (virada), dip (assinatura), flash (gancho)
    BrandOutro.tsx         logo oficial + CTA
    SoundLayer.tsx         trilha de efeitos (um <Audio> nomeado por evento)
  scenes/Scene01…06        uma cena por bloco do roteiro (07 = BrandOutro)
  data/                    roteiro, tempos, linha do tempo, efeitos
scripts/
  align-narration.mjs      silencedetect (FFmpeg) → narration-timing.json
  build-audio.py           síntese da trilha e dos efeitos
public/
  broll/fotos  broll/video  logo  fonts
  audio/narracao  audio/musica  audio/sfx
```

## Trilhas de áudio

1. **Narração**: `audio/narracao/narracao.wav` (pendente).
2. **Trilha musical**: `audio/musica/trilha.wav`. Tensão nas cenas 02–03,
   pulso eletrônico na 04, progressão maior na 05, recuo na 06, assinatura
   curta na 07. Ducking automático durante cada frase.
3. **Transições**: impactos graves, whooshes, riser da virada.
4. **Interface e ambiente**: scroll, cliques secos, cancelamento, toques,
   obturador, confirmação e ambiente de cozinha.

## Relatório de assets

| Asset | Arquivo | Origem | Observação |
| --- | --- | --- | --- |
| Logo | `public/logo/logo-transparente-cardapio-alto.png` | Drive oficial, pasta LOGO-CARDAPIO-DIGITAL (id `1cFodVJv8x9vVRPAoLiLnbksbX0Y_dyGs`), cópia em `midia/` do repositório | Mesmo tamanho (362.196 bytes) e MD5 idêntico ao `public/logo-transparente.png` do site. Usada inteira, proporção 1:1, sem recolorir ou recortar. |
| Brand DNA | Google Doc `1XexJDX8…` | Drive oficial | Lido antes da produção: paleta, tom, mensagem central, ofertas separadas, regra de fidelidade ao produto. |
| Fonte | `public/fonts/CabinetGrotesk-*.woff2` | Mesmos arquivos do site (`src/fonts`) | Fontshare / Indian Type Foundry. |
| Hambúrguer | `broll/fotos/hero-burger.jpg` (2400×1994) | Imagem já publicada no site oficial | Aparência de banco de imagens. **Confirmar licença de uso em anúncio.** |
| Batata | `broll/fotos/fries-dark.jpg` (1600×1280) | Site oficial | Idem. |
| Pizza | `broll/fotos/pizza-close.jpg` (1600×2400) | Site oficial | Idem. |
| Preparo | `broll/fotos/ingredientes.jpg` (1600×1600) | Site oficial | Idem; usada a 22% de opacidade na cena 05. |
| Telas de cardápio | código (`MenuComparison.tsx`) | Criadas para a peça | Ilustrativas, com selo "Simulação ilustrativa". As descrições dos produtos descrevem só o que aparece nas fotos. Preços são de exemplo. Não há métricas nem resultados. |
| Música e efeitos | `public/audio/musica`, `public/audio/sfx` | Sintetizados por `scripts/build-audio.py` | Originais, sem samples nem licenças de terceiros. |

Resolução do B-roll: todas as fotos têm ≥ 1600 px no lado menor usado.
A maior ampliação na tela é a da pizza (largura 1080 sobre 1600 px de
origem), sem upscale visível.

## Pendências

1. **Narração (bloqueio).** O ambiente de produção não tinha nenhum TTS
   autorizado: sem chave de API configurada (ElevenLabs, Gemini, OpenAI) e
   com o download de vozes neurais locais (Piper/Hugging Face) bloqueado
   pela política de rede. Pode ser gravação humana ou TTS licenciado.
   Instruções em `public/audio/narracao/README.md`. A peça não deve ser
   publicada sem ela.
2. **Legendas palavra a palavra.** Com a locução real, a borda de cada
   frase fica presa ao áudio, e as palavras dentro dela são distribuídas
   pelo tamanho. Para precisão por palavra, transcreva com Whisper
   (`@remotion/install-whisper-cpp`) onde o download do modelo for
   permitido e grave os tempos no JSON.
3. **Licença das fotos.** As fotos vieram do site. Confirmar a origem e a
   licença para uso em mídia paga, ou trocar por fotos de clientes
   autorizados.
4. **B-roll em vídeo.** Nenhum clipe disponível (ver `public/broll/video`).
5. **Revisão de mixagem com voz.** Depois do `narration:align`, rodar
   `audio:build` e `render` e ouvir de novo: o ducking já existe, mas o
   equilíbrio final depende do timbre da voz.
