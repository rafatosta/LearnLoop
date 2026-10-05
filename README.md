# LearnLoop

Plataforma de exercícios de inglês em React + Vite + Tailwind CSS. Interface em português, prática em inglês e cinco módulos baseados em **Quantifiers_AND Simple_Past_.pptx.pdf**, de Eli Hungria.

## Executar

Requer Node.js 22. Execute `npm ci`, `npm run dev`. Para verificar: `npm test` e `npm run build`. `npm run preview` serve o build.

## Aprendizagem

Cada acerto vale 10 pontos. Uma questão errada retorna ao fim da fila ao clicar em Continuar. O módulo só termina quando todas forem acertadas. Não há perda de vidas. A tela mostra domínio, pontuação e tentativas. O feedback fica salvo junto com a fila, permitindo recarregar sem perder a tentativa ou duplicar pontos.

O progresso é local ao navegador, sem conta ou sincronização. É possível reiniciar cada módulo com confirmação. Falhas de armazenamento exibem um aviso sem interromper a prática.

## Editar conteúdo

Os cinco arquivos `src/content/*.json` contêm título, resumo e questões. Cada questão usa um `id` único e estável, `prompt`, `answers` (lista de respostas aceitas), `explanation` e `origin` (`pdf` ou `extra`). `options` transforma a questão em múltipla escolha. Perguntas sem options usam resposta digitada. A correção ignora maiúsculas, acentos, espaços extras e pontuação; sinônimos precisam ser incluídos em answers.

Todos os exercícios únicos do PDF foram adaptados. O diálogo foi separado em quatro questões; o item BE da tabela aceita was/were; a atividade duplicada de transformação para o passado aparece uma vez. A comparação aberta de chuva foi adaptada para múltipla escolha. O texto de leitura está disponível no resumo de Climate of Brazil.

Para adicionar um módulo, crie um JSON e importe em `src/content/index.js`. Aumente `contentVersion` quando mudar IDs ou respostas de maneira incompatível com progresso anterior.

## GitHub Pages

O Vite usa `base: '/LearnLoop/'`. `.github/workflows/pages.yml` testa, compila e publica em cada push na branch `main`, além de execução manual. O job usa Node 22, `npm ci`, artefato de Pages e deploy oficial com OIDC.

Em Settings → Pages, a fonte deve ser **GitHub Actions**. O workflow tenta habilitar Pages automaticamente; se o token não tiver permissão para essa configuração inicial, um administrador precisa selecionar a fonte e executar novamente o workflow.

Endereço esperado: https://rafatosta.github.io/LearnLoop/
