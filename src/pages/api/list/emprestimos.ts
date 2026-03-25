import { pegarDados } from '@/utils/banco';

export default function controlador(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Não pode GET aqui.' });
  }

  const banco = pegarDados();
  return res.status(200).json({ emprestimos: banco.emprestimos });
}