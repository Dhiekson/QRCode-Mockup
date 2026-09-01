# Gerador de QR Code + Mockup de Smartphone

Aplicativo Node.js com servidor local (Express) que oferece duas ferramentas na web:

1. **Gerador de QR Code** — usando a biblioteca [`qrcode`](https://www.npmjs.com/package/qrcode).
2. **Mockup de Smartphone** — envie uma foto, ajuste posição/zoom e remova o fundo automaticamente no navegador usando [`@imgly/background-removal`](https://www.npmjs.com/package/@imgly/background-removal).

## Funcionalidades

### QR Code
- Geração a partir de texto, URLs, Wi-Fi, e-mail, telefone etc.
- Formatos de saída: **PNG** e **SVG**
- Personalização de tamanho, margem, correção de erro (L/M/Q/H) e cores
- **Fundo transparente** — opção para salvar o QR Code sem plano de fundo (PNG/SVG com alpha)
- Download e cópia para a área de transferência
- API JSON opcional para integração

### Mockup de Smartphone (Editor de Mockups)
- **Vários dispositivos** — adicione quantos telefones quiser, cada um com sua própria imagem/estilo
- **8 estilos** de aparelho: preto, prata, dourado, azul, vermelho, verde, roxo e **translúcido**
- **Inclinação/rotação** e **perspectiva (3D)** por dispositivo
- **Sombra ajustável** e **profundidade** (efeito empilhado/3D)
- **Elementos flutuantes**: formas (círculo, anel, quadrado) com **gradiente** e **brilho (glow)**
- **Camadas de texto** com fonte, tamanho, cor, negrito, alinhamento e sombra
- **Camadas de imagem** flutuantes com **máscara** (retângulo/arredondado/círculo) e **filtros**
- **Fundo de propaganda**: gradiente (7 presets), cor sólida, imagem de fundo ou transparente
- **Filtros de imagem** (brilho, contraste, saturação, preto e branco, sépia) e **remoção de fundo** (IA no navegador)
- **Edição da imagem direto no mockup** — duplo clique no telefone para entrar no modo de edição: arraste para mover/cortar a imagem dentro da tela, rolinha para zoom, `Esc` ou clique fora para sair
- **Ajustes da imagem de fundo** — zoom, posição, opacidade, desfoque e modo cover/contain
- **Layout fixo sem rolagem** — todos os painéis ficam visíveis durante a edição (rolagem interna apenas quando necessário)
- **11 modelos de aparelho** — iPhone 15 Pro (Dynamic Island), iPhone 14 (Notch), iPhone SE (botão home), Samsung Galaxy S/A, Google Pixel, Xiaomi, Android genérico, iPad, Galaxy Tab e Galaxy Fold (aberto)
- **28 fontes** de texto (incluindo Poppins, Montserrat, Bebas Neue, Anton, Lobster, Pacifico e mais via Google Fonts)
- **11 formas geométricas** — círculo, anel, quadrado, arredondado, pílula, triângulo, estrela, hexágono, losango, coração e blob orgânico — com gradiente, contorno e brilho, e **edição livre** (arrastar, rotacionar, escalar)
- **Tamanho do quadro ajustável** — presets (9:16, 1:1, 4:5, 16:9) ou dimensões personalizadas para estender o fundo
- **Painel de camadas** com reorganização (frente/trás), duplicar e excluir
- **Download em alta resolução** (2× o tamanho do quadro, ex. 1280×2560 PNG)

## Como usar

```bash
# instala as dependências (na primeira vez)
npm install

# inicia o servidor
npm start
```

Acesse **http://localhost:3000** no navegador.

- QR Code: http://localhost:3000/index.html
- Mockup: http://localhost:3000/mockup.html

> A remoção de fundo roda no navegador. Na primeira vez, o modelo de IA e os arquivos WASM são baixados do CDN da IMG.LY (`staticimgly.com`), o que pode demorar um pouco. Depois ficam em cache.

## Endpoint da API

| Método | Rota     | Descrição                                        |
|--------|----------|--------------------------------------------------|
| GET/POST | `/api/qr` | Gera um QR Code (PNG ou SVG)                      |
| GET    | `/api/health` | Healthcheck — retorna `{"status":"ok"}`     |

### Parâmetros do `/api/qr`

| Parâmetro        | Tipo   | Padrão      | Descrição                                  |
|------------------|--------|-------------|---------------------------------------------|
| `text`           | string | — (obrig.)  | Conteúdo a ser codificado                   |
| `format`         | string | `png`       | `png` ou `svg`                              |
| `size`           | number | `512`       | Largura/altura da imagem em pixel           |
| `margin`         | number | `4`         | Margem (em módulos)                         |
| `errorCorrection`| string | `M`         | `L`, `M`, `Q` ou `H`                        |
| `color.dark`     | hex    | `#000000`   | Cor dos módulos                             |
| `color.light`    | hex    | `#ffffff`   | Cor do fundo                                |
| `download`       | bool   | `false`     | Se `true`, envia cabeçalho de download      |

### Exemplos

```bash
# PNG simples
curl "http://localhost:3000/api/qr?text=https://exemplo.com&size=256"

# SVG personalizado
curl "http://localhost:3000/api/qr?text=ola&format=svg&color.dark=%23ff0000&color.light=%23ffffff"

# Forçar download de um PNG
curl -J "http://localhost:3000/api/qr?text=teste&download=true"
```

## Estrutura

```
GeradorQR/
├── server.js            # Servidor Express + endpoint /api/qr
├── e2e-test.js          # Teste E2E (requer MS Edge; npm run test:e2e)
├── package.json
└── public/
    ├── index.html        # Interface do QR Code
    ├── app.js            # Lógica do QR Code
    ├── mockup.html       # Interface do Mockup de Smartphone
    ├── mockup.js         # Lógica do Mockup (canvas + remoção de fundo)
    ├── mockup.css        # Estilos do Mockup
    └── style.css         # Estilos do QR Code + navegação
```

## Testes

O teste E2E (`e2e-test.js`) usa o MS Edge instalado para validar o mockup (upload, renderização no canvas, redraw ao trocar cor e geração do PNG de download).

```bash
# com o servidor rodando, em outro terminal:
npm start
# e depois:
npm run test:e2e
```

## Pré-requisitos

- Node.js 18+ (testado na v22)
- npm