import { criarId, pegarDados, salvarDados } from "@/utils/banco";

export default function controlador(requisicao: any, resposta: any) {
  if (requisicao.method !== "POST") {
    return resposta.status(405).json({ mensagem: "Método errado." });
  }

  const titulo = requisicao.body.titulo;
  const genero = requisicao.body.genero;
  const autor = requisicao.body.autor;
  const quantidadeDigitada = requisicao.body.quantidade;

  if (!titulo || !genero || !autor || !quantidadeDigitada) {
    return resposta.status(400).json({ mensagem: "Preencha tudo do livro!" });
  }

  const quantidadeNumerica = Number(quantidadeDigitada);

  if (quantidadeNumerica <= 0) {
    return resposta.status(400).json({ mensagem: "A quantidade tá errada." });
  }

  const bancoDeDados = pegarDados();
  const listaDeLivros = bancoDeDados.livros;

  for (let i = 0; i < listaDeLivros.length; i++) {
    const livroAtual = listaDeLivros[i];

    if (livroAtual.titulo === titulo && livroAtual.autor === autor) {
      return resposta.status(400).json({ 
        mensagem: "Já temos esse livro com esse autor." 
      });
    }
  }

  const novoLivro = {
    id: criarId(),
    titulo: titulo,
    genero: genero,
    autor: autor,
    quantidade: quantidadeNumerica,
    qtdEmprestados: 0,
  };

  listaDeLivros.push(novoLivro);
  salvarDados(bancoDeDados);

  return resposta.status(201).json({ 
    mensagem: "Livro salvo!", 
    livro: novoLivro 
  });
}