import { pegarDados, salvarDados } from "@/utils/banco";

export default function controlador(requisicao: any, resposta: any) {
  if (requisicao.method !== "POST") {
    return resposta.status(405).json({ mensagem: "Método errado." });
  }

  const emprestimoId = requisicao.body.emprestimoId;
  const listaDeIdsDosLivros = requisicao.body.livrosIds;

  if (!emprestimoId || !listaDeIdsDosLivros || listaDeIdsDosLivros.length === 0) {
    return resposta
      .status(400)
      .json({ mensagem: "Faltou o id do empréstimo ou dos livros." });
  }

  const bancoDeDados = pegarDados();
  let emprestimoEncontrado = null;

  for (let i = 0; i < bancoDeDados.emprestimos.length; i++) {
    const emprestimoAtual = bancoDeDados.emprestimos[i];
    if (emprestimoAtual.id === emprestimoId) {
      emprestimoEncontrado = emprestimoAtual;
      break;
    }
  }

  if (!emprestimoEncontrado) {
    return resposta.status(404).json({ mensagem: "Não achei o empréstimo." });
  }

  if (emprestimoEncontrado.status !== "ativo") {
    return resposta.status(400).json({ mensagem: "Esse empréstimo já acabou." });
  }

  if (!emprestimoEncontrado.livrosDevolvidos) {
    emprestimoEncontrado.livrosDevolvidos = [];
  }

  for (let i = 0; i < listaDeIdsDosLivros.length; i++) {
    const idDoLivroParaDevolver = listaDeIdsDosLivros[i];
    let livroPertenceAoEmprestimo = false;

    for (let j = 0; j < emprestimoEncontrado.livrosIds.length; j++) {
      if (emprestimoEncontrado.livrosIds[j] === idDoLivroParaDevolver) {
        livroPertenceAoEmprestimo = true;
        break;
      }
    }

    if (!livroPertenceAoEmprestimo) {
      return resposta.status(400).json({ 
        mensagem: "O livro " + idDoLivroParaDevolver + " não é desse empréstimo." 
      });
    }

    let oLivroJaFoiDevolvido = false;
    for (let j = 0; j < emprestimoEncontrado.livrosDevolvidos.length; j++) {
      if (emprestimoEncontrado.livrosDevolvidos[j] === idDoLivroParaDevolver) {
        oLivroJaFoiDevolvido = true;
        break;
      }
    }

    if (oLivroJaFoiDevolvido) {
      return resposta.status(400).json({ 
        mensagem: "O livro " + idDoLivroParaDevolver + " já foi devolvido antes." 
      });
    }
  }

  for (let i = 0; i < listaDeIdsDosLivros.length; i++) {
    const idDoLivroAtual = listaDeIdsDosLivros[i];

    for (let j = 0; j < bancoDeDados.livros.length; j++) {
      const livroNoEstoque = bancoDeDados.livros[j];
      
      if (livroNoEstoque.id === idDoLivroAtual) {
        if (livroNoEstoque.qtdEmprestados > 0) {
          livroNoEstoque.qtdEmprestados = livroNoEstoque.qtdEmprestados - 1;
        }
        break;
      }
    }
    emprestimoEncontrado.livrosDevolvidos.push(idDoLivroAtual);
  }

  if (emprestimoEncontrado.livrosDevolvidos.length === emprestimoEncontrado.livrosIds.length) {
    emprestimoEncontrado.status = "concluído";
    emprestimoEncontrado.dataDevolucao = new Date().toISOString();
  }

  salvarDados(bancoDeDados);

  return resposta.status(200).json({ 
    mensagem: "Devolvido com sucesso!", 
    emprestimo: emprestimoEncontrado 
  });
}