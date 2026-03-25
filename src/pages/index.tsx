import { useEffect, useState } from "react";

export default function Home() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [livros, setLivros] = useState<any[]>([]);
  const [emprestimos, setEmprestimos] = useState<any[]>([]);
  const [aviso, setAviso] = useState({ texto: "", tipo: "sucesso" });

  const [formUsuario, setFormUsuario] = useState({ nome: "", email: "", telefone: "" });
  const [formLivro, setFormLivro] = useState({ titulo: "", genero: "", autor: "", quantidade: "" });
  const [formEmprestimo, setFormEmprestimo] = useState({ usuarioId: "", livrosIds: [] as any[], dataEmprestimo: "" });
  const [formDevolucao, setFormDevolucao] = useState({ emprestimoId: "", livrosIds: [] as any[] });

  async function buscarDados() {
    const resUsuarios = await fetch("/api/list/usuarios");
    const dadosUsuarios = await resUsuarios.json();
    setUsuarios(Array.isArray(dadosUsuarios) ? dadosUsuarios : dadosUsuarios.usuarios || []);

    const resLivros = await fetch("/api/list/livros");
    const dadosLivros = await resLivros.json();
    setLivros(Array.isArray(dadosLivros) ? dadosLivros : dadosLivros.livros || []);

    const resEmprestimos = await fetch("/api/list/emprestimos");
    const dadosEmprestimos = await resEmprestimos.json();
    setEmprestimos(Array.isArray(dadosEmprestimos) ? dadosEmprestimos : dadosEmprestimos.emprestimos || []);
  }

  async function salvar(url: string, dados: any) {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      setAviso({ texto: resultado.mensagem || "Sucesso!", tipo: "sucesso" });
      setFormUsuario({ nome: "", email: "", telefone: "" });
      setFormLivro({ titulo: "", genero: "", autor: "", quantidade: "" });
      setFormEmprestimo({ usuarioId: "", livrosIds: [], dataEmprestimo: "" });
      setFormDevolucao({ emprestimoId: "", livrosIds: [] });
      buscarDados();
    } else {
      setAviso({ texto: resultado.mensagem || "Erro na operação.", tipo: "erro" });
    }
  }

  function selecionarEmprestimoParaDevolver(id: string) {
    const emprestimo = emprestimos.find(e => e.id === id);
    if (emprestimo) {
      setFormDevolucao({ emprestimoId: id, livrosIds: emprestimo.livrosIds });
    } else {
      setFormDevolucao({ emprestimoId: "", livrosIds: [] });
    }
  }

  function toggleLivroSelecao(id: string) {
    let novaLista = [...formEmprestimo.livrosIds];
    if (novaLista.includes(id)) {
      novaLista = novaLista.filter(item => item !== id);
    } else {
      novaLista.push(id);
    }
    setFormEmprestimo({ ...formEmprestimo, livrosIds: novaLista });
  }

  useEffect(() => {
    buscarDados();
  }, []);

  const inputStyle = { width: "95%", marginBottom: 10, padding: 12, borderRadius: 12, border: "1px solid #ccc", fontWeight: "600" };
  
  const boxStyle: any = { 
    border: "1px solid #ccc", 
    padding: 20, 
    borderRadius: 12, 
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between" 
  };

  const buttonStyle = { fontWeight: "bold", cursor: "pointer", padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#4f46e5", color: "white", width: "fit-content" };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1>📚 Biblioteca Senai</h1>
        <p>Sistema Bibliotecário</p>
      </div>

      {aviso.texto && (
        <div style={{ backgroundColor: aviso.tipo === "erro" ? "#fee2e2" : "#dcfce7", color: aviso.tipo === "erro" ? "#b91c1c" : "#15803d", padding: 15, borderRadius: 8, marginBottom: 30, textAlign: "center", fontWeight: "bold" }}>
          {aviso.texto}
        </div>
      )}

      <div style={{ display: "grid", gap: 32, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "stretch" }}>
        
        <div style={boxStyle}>
          <div>
            <h2>👤 Registrar Usuário</h2>
            <input placeholder="Nome" value={formUsuario.nome} onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })} style={inputStyle} />
            <input placeholder="Email" value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} style={inputStyle} />
            <input placeholder="Telefone" value={formUsuario.telefone} onChange={(e) => setFormUsuario({ ...formUsuario, telefone: e.target.value })} style={inputStyle} />
          </div>
          <button style={buttonStyle} onClick={() => salvar("/api/create/usuarios", formUsuario)}>💾 Armazenar Usuário</button>
        </div>

        <div style={boxStyle}>
          <div>
            <h2>📖 Registrar Livro</h2>
            <input placeholder="Título" value={formLivro.titulo} onChange={(e) => setFormLivro({ ...formLivro, titulo: e.target.value })} style={inputStyle} />
            <input placeholder="Gênero" value={formLivro.genero} onChange={(e) => setFormLivro({ ...formLivro, genero: e.target.value })} style={inputStyle} />
            <input placeholder="Autor" value={formLivro.autor} onChange={(e) => setFormLivro({ ...formLivro, autor: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="Quantidade" value={formLivro.quantidade} onChange={(e) => setFormLivro({ ...formLivro, quantidade: e.target.value })} style={inputStyle} />
          </div>
          <button style={buttonStyle} onClick={() => salvar("/api/create/livros", formLivro)}>💾 Salvar Livro</button>
        </div>

        <div style={boxStyle}>
          <div>
            <h2>🤝 Realizar Empréstimo</h2>
            <select value={formEmprestimo.usuarioId} onChange={(e) => setFormEmprestimo({ ...formEmprestimo, usuarioId: e.target.value })} style={inputStyle as any}>
              <option value="">Selecione o usuário</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
            
            <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #ddd", padding: "10px", borderRadius: "8px", marginBottom: "10px", backgroundColor: "white" }}>
              <p style={{ fontSize: "12px", margin: "0 0 5px 0", fontWeight: "bold" }}>Selecione os Livros:</p>
              {livros.map((l) => {
                const estoqueDisponivel = l.quantidade - (l.qtdEmprestados || 0);
                return (
                  <div key={l.id} onClick={() => estoqueDisponivel > 0 ? toggleLivroSelecao(l.id) : null} style={{ cursor: estoqueDisponivel > 0 ? "pointer" : "not-allowed", padding: "5px", backgroundColor: formEmprestimo.livrosIds.includes(l.id) ? "#e0e7ff" : "transparent", borderRadius: "4px", color: estoqueDisponivel > 0 ? "black" : "#999", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
                    <span>{formEmprestimo.livrosIds.includes(l.id) ? "✅ " : "⬜ "} {l.titulo}</span>
                    <span style={{ color: estoqueDisponivel > 0 ? "#4f46e5" : "#e11d48", fontWeight: "bold" }}>{estoqueDisponivel} un.</span>
                  </div>
                );
              })}
            </div>
            <input type="date" value={formEmprestimo.dataEmprestimo} onChange={(e) => setFormEmprestimo({ ...formEmprestimo, dataEmprestimo: e.target.value })} style={inputStyle} />
          </div>
          <button style={buttonStyle} onClick={() => salvar("/api/emprestar", formEmprestimo)}>📤 Emprestar</button>
        </div>

        <div style={boxStyle}>
          <div>
            <h2>📥 Entregar Livros</h2>
            <select value={formDevolucao.emprestimoId} onChange={(e) => selecionarEmprestimoParaDevolver(e.target.value)} style={inputStyle as any}>
              <option value="">Selecione o empréstimo</option>
              {emprestimos.filter(e => e.status === "ativo").map((e) => (
                <option key={e.id} value={e.id}>ID: {e.id.substring(0,8)}</option>
              ))}
            </select>
          </div>
          <button style={buttonStyle} onClick={() => salvar("/api/devolver", formDevolucao)}>✅ Entregar</button>
        </div>

      </div>
    </main>
  );
}