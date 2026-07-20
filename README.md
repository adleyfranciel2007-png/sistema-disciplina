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

## Observações

- Os dados (peso, alarmes, estudos, treinos, progresso) ficam salvos no
  `localStorage` do navegador — ou seja, ficam salvos **naquele navegador/dispositivo**.
  Se você abrir em outro navegador ou limpar os dados do site, o progresso não
  aparece lá.
- Os alarmes tocam com som e notificação enquanto a aba/app estiver aberto. Isso é
  uma limitação de apps web: para alarmes que funcionem com o celular travado como
  os nativos, seria necessário empacotar o app com algo como Capacitor/Expo — posso
  te ajudar com isso depois, se quiser.
