# Renderização: Parcelado ep01

Tudo é gerado por código, sem IA de imagem nem de voz.

| Arquivo | Função |
|---|---|
| `timeline.json` | **Fonte única de tempo**: cenas, textos na tela, efeitos sonoros e intensidade da chuva |
| `engine.js` | Desenha cada frame em canvas 2D (cenários, silhuetas, painel do topo, infográficos, textos) |
| `render.js` | Abre o `index.html` no Chromium (Playwright), captura os frames e envia ao ffmpeg |
| `synth_audio.py` | Sintetiza os efeitos e a ambiência (numpy/scipy) a partir do mesmo `timeline.json` |
| `fonts/` | Oswald, Share Tech Mono, UnifrakturCook (licença OFL) |

## Gerar de novo

```bash
# prévias de frames específicos (segundos)
node render.js stills /tmp/prev 4 17 58.6 88

# vídeo mudo
node render.js video /tmp/mudo.mp4

# áudio (sfx.wav, ambiencia.wav, mix.wav)
python3 synth_audio.py /tmp/audio

# juntar
ffmpeg -i /tmp/mudo.mp4 -i /tmp/audio/mix.wav -c:v copy -c:a aac -b:a 256k -shortest parcelado_ep01.mp4
```

Para mudar um texto ou o momento de um efeito, edite só o `timeline.json` e gere de novo.
