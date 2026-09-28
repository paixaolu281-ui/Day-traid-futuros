# Futures Bank Pro
PWA pessoal (HTML/CSS/JS puro, sem backend) para gestão de banca, diário e cálculo de operações de futuros. Não dá sinais nem promete lucro.

## Arquivos
index.html, style.css, app.js, manifest.json, service-worker.js, icons/ (192, 512, apple-touch-icon), README.md

## Testar
Service workers exigem HTTP(S): na pasta rode `python3 -m http.server 8000` e abra http://localhost:8000.

## GitHub Pages
1. Crie um repositório e envie todos os arquivos na raiz.
2. Settings > Pages > Deploy from a branch > main / (root).
3. Acesse https://SEU-USUARIO.github.io/NOME-DO-REPO/

## Instalar no Android
Abra o link no Chrome > menu (⋮) > "Instalar app" / "Adicionar à tela inicial". No iPhone: Safari > Compartilhar > Adicionar à Tela de Início.

## Backup
Config > Exportar dados (JSON). Em outro aparelho: Config > Importar dados. Dados ficam no localStorage; limpar dados do navegador apaga tudo, então exporte com frequência.
Ao alterar arquivos, aumente a versão `C` em service-worker.js para atualizar o cache.
