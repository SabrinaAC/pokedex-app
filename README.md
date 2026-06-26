# 🔴 Pokédex App

Aplicativo mobile desenvolvido em React Native com Expo como Projeto Prático Integrador.


## 📱 Sobre o App

Pokédex interativa que permite explorar Pokémons, ver detalhes completos e salvar favoritos na nuvem.

## 🌐 API Utilizada
- **PokeAPI** — https://pokeapi.co
- Gratuita e sem autenticação

## ✅ Requisitos Implementados

- **Navegação**: React Navigation com Bottom Tabs + Stack (3 telas)
- **API Externa**: PokeAPI — lista, busca e detalhes de Pokémons
- **Firebase Firestore**: CRUD completo de favoritos
- **Animações**: bounce da imagem, barras de stats, botão favoritar, modal animado

## 🗂️ Telas

- **Pokédex** — navegação por ID, busca por nome, botão voltar ao início
- **Detalhes** — stats, habilidades, tipos, favoritar
- **Favoritos** — listar, editar apelido/nota, remover

## 🔥 Firebase
Banco: Firestore — coleção `favorites`
- Create: favoritar Pokémon
- Read: listar favoritos
- Update: editar apelido e anotação
- Delete: remover favorito
