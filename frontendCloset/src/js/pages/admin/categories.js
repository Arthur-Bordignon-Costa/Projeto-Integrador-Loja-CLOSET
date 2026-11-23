import {
    getCategorias,
    criarCategoria,
    atualizarCategoria,
    deletarCategoria
} from "../../api.js";
import { obterCategorias, atualizarCategorias, obterProdutos } from "./state.js";
import { mostrarTela } from "./navigation.js";
import { mostrarToast } from "./notifications.js";
import { escaparHtml } from "./utils.js";
import { preencherSelectCategorias, renderizarTabela } from "./products.js";

const viewCategorias = document.getElementById("view-categorias");
const categoriasBody = document.getElementById("categoriasBody");
const tabelaCategorias = document.getElementById("tabelaCategorias");
const categoriasVazias = document.getElementById("categoriasVazias");
const btnNovaCategoria = document.getElementById("btnNovaCategoria");
const formCategoria = document.getElementById("formCategoria");
const categoriaId = document.getElementById("categoriaId");
const categoriaNome = document.getElementById("categoriaNome");
const categoriaFormTitulo = document.getElementById("categoriaFormTitulo");
const categoriaErro = document.getElementById("categoriaErro");
const btnVoltarCategorias = document.getElementById("btnVoltarCategorias");

function renderizarCategoria(categoria) {
    return `
        <tr>
            <td>${escaparHtml(categoria.nome)}</td>
            <td>
                <div class="acoes">
                    <button class="btnIcone btnEditar" data-acao="editar" data-id="${escaparHtml(categoria.id)}" title="Editar" aria-label="Editar ${escaparHtml(categoria.nome)}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="btnIcone btnIconePerigo" data-acao="excluir" data-id="${escaparHtml(categoria.id)}" title="Excluir" aria-label="Excluir ${escaparHtml(categoria.nome)}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
                </div>
            </td>
        </tr>`;
}

export function renderizarCategorias() {
    const categorias = obterCategorias();
    const temCategorias = categorias.length > 0;

    categoriasVazias.hidden = temCategorias;
    tabelaCategorias.hidden = !temCategorias;
    categoriasBody.innerHTML = categorias.map(renderizarCategoria).join("");
}

export async function carregarCategorias() {
    const dados = await getCategorias();
    if (!Array.isArray(dados)) {
        throw new Error("A API retornou uma lista de categorias inválida.");
    }

    atualizarCategorias(dados.map(categoria => {
        if (categoria.id == null || typeof categoria.nome !== "string") {
            throw new Error("A API retornou uma categoria em formato inválido.");
        }
        return { id: String(categoria.id), nome: categoria.nome };
    }));

    renderizarCategorias();
    preencherSelectCategorias();
}

function abrirFormularioNovaCategoria() {
    formCategoria.reset();
    categoriaId.value = "";
    categoriaFormTitulo.textContent = "Nova Categoria";
    categoriaErro.textContent = "";
    mostrarTela(document.getElementById("view-form-categoria"));
    categoriaNome.focus();
}

function abrirFormularioEdicaoCategoria(categoria) {
    formCategoria.reset();
    categoriaId.value = categoria.id;
    categoriaNome.value = categoria.nome;
    categoriaFormTitulo.textContent = "Editar Categoria";
    categoriaErro.textContent = "";
    mostrarTela(document.getElementById("view-form-categoria"));
    categoriaNome.focus();
}

function voltarParaCategorias() {
    categoriaErro.textContent = "";
    renderizarCategorias();
    mostrarTela(viewCategorias);
}

async function salvarCategoria(evento) {
    evento.preventDefault();
    categoriaErro.textContent = "";

    if (!formCategoria.reportValidity()) return;

    const id = categoriaId.value;
    const nome = categoriaNome.value.trim();
    if (!nome) {
        categoriaErro.textContent = "Informe o nome da categoria.";
        return;
    }

    const nomeExiste = obterCategorias().some(categoria =>
        categoria.nome.toLowerCase() === nome.toLowerCase()
        && categoria.id !== id
    );
    if (nomeExiste) {
        categoriaErro.textContent = "Essa categoria já existe.";
        return;
    }

    const btnSalvar = formCategoria.querySelector('[type="submit"]');
    btnSalvar.disabled = true;
    try {
        const resposta = id
            ? await atualizarCategoria(id, { nome })
            : await criarCategoria({ nome });

        if (!resposta || resposta.id == null || typeof resposta.nome !== "string") {
            throw new Error("A API retornou uma categoria em formato inválido.");
        }

        const categoriaSalva = {
            id: String(resposta.id),
            nome: resposta.nome
        };
        atualizarCategorias(id
            ? obterCategorias().map(categoria =>
                categoria.id === id ? categoriaSalva : categoria
              )
            : [...obterCategorias(), categoriaSalva]
        );

        preencherSelectCategorias();
        renderizarTabela();
        voltarParaCategorias();
        mostrarToast(id ? "Categoria atualizada!" : "Categoria cadastrada!");
    } catch (erro) {
        categoriaErro.textContent = erro.message;
    } finally {
        btnSalvar.disabled = false;
    }
}

async function confirmarExclusaoCategoria(categoria) {
    const categoriaEmUso = obterProdutos().some(produto =>
        produto.categoria === categoria.id
    );

    if (categoriaEmUso) {
        await Swal.fire({
            title: "Categoria em uso",
            text: "Não é possível excluir uma categoria que possui produtos vinculados.",
            icon: "warning",
            confirmButtonText: "Entendi",
            confirmButtonColor: "#1a1a1a"
        });
        return;
    }

    const resultado = await Swal.fire({
        title: "Confirmar exclusão?",
        text: `Deseja excluir a categoria ${categoria.nome}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e3342f",
        cancelButtonColor: "#3085d6"
    });
    if (!resultado.isConfirmed) return;

    try {
        await deletarCategoria(categoria.id);
        atualizarCategorias(obterCategorias().filter(item => item.id !== categoria.id));
        renderizarCategorias();
        preencherSelectCategorias();
        renderizarTabela();
        mostrarToast("Categoria removida!");
    } catch (erro) {
        mostrarToast(erro.message, "erro");
    }
}

export function inicializarCategorias() {
    categoriasBody.addEventListener("click", evento => {
        const botao = evento.target.closest("button[data-acao]");
        if (!botao) return;

        const categoria = obterCategorias().find(item =>
            item.id === botao.dataset.id
        );
        if (!categoria) return;

        if (botao.dataset.acao === "editar") {
            abrirFormularioEdicaoCategoria(categoria);
        } else if (botao.dataset.acao === "excluir") {
            confirmarExclusaoCategoria(categoria);
        }
    });

    btnNovaCategoria.addEventListener("click", abrirFormularioNovaCategoria);
    btnVoltarCategorias.addEventListener("click", voltarParaCategorias);
    formCategoria.addEventListener("submit", salvarCategoria);

    renderizarCategorias();
    return { renderizarCategorias, carregarCategorias };
}
