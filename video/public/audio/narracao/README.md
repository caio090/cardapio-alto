# Narração

`narracao.wav` atual: Kokoro TTS, voz `pm_alex` (gerada por
`npm run narration:generate`). Para trocar por um locutor, substitua o
arquivo **`narracao.wav`** (WAV, 48 kHz, mono ou estéreo, sem
música nem efeitos, pico ≤ -3 dBFS, início em ~0,4 s).

## Direção

Voz masculina brasileira, comercial e segura, ritmo natural (~2,5 palavras/s),
sem entonação robótica. **Faça uma pausa audível (≥ 0,25 s) entre as frases
abaixo**: é por ela que `npm run narration:align` sincroniza cenas, cortes e
legendas.

| Cue | Frase | Observação |
| --- | --- | --- |
| c01 | Seu produto pode ser excelente. | Firme, valorizando "excelente". |
| c02 | Mas sabe o que acontece quando o cliente abre um cardápio confuso? | Pergunta real, leve tensão. |
| c03 | Ele procura. | Curto. |
| c04 | Compara. | Curto. |
| c05 | Não entende os combos. | |
| c06 | E desiste. | Seco; pausa longa depois. |
| c07 | Aí você pensa: preciso anunciar mais. | Tom de "pensamento comum". |
| c08 | Só que mais visitas não resolvem uma compra difícil. | Virada, convicção. |
| c09 | No Cardápio Alto, a gente analisa o caminho do pedido: | Mais claro e aberto. |
| c10 | fotos reais que valorizam o produto, | Enumeração com ritmo. |
| c11 | categorias claras, | |
| c12 | descrições que ajudam a escolher... | Suspensão (continua em c13). |
| c13 | ...e uma experiência simples no celular. | |
| c14 | Porque seu cardápio deveria facilitar a venda. | Frase-tese, sem pressa. |
| c15 | Não complicar o pedido. | Depois de uma pausa intencional. |
| c16 | Conheça o Cardápio Alto. | Assinatura, calma. |

## Depois de gravar

```bash
npm run narration:align   # mede as frases e reescreve src/data/narration-timing.json
npm run audio:build       # refaz a trilha para as novas fronteiras de cena
npm run render            # MP4 final masterizado em out/cardapio-alto-comercial.mp4
```

A duração do vídeo passa a ser a da locução + 1,9 s de assinatura. Nada é
acelerado para caber em 40 s.
