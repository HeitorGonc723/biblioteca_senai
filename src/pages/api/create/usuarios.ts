import { criarId, pegarDados, salvarDados } from "@/utils/banco";

export default function controlador(requisicao: any, resposta: any) {
  if (requisicao.method !== "POST") {
    return resposta.status(405).json({ mensagem: "Não pode usar esse método." });
  }

  const nome = requisicao.body.nome;
  const email = requisicao.body.email;
  const telefone = requisicao.body.telefone;

  if (!nome || !email || !telefone) {
    return resposta.status(400).json({ mensagem: "Faltou preencher alguma coisa." });
  }

  const bancoDeDados = pegarDados();
  const listaDeUsuarios = bancoDeDados.usuarios;

  for (let i = 0; i < listaDeUsuarios.length; i++) {
    const usuarioAtual = listaDeUsuarios[i];

    if (usuarioAtual.email === email) {
      return resposta.status(400).json({ 
        mensagem: "Esse email já está cadastrado." 
      });
    }
  }

  const novoUsuario = {
    id: criarId(),
    nome: nome,
    email: email,
    telefone: telefone,
  };

  listaDeUsuarios.push(novoUsuario);
  salvarDados(bancoDeDados);

  return resposta.status(201).json({ 
    mensagem: "Usuário cadastrado!", 
    usuario: novoUsuario 
  });
}