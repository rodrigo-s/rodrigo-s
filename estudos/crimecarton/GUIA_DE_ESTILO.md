# Guia de estilo: série "O Assalto" (@crimecarton)

Engenharia reversa de 4 vídeos de referência (Partes 1 a 4). Os vídeos estão na pasta do Google Drive `1fB8gKMoWJc7BWW0z-B4inGnmO3GPjCXI`.
Objetivo: reproduzir o formato com fidelidade (visual, narrativa, ritmo, som e mecânica de engajamento).
Transcrições completas em [`TRANSCRICOES.md`](./TRANSCRICOES.md).

---

## 1. O formato em uma frase

**Um true crime ficcional e interativo, em cartoon para adultos, que ensina como o sistema financeiro brasileiro pega o dinheiro sujo.** Cada episódio mostra o protagonista tentando usar R$ 10 milhões em espécie de um assalto. A cada tentativa, o sistema mostra como ele seria pego. No final, o público vota nos comentários e decide o próximo passo.

O motor da série é a frase-tese **"Todo real deixa rastro."** O crime nunca compensa e cada atalho cria um rastro novo. É isso que mantém o conteúdo educativo, e não um manual.

---

## 2. Especificações técnicas

| Item | Valor |
|---|---|
| Proporção | 9:16 vertical, 720×1280 (exportar em 1080×1920 se possível) |
| FPS | 30 |
| Duração | Cresce a cada parte: 1:34 → 1:51 → 2:09 → 2:14 |
| Cortes de imagem | 15 a 27 por vídeo. **Plano médio de 4 a 6 s** (mínimo cerca de 1,5 s, máximo cerca de 10 s) |
| Mudança de texto na tela | A cada **1 a 2 s**, mesmo dentro do mesmo plano |
| Áudio | AAC 44,1 kHz estéreo. Loudness média de cerca de −17 dB, picos em 0 dB (masterizado alto, padrão de Reels/TikTok) |
| Marca d'água | Logo do Instagram e `@CRIMECARTON` no lado direito, a cerca de 1/3 da altura (desloca para baixo quando o HUD cresce) |

---

## 3. Estrutura narrativa (template de episódio)

### Parte 1 (piloto), com tempos reais

| Tempo | Bloco | O que acontece |
|---|---|---|
| 0:00–0:10 | **HOOK** | Protagonista de costas na porta da kitnet, com sacos de lixo cheios de dinheiro. Texto "O ASSALTO / DEU CERTO." Depois "R$ 10.000.000 em dinheiro vivo". Fala em 2ª pessoa: "A sua parte." |
| 0:10–0:23 | **PROBLEMA 1: O PESO** | Ilustração (puxando o saco que rasga). Corta para um infográfico: 1 nota = 1 g, 100 mil notas = 100 kg. Volta para a ilustração da geladeira: "= 200 KG (uma geladeira cheia)". |
| 0:23–0:32 | **PROBLEMA 2: O PAÍS DO PIX** | Feira com todo mundo pagando por QR code e ele com um bolo de notas. Chip "TODO MUNDO: PIX / VOCÊ: BOLO DE NOTAS". Selo "CHAMOU ATENÇÃO". Suspeita sobe para 1★. |
| 0:32–0:64 | **PROBLEMA 3: O BANCO** | Infográfico: depósito ≥ R$ 50 mil vai para o COAF (automático). Ilustração andando com depósitos de 49 mil. Infográfico com barras abaixo do limite: "FRACIONAMENTO / SINAL DE ALERTA". Analista furioso no PC com "ALERTA: FRACIONAMENTO". Infográfico da Receita: renda de 2 mil × depósito de 300 mil = 150x, carimbo "MALHA FINA". |
| 0:64–0:72 | **PROBLEMA 4: GASTAR** | Concessionária, com lista "CONCESSIONÁRIA → COAF / JOALHERIA → COAF / IMOBILIÁRIA → COAF". Suspeita em 5★. |
| 0:72–0:77 | **IRONIA / BALANÇO** | Sentado sobre os sacos: "Na mão R$ 9.902.000 / Dá pra usar R$ 0". |
| 0:77–0:79 | **TESE** | Tela preta: "TODO REAL / DEIXA RASTRO." (o amarelo entra palavra por palavra). |
| 0:79–0:89 | **ESCOLHA (CTA)** | Volta para o plano do hook escurecido: "E AGORA? você tem duas saídas". Botões [ARRISCAR] (amarelo) e [DESISTIR] (branco). Caixa "PARTE 2: a maioria decide o próximo passo". |
| 0:89–0:94 | **OUTRO** | Tudo escurece. Logo do Instagram pulsando (branco → gradiente IG → branco) e @handle. Cerca de 2 s de silêncio musical no final. |

### Partes 2 em diante (episódio de continuação)

1. **Hook fixo (0–5 s)**: **o mesmo plano de abertura** de todo episódio, com tag amarela "PARTE N". Narração: "O assalto deu certo. 10 milhões de reais em dinheiro vivo."
2. **Tese (5–7 s)**: tela preta, "MAS TODO REAL / DEIXA RASTRO." e uma onda de pontinhos amarelos animada embaixo.
3. **Ponte para episódios anteriores**: chip amarelo "OS EPISÓDIOS TÃO NO PERFIL ↑" / "PERDEU A PARTE 1? TÁ NO PERFIL →".
4. **Recap "Até aqui…" (5–10 s)**: estado atual, reforçado pelo HUD e pelo infográfico. Na Parte 3 aparece um tríptico com as 3 malas.
5. **Resultado da votação**: "Vocês escolheram / decidiram: ARRISCAR ✓". A partir da Parte 3, uma tela de enquete mostra as porcentagens subindo (BUSCAR 83% / DEIXAR 17%) com carimbo da opção vencedora. A Parte 4 também mostra **comentários reais da parte anterior** ("COMENTÁRIOS DA PARTE 3").
6. **Desenvolvimento**: 2 ou 3 novos problemas ou consequências. Cada um segue o padrão *ação → mecanismo real → veredito (carimbo)*.
7. **Reviravolta**: entra uma ameaça humana nova (Juninho chantageando, o chefe ligando, o Comendador no banco do carona, a foto do Juninho).
8. **Escolha binária**: "E agora? X ou Y? Comenta uma palavra. O que a maioria escolher vira parte N+1." Os botões têm subtítulo com a consequência ("BUSCAR: arrisca uma briga" / "DEIXAR: paga R$ 50 mil"). Um balão de pensamento ou vinheta circular no topo mostra o que está em jogo.
9. **Outro**: igual ao da Parte 1.

### Arco da série (escalada)

| Parte | Tema | Ameaça | Votação |
|---|---|---|---|
| 1 | Por que não dá pra usar o dinheiro (peso, PIX, COAF, Receita, compras) | O sistema | ARRISCAR / DESISTIR |
| 2 | Esconder: dinheiro parado estraga, dividir em 3 (kitnet, self storage, Juninho) | O amigo (chantagem) | BUSCAR / DEIXAR |
| 3 | Enterrar 6,5 mi no sítio; Juninho ostenta a moto; notas em sequência registradas | Polícia + quadrilha | PARÇA / VÁCUO |
| 4 | Juninho some ("virou camisa"); o banco guarda tudo; Comendador Brandão aparece | O mandante sabe do sítio | FECHA / CAVA |

**Regras da escalada:** cada episódio fecha uma porta e abre uma ameaça mais pessoal e mais violenta (sistema → amigo → polícia e quadrilha → chefão). O dinheiro **nunca** fica utilizável. As consequências da escolha anterior sempre aparecem logo no início.

---

## 4. Roteiro: voz e regras de escrita

- **Pessoa:** a Parte 1 é em **2ª pessoa** ("Você tá no Brasil de hoje", "Aí você pensa"). Da Parte 2 em diante passa para **3ª pessoa ("ele")**, mas volta para "você" nos momentos de ameaça ("A polícia ainda não sabe quem é você").
- **Frases curtíssimas:** de 1 a 3 s cada, muitas sem verbo ("Saco de lixo numa kitnet." "Sem moto, sem story, sem notícia."). Velocidade de **150 a 170 palavras/min** na fala ativa, sem trechos mortos.
- **Conectores-assinatura:** "Só que…" (o principal motor de virada), "Então…", "Aí…", "Mesmo assim…", "Enquanto isso…", "E agora?".
- **Números concretos e reais:** R$ 50 mil (limite de comunicação ao COAF), 49 mil + 49 mil, 1 nota ≈ 1 g, 100 kg, 150x a renda, 14 mensagens, 9 chamadas perdidas. O número sempre vira gráfico na tela.
- **Didática embutida:** cada "problema" explica **um mecanismo real de fiscalização** (COAF, fracionamento, malha fina da Receita, comunicação obrigatória de concessionária, joalheria e imobiliária, numeração de notas, câmera do caixa).
- **Humor seco e brasileiro:** "Ninguém achou corpo, mas a camisa ficou pronta rapidinho." / "Deus é fiel. Fruto do meu trabalho." / "o Juninho, que vivia pedindo PIX de 20 reais emprestado". Use gírias com moderação: kitnet, mano, guri, parça, vácuo, Uno velho, Marketplace.
- **Tríades rítmicas:** "um assalto, um incêndio ou uma batida da polícia", "data, hora e a câmera do caixa", "não saiu, não gastou, não retornou".
- **Diálogos de personagem** são raros (1 ou 2 por episódio) e curtos, sempre por um meio diegético: áudio de WhatsApp, ligação, fala no carro.
- **Bordões fixos:** "O assalto deu certo." / "Todo real deixa rastro." / "E agora?" / "Comenta uma palavra." / "O que a maioria escolher vira parte N."
- **As opções de voto** são sempre **uma palavra** e de preferência rimam ou contrastam no ritmo: ARRISCAR/DESISTIR, BUSCAR/DEIXAR, PARÇA/VÁCUO, FECHA/CAVA.

---

## 5. Personagens (model sheets)

Consistência é tudo. **Cada personagem usa sempre a mesma roupa** e tem uma silhueta reconhecível.

### Protagonista (sem nome)
- Homem branco, magro, cerca de 20 a 25 anos. Cabelo castanho-claro ou ruivo aparecendo sob o chapéu, sardas leves, barba rala nos closes.
- **Bucket hat verde-oliva**, **jaqueta de moletom/agasalho laranja com zíper e gola alta**, **calça de moletom cinza com cordão**, **meia branca + chinelo**.
- Expressões: ansiedade, suor, olhos arregalados, sobrancelhas tensas. Raramente sorri.
- Acessórios recorrentes: mochila cinza estufada, celular, mala ou bolsa azul.

### Juninho
- Homem negro, gordinho, **black power volumoso**, **óculos pretos grossos retangulares**, cavanhaque.
- **Regata branca**, **bermuda azul**, chinelo. Na Parte 3 ganha corrente dourada e moto vermelha.
- Expressões: sorriso malandro, cara de "eu abri a mala", óculos refletindo notas.

### Comendador Brandão (mandante)
- Homem mais velho e corpulento, **cabelo grisalho penteado para trás**, **bigode grisalho**, **óculos aviador escuros**.
- **Camisa branca aberta no peito**, **correntes, anéis e relógio de ouro**.
- Iluminação dividida (metade do rosto na sombra). Gesto-assinatura: abaixar os óculos com um dedo.

### Coadjuvantes
- **Gerente do banco:** grisalho, terno azul-marinho, gravata vermelha, ao telefone fixo, com uma agência envidraçada atrás.
- **Analista do COAF:** mais velho, óculos, camisa e gravata, escritório entulhado de papéis, caneca de café, cara de bravo.
- **"O chefe" (Parte 3):** aparece em split com luz dura e óculos escuros.
- Figurantes: feirantes, atendente de self storage com headset, vendedor do Uno.

---

## 6. Estilo de ilustração

**Cartoon para adultos / graphic novel digital, entre webtoon e animação adulta americana, com ambientação brasileira suja e detalhada.**

- **Traço:** contorno escuro grosso e uniforme (inking limpo), proporções semi-realistas com cabeças levemente grandes e expressões exageradas.
- **Pintura:** cel shading com gradientes suaves e pintados, sem chapado puro. Os fundos são bem mais texturizados que os personagens: parede manchada, reboco descascado, mofo, piso encardido, tijolo.
- **Detalhe de cenário alto:** kitnet com ventilador velho, lâmpada pendurada, fogão sujo, geladeira antiga; feira com mamão, manga e banana; ruas de periferia com fios e casas de tijolo.
- **Dinheiro:** maços de notas com cara de "dólar estilizado" em tons verde e cinza, nunca a cédula de real fiel. Exceção: no infográfico de numeração aparecem notas azuis de 100.
- **Sem texto dentro da ilustração.** Todo texto entra na pós-produção (exceções diegéticas: camiseta "JUNINHO / SAUDADES ETERNAS", "REC" de câmera).
- **Recursos de quadrinho:** balão de pensamento com bolinhas, vinheta circular, divisão em painéis (ligação em 2 painéis), linhas de tremor no celular vibrando, gotas de suor.

---

## 7. Iluminação e cor

**Iluminação motivada e dramática.** Cada cena tem uma fonte de luz visível que define o clima:

| Ambiente | Luz | Paleta |
|---|---|---|
| Kitnet (base) | **Lâmpada nua pendurada** (luz quente de cima, cantos escuros) + **luar azul pela janela** | Amarelo-encardido / ocre × azul-petróleo |
| Rua de dia / feira / concessionária | Sol suave, céu lavado | Pastel quente, alto-key |
| Escritórios (COAF, banco) | Luz fria de tela e fluorescente | Bege, cinza, azul-marinho |
| Noite na periferia | **Poste de sódio laranja** × céu azul-noite | Teal & orange |
| Celular no escuro | **Tela iluminando o rosto de baixo** (azul) | Escuro + azul |
| Sítio ao amanhecer | Contraluz dourado, sol baixo, faróis do carro | Laranja / dourado |
| Ameaça / mandante | Luz dura lateral (metade do rosto na sombra), giroflex vermelho | Contraste alto, vermelho |
| Ponto de virada (Juninho, Parte 2) | Duotone rosa/roxo e vinheta (tom de "fim de linha") | Magenta dessaturado |

- **Grade geral:** levemente dessaturada e quente nos meios-tons, sombras puxando para teal. Vinheta presente.
- **Progressão de luz na série:** a Parte 1 é mais diurna e informativa. Das Partes 3 e 4 em diante quase tudo é noite e madrugada, acompanhando a escalada de perigo.

---

## 8. Câmera e enquadramentos

Cada plano é um **clipe de imagem→vídeo de IA de cerca de 5 s** a partir de uma ilustração-chave. Movimento típico:

- **Push-in lento** (dolly in) em quase todo plano: o padrão absoluto.
- **Leve deriva lateral ou arco** em planos de multidão (feira) e de rua.
- **Personagem animado de forma sutil:** respira, pisca, vira a cabeça, mexe as mãos, o suor escorre, notas caem. Nada de ação complexa.
- **Câmera estática + animação interna** nos POVs e nos insertos de objeto (celular vibrando).

Repertório de planos usados:

| Plano | Exemplo |
|---|---|
| **Plano de costas no batente** (assinatura da série) | Abertura de todos os episódios |
| Plano médio frontal, personagem centralizado | Na feira, segurando os maços |
| Plano americano / corpo inteiro andando em direção à câmera | Rua com mochila, corredor do self storage |
| **Close / super close de rosto** para choque | Rosto suado na ligação, Juninho com óculos refletindo dinheiro |
| **Plongée / top-down** | Deitado no colchão (DIA 1, DIA 7), Juninho deitado no dinheiro, celular no chão |
| **POV primeira pessoa** | Mãos segurando o dossiê com polaroid, mão apontando pelo para-brisa |
| **CCTV** (moldura com cantos, "REC", "CAM 07", timestamp) | Corredor do storage, câmera do caixa |
| **Two-shot pelo para-brisa** | Comendador + protagonista no Uno |
| **Painéis divididos** | Ligação (protagonista em cima / chefe embaixo), tríptico das 3 malas |
| **Grande plano geral noturno** | Mangueira sob a lua no sítio ("ELE SABE") |
| **Vinheta circular / balão de pensamento** | Ameaça pairando sobre o personagem no CTA |
| Inserto de objeto | Máquina de contar notas com giroflex, notas em sequência |

---

## 9. Motion graphics e design system

### Tipografia
- **Poppins** (SemiBold, Bold, ExtraBold) em tudo. Títulos em CAIXA ALTA com tracking normal; labels pequenos em caixa alta com tracking aberto.

### Paleta (amostrada dos frames)
| Token | Hex aprox. | Uso |
|---|---|---|
| `bg` | `#111C1A` → `#0F1315` (gradiente vertical) + **grade sutil** de linhas | Fundo das telas de infográfico |
| `panel` | `#090D0F` com cerca de 85% de opacidade, cantos 12–16 px | HUD, chips, lower-thirds |
| `money` | `#2EC27A` | Valores em dinheiro, barras, "check" |
| `warn` | `#FEB925` | Estrelas, tags de capítulo, palavra-destaque, botão A |
| `alert` | `#E8483C` (carimbo) / `#B3261E` (pílula) | Carimbos, alertas, estrelas no nível máximo, borda do HUD em perigo |
| `text` | `#FFFFFF` / `#F2EFEA` | Texto principal |
| `muted` | branco a 50–60% | Subtítulos e labels |

### HUD persistente (topo, a partir de cerca de 2 s e até o CTA)
Funciona como o **"nível de procurado" de jogo**:

```
┌──────────────────────────────────────────────┐
│ DINHEIRO VIVO            │ SUSPEITA          │
│ R$ 9.902.000  (verde)    │ ★★★★☆  (amarelo)  │
└──────────────────────────────────────────────┘
      [ NO BANCO R$ 98.000 · SINALIZADO ]   ← pílula vermelha
   (• KITNET) (• STORAGE) (• JUNINHO)       ← chips de inventário (Parte 2+)
```
- O **contador de dinheiro** anima o valor quando muda (10.000.000 → 9.951.000 → 9.902.000).
- As **estrelas** acendem uma a uma com um "pop". **Com 5★ todas ficam vermelhas** e a borda do painel fica vermelha. Elas também podem baixar ("SUSPEITA BAIXANDO… (por enquanto)").
- O status da pílula evolui com a história: `SINALIZADO` → `PARADO` → `EM RISCO`.

### Componentes de texto
- **Tag de capítulo:** pílula amarela com texto escuro: `PROBLEMA 1 · O PESO`, `PARTE 3 · JUNINHO`, `PARTE 2`.
- **Lower-third / chip:** caixa preta translúcida com texto branco em caixa alta, opcionalmente com ✓ verde. Empilha em lista, um item por vez, sincronizado com a fala: `NÃO SAIU ✓ / NÃO GASTOU ✓ / NÃO RETORNOU O GERENTE ✓`.
- **Pílula de alerta:** vermelha, texto branco: `CHAMOU ATENÇÃO`, `CADA VISITA FICA GRAVADA`, `PAGAR NÃO RESOLVE`.
- **Carimbo:** texto vermelho (ou amarelo) com contorno retangular, **girado de −5° a −8°**. Entra com escala grande → 100% e um pequeno overshoot ("slam"): `MALHA FINA`, `NÃO ADIANTOU`, `ACABOU`, `REGISTRADO`, `ELE SABE`, `IDENTIFICADO`, `FECHA COMIGO`, `VOCÊS AVISARAM`.
- **Card de balanço/dados:** caixa escura com linhas label/valor e o resultado grande em vermelho: `Dá pra usar R$ 0`.
- **Citação de diálogo:** texto curto entre aspas no meio-baixo da tela: `"EU ABRI A MALA"`.
- **Título de tempo:** `DIA 1` / `DIA 7` em card grande, `DOIS DIAS DEPOIS`.

### Mockups de interface (muito usados para dar realismo)
- Áudio do WhatsApp (avatar, waveform verde, play/pause, duração)
- Conversa com mensagens não respondidas + rodapé `14 mensagens · visualizadas · sem resposta`
- Notificação de e-mail ("Gerente da agência · Comprovação de origem dos recursos")
- Chamada recebida (`Número desconhecido · chamando…` / `em ligação 00:03`)
- Post de Instagram (`juninho.oficial`, curtidas subindo, legenda com hashtags)
- Ficha de cadastro (`CPF •••.•••.•••-••` + carimbo `REGISTRADO`)
- Leitura de notas pela máquina (lista de números com `OK` e linhas vermelhas `REGISTRADA`)
- Notificação "7 CHAMADAS PERDIDAS · GERENTE"

### Telas de infográfico (fundo escuro com grade)
Aparecem a cada 15–25 s para explicar números: barras animadas crescendo, linha tracejada vermelha de "LIMITE COAF: R$ 50 MIL", ícones de nota multiplicando em grade, linha do tempo (DIA 2 → DIA 20) e enquete com barras animando a porcentagem. **O HUD continua visível por cima.**

### Animação de texto (timings)
- **Pop-in:** escala 60% → 105% → 100% em cerca de 6 a 8 frames, com ease-out. Opacidade de 0 a 1 nos primeiros 3 frames.
- **Revelação em 2 tempos:** a 1ª linha branca entra e, cerca de 0,25 s depois, a 2ª linha (a palavra-chave) entra **em amarelo e maior**. Ex.: `O ASSALTO` → `DEU CERTO.`
- **Saída:** corte seco ou fade rápido (cerca de 4 frames).
- **Sincronia:** cada texto entra **na sílaba exata** em que a palavra é falada.

---

## 10. Edição e transições

- **Corte padrão:** seco, ou um **"dip" de 1 a 2 frames para cinza-claro** (flash leve) ao passar de ilustração para infográfico.
- O HUD e a marca d'água **não cortam**: atravessam as transições e dão continuidade.
- **Telas pretas de tese** com texto e uma onda de pontos amarelos animada, como respiro antes do recap.
- **CTA:** volta ao plano de abertura (ou a um plano-chave) escurecido em cerca de 60%, com elementos entrando em sequência: título → subtítulo → "COMENTA UMA PALAVRA" → botões → caixa "PARTE N+1".
- **Outro:** tudo escurece para cerca de 15%, logo do IG central com pulso de cor e @handle.
- Cerca de **10% do vídeo** é infográfico puro; o resto é ilustração animada com sobreposições.

---

## 11. Áudio

- **Narrador:** voz **masculina, grave** (fundamental em torno de 100 Hz medida nos trechos limpos), tom sério de documentário policial com ironia contida, dicção limpa, sem sotaque regional marcado. Ritmo acelerado, porém claro. Provavelmente TTS de alta qualidade.
- **Vozes de personagens:** usadas só em diálogos diegéticos (áudio do Juninho, ligação do chefe, Comendador no carro), com a voz do personagem e tratamento de telefone/WhatsApp quando cabe.
- **Trilha:** cama contínua do início ao fim, sem buracos, mixada abaixo da voz. O volume médio alto (−17 dB) indica compressão forte. *Não deu para identificar instrumentação com segurança daqui.* O que se infere pelo clima: suspense/tensão com pulso constante (estilo trap/thriller minimalista).
- **SFX sugeridos** para reproduzir a energia das sobreposições: "pop/whoosh" a cada texto que entra, "thump" grave em carimbo, "ding" ou caixa registradora quando o contador de dinheiro muda, "alarm blip" quando uma estrela acende, vibração de celular, notificação de WhatsApp.
- **Final:** cerca de 2 s de silêncio musical no outro.

---

## 12. Mecânica de engajamento

1. **Hook idêntico** em todo episódio, que vira reconhecimento de marca.
2. **Série numerada** com "o resto tá no perfil", o que leva o público a maratonar.
3. **Votação por comentário com UMA palavra.** Gera volume de comentários (sinal forte para o algoritmo) e investimento emocional.
4. **Prova social:** mostra a porcentagem da votação e comentários reais da parte anterior.
5. **HUD de jogo** (dinheiro + estrelas): cria tensão visual permanente e serve de recap instantâneo.
6. **Durações crescentes:** o público fiel aguenta vídeos mais longos.

---

## 13. Pipeline de produção sugerido

1. **Roteiro em tabela:** uma linha por frase de narração, com colunas `fala | plano/ilustração | texto na tela | estado do HUD | SFX`.
2. **Model sheets:** gerar 1 imagem de referência por personagem (frente, ¾ e costas) e reutilizar como referência em todas as gerações (ex.: `gemini-3-pro-image` / Nano Banana ou `flux-2-pro` com várias referências).
3. **Keyframes 9:16:** uma ilustração por plano, a partir das referências de personagem + prompt de estilo (abaixo).
4. **Animação:** imagem→vídeo de 5 s por keyframe (Kling, Seedance, Veo) com prompt de **movimento sutil + push-in lento**.
5. **Voz:** TTS (ElevenLabs `eleven_v3` ou similar) com voz masculina grave PT-BR. Gerar por frase para controlar as pausas. Usar o timestamp de palavras para sincronizar os textos.
6. **Trilha e SFX:** cama de suspense contínua + biblioteca de pops, whooshes e carimbos.
7. **Motion graphics e HUD:** montar em código (Remotion/React) ou After Effects/CapCut como templates reaproveitáveis: HUD, chips, carimbos, cards, mockups, tela de enquete, CTA e outro.
8. **Montagem:** cortes a cada cerca de 5 s, texto novo a cada 1–2 s, loudness final em torno de −14 LUFS.

### Prompt-base de estilo (imagem)

```
Vertical 9:16 digital illustration, modern adult cartoon / graphic-novel style,
clean bold dark outlines, cel shading with soft painterly gradients, semi-realistic
proportions with expressive exaggerated facial expressions, highly detailed gritty
Brazilian urban environment (stained walls, peeling plaster, worn tiles), cinematic
motivated lighting: {LUZ}, slightly desaturated warm palette with teal shadows,
subtle vignette, no text, no watermark.
Scene: {CENA}. Camera: {PLANO}.
```

Exemplo de `{LUZ}`: *"single bare hanging light bulb casting warm yellow top light, cool blue moonlight through a small window, dark corners"*.

### Descrição fixa dos personagens (colar no prompt)

```
PROTAGONIST: skinny white man in his early 20s, light auburn hair under an olive-green
bucket hat, orange zip-up track jacket with high collar, grey drawstring sweatpants,
white socks with flip-flops, anxious expression.

JUNINHO: chubby Black Brazilian man, big round afro, thick black rectangular glasses,
small goatee, white tank top, blue shorts, flip-flops, mischievous grin.

COMENDADOR BRANDÃO: heavyset older man, slicked-back grey hair, grey mustache,
dark aviator sunglasses, open-collar white shirt, gold chains, gold rings and watch,
menacing smug smile.
```

### Prompt-base de movimento (imagem→vídeo)

```
Keep the exact illustration style and character design. Subtle, natural animation only:
{AÇÃO SIMPLES — e.g. character breathes, blinks and slowly looks down at the money;
sweat drop rolls down}. Slow steady camera push-in. Lighting and background stay
consistent. No cuts, no new characters, no text.
```

---

## 14. Checklist de fidelidade

- [ ] Abre com o plano de costas na kitnet + "O ASSALTO / DEU CERTO." em até 1 s
- [ ] "Todo real deixa rastro" aparece (falado e escrito)
- [ ] HUD com dinheiro + 5 estrelas + pílula de status sempre visível
- [ ] Nenhum plano passa de cerca de 8 s; texto novo a cada 1–2 s
- [ ] Cada problema segue *ação → mecanismo real → carimbo*
- [ ] Pelo menos 1 mockup de celular/interface por episódio
- [ ] Resultado da votação anterior no começo (Parte 2+)
- [ ] Termina em escolha binária de uma palavra + "vira parte N+1"
- [ ] Outro com logo do IG e @handle
- [ ] Personagens com roupa idêntica em todos os planos

---

## 15. Limites desta análise

- Não ouço o áudio, então o timbre da trilha e os SFX exatos são inferências. A transcrição é automática e foi revisada.
- A detecção de cortes por imagem (limiar 0,3) pode ter perdido cortes suaves; a contagem real é um pouco maior.
- As cores foram amostradas de frames comprimidos (H.264), então os valores são aproximados (±5%).
