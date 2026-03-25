import fs from 'fs';
import path from 'path';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
};

export type Livro = {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  quantidade: number;
  qtdEmprestados: number;
};

export type Emprestimo = {
  id: string;
  usuarioId: string;
  livrosIds: string[];
  dataEmprestimo: string;
  dataDevolucao?: string;
  status: 'ativo' | 'concluído';
  livrosDevolvidos?: string[];
};

export type Banco = {
  usuarios: Usuario[];
  livros: Livro[];
  emprestimos: Emprestimo[];
};

const arquivoDoBanco = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json');

export function pegarDados() {
  const dados = fs.readFileSync(arquivoDoBanco, 'utf-8');
  return JSON.parse(dados);
}

export function salvarDados(dados: any) {
  const texto = JSON.stringify(dados, null, 2);
  fs.writeFileSync(arquivoDoBanco, texto);
}

export function criarId() {
  return Math.random().toString(36).substring(2, 9);
}