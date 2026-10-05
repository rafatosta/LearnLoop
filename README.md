# LearnLoop Chronicles

Aventura de inglês inspirada em Demon Slayer, com personagens e inimigos originais. React + Vite + Tailwind CSS, doze personagens, quatro capítulos e vinte fases. A versão original com 68 exercícios continua em **Prática livre**, com seu armazenamento anterior preservado.

## Aventura

O banco `src/content/adventure.json` tem 120 questões-base, 30 por nível, com seis de cada assunto em cada nível. Cada questão tem `id`, `level`, `topic`, `promptPt`, `promptEn`, `answers`, `explanation`, `distractors`, `source` e `responseLanguage`. O enunciado muda de idioma; a resposta continua na língua pedida pela tarefa. Frases inglesas são mantidas nos exercícios de completar e transformar, mesmo com instruções em português.

Cada fase sorteia cinco questões únicas, misturando revisão com questões ainda não praticadas. Os capítulos usam níveis 1–2, 1–2, 2–3 e 3–4. O último confronto usa cinco questões de nível 4. Fases futuras ficam bloqueadas até concluir a atual. Não é necessário ver todas as 120 questões para terminar o mapa: o banco dá variedade às rodadas.

Questões de níveis 1 e 2 alternam entre escolha e escrita; níveis 3 e 4 começam escritos. Após uma tentativa com alternativas, uma revisão futura prioriza escrita. Erros voltam ao fim da fila com formato e idioma alternados, oferecendo apoio para aprender. O aluno pode consultar a tradução e o texto de leitura. Toda resposta, certa ou errada, recebe explicação. Questões escritas em revisão têm dica opcional.

Acertos valem 10 XP, ou 5 XP quando a dica é utilizada. A condição fica salva por questão durante o confronto, inclusive após recarregar ou errar novamente; vencer uma fase vale 25 XP. A vitória exige acertar todas as cinco questões. Sem vidas limitadas. O histórico registra acertos por formato. XP representa a prática; a fase concluída define a patente e a dificuldade seguinte.

Nome, avatar, sorteio, fila, feedback e histórico são salvos em `learnloop-adventure-v1` no localStorage. Criar outro personagem exige confirmação e reinicia apenas a aventura. Sem conta e sem sincronização entre dispositivos.

## Estrutura e edição

- `src/lib/adventure.js`: regras, fases, sorteio, correção e validação do progresso.
- `src/main.jsx`: personagem, mapa e confronto.
- `src/adventure.css`: interface responsiva e estilos da seleção de personagens.
- `src/Classic.jsx`: prática livre anterior.
- `src/content/*.json`: questões editáveis.

Ao alterar IDs ou esquema da aventura, atualize a versão e a chave do armazenamento. Respostas escritas são comparadas com `answers`, ignorando maiúsculas, acentos, espaços extras e pontuação. Acrescente variantes válidas à lista: a correção não usa inteligência artificial.

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

## As 13 formas: desafios de velocidade

A trilha da Respiração do Sol é independente das vinte fases do mapa. Os nomes seguem a lista fornecida pelo usuário. `src/lib/forms.js` define os treze desafios, com dificuldade progressiva de nível 1 até cinco questões de nível 4 no último desafio.

Cada tentativa sorteia cinco questões únicas do mesmo banco da aventura. O aluno deve acertar as cinco em **30 segundos no total**, tanto nas questões de alternativas quanto nas escritas. Alternativas enviam imediatamente; escritas usam Enter ou Responder. Erros voltam à fila em outro formato. O feedback curto aparece imediatamente, e todas as explicações ficam na revisão ao final, inclusive as questões pendentes.

O prazo absoluto é persistido: sair da tela, mudar de aba ou recarregar não pausa nem reinicia o relógio. Respostas enviadas no instante do término ou depois dele não contam. O tempo se esgota sem conquista; a tentativa seguinte tem novo sorteio e o mesmo nível. Formas conquistadas e XP são preservados. Cada acerto vale 10 XP, ou 5 se a dica foi utilizada. Os acertos também atualizam o histórico da aventura; conquistar uma forma não avança a floresta.

`src/Forms.jsx` contém a interface. O progresso é armazenado no campo `forms` do mesmo personagem, sem apagar dados antigos.

## Personagens

O conjunto tem 12 avatares: oito humanos (homens, mulheres, meninos e meninas), Kumo (cachorro), Capitu (capivara), Atlas e Volt (robôs originais inspirados em Transformers). Os quatro IDs antigos continuam válidos; atualizar o app não apaga o personagem nem o progresso.

`src/Avatar.jsx` desenha as ilustrações SVG. Os metadados ficam em `avatars`, em `src/lib/adventure.js`. `src/CharacterPicker.jsx` organiza a seleção em humanos, animais e robôs. A opção **Trocar personagem** no mapa altera só o campo avatar, preservando nome, XP, histórico, fases e formas conquistadas.
