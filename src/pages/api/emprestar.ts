import { criarId, pegarDados, salvarDados } from "@/utils/banco";

export default function controlador(requisicao: any, resposta: any) {
  if (requisicao.method !== "POST") {
    return resposta.status(405).json({ mensagem: "Só aceitamos POST." });
  }

  const usuarioId = requisicao.body.usuarioId;
  const listaDeIdsDosLivros = requisicao.body.livrosIds;
  const dataDoEmprestimo = requisicao.body.dataEmprestimo;

  if (!usuarioId || !listaDeIdsDosLivros || listaDeIdsDosLivros.length === 0 || !dataDoEmprestimo) {
    return resposta
      .status(400)
      .json({ mensagem: "Falta o id do usuário, os livros ou a data!" });
  }

  const bancoDeDados = pegarDados();

  let usuarioEncontrado = null;
  for (let i = 0; i < bancoDeDados.usuarios.length; i++) {
    const usuarioAtual = bancoDeDados.usuarios[i];
    if (usuarioAtual.id === usuarioId) {
      usuarioEncontrado = usuarioAtual;
      break;
    }
  }

  if (!usuarioEncontrado) {
    return resposta.status(404).json({ mensagem: "Usuário não existe!" });
  }

  const livrosParaEmprestar = [];

  for (let j = 0; j < listaDeIdsDosLivros.length; j++) {
    const idDoLivroProcurado = listaDeIdsDosLivros[j];
    let livroEncontradoNoBanco = null;

    for (let k = 0; k < bancoDeDados.livros.length; k++) {
      const livroDoEstoque = bancoDeDados.livros[k];
      if (livroDoEstoque.id === idDoLivroProcurado) {
        livroEncontradoNoBanco = livroDoEstoque;
        break;
      }
    }

    if (!livroEncontradoNoBanco) {
      return resposta
        .status(404)
        .json({ mensagem: "Um dos livros não foi encontrado!" });
    }

    const quantidadeEmprestadaAtualmente = livroEncontradoNoBanco.qtdEmprestados || 0;

    if (livroEncontradoNoBanco.quantidade <= quantidadeEmprestadaAtualmente) {
      return resposta.status(400).json({
        mensagem: "O livro " + livroEncontradoNoBanco.titulo + " tá sem estoque.",
      });
    }

    livrosParaEmprestar.push(livroEncontradoNoBanco);
  }

  for (let l = 0; l < livrosParaEmprestar.length; l++) {
    const livroSendoProcessado = livrosParaEmprestar[l];
    livroSendoProcessado.qtdEmprestados = (livroSendoProcessado.qtdEmprestados || 0) + 1;
  }

  const novoEmprestimo = {
    id: criarId(),
    usuarioId: usuarioId,
    livrosIds: listaDeIdsDosLivros,
    dataEmprestimo: dataDoEmprestimo,
    status: "ativo",
    livrosDevolvidos: [],
  };

  bancoDeDados.emprestimos.push(novoEmprestimo);
  salvarDados(bancoDeDados);

  return resposta.status(201).json({ 
    mensagem: "Empréstimo feito!", 
    emprestimo: novoEmprestimo 
  });
}