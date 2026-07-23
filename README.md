# Sistema — Disciplina

App pessoal (estilo "sistema" de Solo Leveling) com alarmes, grade de estudos e
treinos por dia da semana, cálculo de água e peso ideal, e conquistas.

## 1. Rodar no seu computador

Pré-requisito: ter o [Node.js](https://nodejs.org) instalado (versão 18 ou mais recente).

```bash
cd sistema-disciplina
npm install
npm run dev
```

Isso abre o app em `http://localhost:5173`. Enquanto estiver rodando, você acessa
esse mesmo endereço pelo navegador do celular se ele estiver na mesma rede Wi-Fi
do computador (troque `localhost` pelo IP local do computador, ex: `192.168.0.10:5173`).

## 2. Colocar o app online (para acessar de qualquer lugar, inclusive do celular)

A forma mais simples e gratuita é publicar no **Vercel** ou **Netlify**:

1. Crie uma conta em [vercel.com](https://vercel.com) ou [netlify.com](https://netlify.com).
2. Suba esta pasta para um repositório no GitHub.
3. Na Vercel/Netlify, clique em "New Project", conecte o repositório e mande importar.
   Ambos detectam automaticamente que é um projeto Vite — não precisa configurar nada.
4. Em 1-2 minutos você recebe um link tipo `https://sistema-disciplina.vercel.app`.

## 3. Instalar como app no celular (PWA)

Depois de publicado:

- **Android (Chrome):** abra o link, toque no menu (⋮) → "Adicionar à tela inicial".
- **iPhone (Safari):** abra o link, toque em Compartilhar → "Adicionar à Tela de Início".

Isso cria um ícone que abre o app em tela cheia, como um app nativo.

## O que mudou nessa versão

- Código reorganizado em módulos (`src/lib/`, `src/components/`) em vez de um arquivo só.
- Editar itens de estudo/treino sem precisar apagar e recriar.
- Confirmação antes de excluir qualquer item ou alarme.
- Aba **Progresso**: gráfico de conclusão de estudos/treinos dos últimos 7 dias.
- Aba **Corpo**: cálculo de calorias mais preciso (fórmula de Mifflin-St Jeor, usando idade/sexo/nível de atividade), além de um histórico de peso com gráfico.
- Aba **Config**: personalize o XP por missão, XP da meta de água, e a fórmula de água (ml por kg).
- Tutorial de boas-vindas na primeira abertura.
- Avisos na tela se o salvamento dos dados falhar (em vez de falhar silenciosamente).
- Ícones reais do app para quando for instalado na tela inicial.

## Próximo passo (fora do escopo deste pacote): sincronização em nuvem e notificações reais

Hoje os dados ficam só no navegador (`localStorage`) e os alarmes só tocam com a aba aberta.
Para ter sincronização entre celular/computador e notificações reais de alarme (com o
celular travado), o caminho é integrar um backend como o [Supabase](https://supabase.com)
(gratuito) — banco de dados + autenticação — e configurar Web Push com Service Worker.
Isso exige que você crie sua própria conta e chaves de API, então não dá pra deixar pronto
sem isso. Quando quiser seguir com essa parte, é só pedir que eu te guio passo a passo.

## Observações

- Os dados (peso, alarmes, estudos, treinos, progresso) ficam salvos no
  `localStorage` do navegador — ou seja, ficam salvos **naquele navegador/dispositivo**.
  Se você abrir em outro navegador ou limpar os dados do site, o progresso não
  aparece lá.
- Os alarmes tocam com som e notificação enquanto a aba/app estiver aberto. Isso é
  uma limitação de apps web: para alarmes que funcionem com o celular travado como
  os nativos, seria necessário empacotar o app com algo como Capacitor/Expo — posso
  te ajudar com isso depois, se quiser.
