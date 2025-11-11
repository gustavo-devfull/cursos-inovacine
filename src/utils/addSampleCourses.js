// Script para adicionar cursos de exemplo ao Firestore
// Execute este código no console do navegador ou crie uma página administrativa

import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const sampleCourses = [
  {
    title: "Introdução ao React",
    description: "Aprenda os fundamentos do React, incluindo componentes, props, estado e hooks. Este curso é perfeito para iniciantes que querem começar a desenvolver aplicações web modernas.",
    category: "Desenvolvimento Web",
    price: 0,
    lessonsCount: 12,
    lessons: [
      { title: "O que é React?", description: "Introdução ao React e seus conceitos fundamentais" },
      { title: "Configurando o ambiente", description: "Como configurar seu ambiente de desenvolvimento" },
      { title: "Primeiro componente", description: "Criando seu primeiro componente React" },
      { title: "Props e State", description: "Entendendo props e estado em React" },
      { title: "Hooks básicos", description: "useState, useEffect e outros hooks essenciais" }
    ]
  },
  {
    title: "Tailwind CSS do Zero",
    description: "Domine o Tailwind CSS e crie interfaces modernas e responsivas rapidamente. Aprenda utilitários, componentes e melhores práticas.",
    category: "Design",
    price: 49.90,
    lessonsCount: 10,
    lessons: [
      { title: "Introdução ao Tailwind", description: "O que é Tailwind CSS e por que usá-lo" },
      { title: "Instalação e configuração", description: "Como instalar e configurar o Tailwind" },
      { title: "Utilitários básicos", description: "Classes utilitárias mais usadas" },
      { title: "Layout e responsividade", description: "Criando layouts responsivos" },
      { title: "Componentes customizados", description: "Criando componentes reutilizáveis" }
    ]
  },
  {
    title: "Firebase para Iniciantes",
    description: "Aprenda a usar o Firebase para autenticação, banco de dados e storage. Construa aplicações full-stack sem backend tradicional.",
    category: "Backend",
    price: 79.90,
    lessonsCount: 15,
    lessons: [
      { title: "O que é Firebase?", description: "Introdução ao Firebase e seus serviços" },
      { title: "Configuração inicial", description: "Como configurar um projeto Firebase" },
      { title: "Firestore Database", description: "Trabalhando com Firestore" },
      { title: "Authentication", description: "Implementando autenticação de usuários" },
      { title: "Storage", description: "Armazenando arquivos no Firebase Storage" }
    ]
  },
  {
    title: "JavaScript Avançado",
    description: "Aprofunde seus conhecimentos em JavaScript com conceitos avançados como closures, promises, async/await e muito mais.",
    category: "Programação",
    price: 59.90,
    lessonsCount: 20,
    lessons: [
      { title: "Closures e Escopo", description: "Entendendo closures e escopo em JavaScript" },
      { title: "Promises", description: "Trabalhando com Promises" },
      { title: "Async/Await", description: "Programação assíncrona moderna" },
      { title: "ES6+ Features", description: "Recursos modernos do JavaScript" },
      { title: "Design Patterns", description: "Padrões de design em JavaScript" }
    ]
  },
  {
    title: "UI/UX Design",
    description: "Aprenda os princípios de design de interface e experiência do usuário. Crie designs que sejam bonitos e funcionais.",
    category: "Design",
    price: 89.90,
    lessonsCount: 14,
    lessons: [
      { title: "Princípios de Design", description: "Fundamentos do design visual" },
      { title: "Tipografia", description: "Escolhendo e usando fontes" },
      { title: "Cores e Contraste", description: "Teoria das cores em design" },
      { title: "Wireframing", description: "Criando wireframes eficazes" },
      { title: "Prototipagem", description: "Criando protótipos interativos" }
    ]
  }
]

export async function addSampleCourses() {
  try {
    const coursesRef = collection(db, 'courses')
    const promises = sampleCourses.map(course => addDoc(coursesRef, course))
    await Promise.all(promises)
    console.log('Cursos de exemplo adicionados com sucesso!')
    return true
  } catch (error) {
    console.error('Erro ao adicionar cursos:', error)
    return false
  }
}

// Para usar: importe e chame addSampleCourses() em uma página administrativa ou no console

