# Plataforma de Cursos - Inova Cine

Uma plataforma moderna de cursos online construída com React, Tailwind CSS e Firebase.

## 🚀 Funcionalidades

- ✅ Autenticação de usuários (Login/Registro)
- ✅ Listagem de cursos
- ✅ Detalhes do curso
- ✅ Inscrição em cursos
- ✅ Dashboard do usuário
- ✅ Interface responsiva e moderna
- ✅ Integração com Firebase (Auth, Firestore, Storage)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse `http://localhost:5173` no seu navegador

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── CourseCard.jsx
│   └── ProtectedRoute.jsx
├── contexts/            # Contextos React
│   └── AuthContext.jsx
├── firebase/            # Configuração do Firebase
│   └── config.js
├── pages/               # Páginas da aplicação
│   ├── Home.jsx
│   ├── Courses.jsx
│   ├── CourseDetail.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Dashboard.jsx
├── App.jsx              # Componente principal
├── main.jsx             # Ponto de entrada
└── index.css            # Estilos globais
```

## 🔥 Configuração do Firebase

O Firebase já está configurado com suas credenciais. Certifique-se de que:

1. **Authentication** está habilitado no Firebase Console
2. **Firestore Database** está criado e configurado
3. **Storage** está habilitado (opcional, para imagens dos cursos)

### Estrutura do Firestore

#### Coleção: `courses`
```javascript
{
  title: "Nome do Curso",
  description: "Descrição do curso",
  category: "Categoria",
  price: 0, // ou número
  imageUrl: "URL da imagem",
  lessonsCount: 10,
  lessons: [
    { title: "Aula 1", description: "..." }
  ]
}
```

#### Coleção: `users`
```javascript
{
  name: "Nome do Usuário",
  email: "email@example.com",
  enrolledCourses: ["courseId1", "courseId2"],
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Personalização

- **Cores**: Edite `tailwind.config.js` para personalizar o tema
- **Estilos**: Modifique `src/index.css` para ajustar estilos globais

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## 🔐 Segurança

- As regras de segurança do Firestore devem ser configuradas no Firebase Console
- Recomenda-se implementar regras que protejam os dados dos usuários

## 📝 Próximos Passos

- Adicionar sistema de pagamento
- Implementar player de vídeo para as aulas
- Adicionar sistema de avaliações
- Implementar certificados digitais
- Adicionar área administrativa

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

