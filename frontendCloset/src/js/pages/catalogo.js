import { getCategorias, getProdutos } from "../api.js";

const filtrosLista = document.querySelector(".filtrosLista");
const produtosGrid = document.getElementById("produtosGrid");
let filtroAtivo = "todos";
const imagemFallback = "/img/logo/closet-logo-black.png";

function escaparHtml(valor = "") {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function obterImagemSegura(url) {
    if (typeof url !== "string" || !url.trim()) return "";

    try {
        const resolvida = new URL(url, window.location.origin);
        return ["http:", "https:"].includes(resolvida.protocol) ? url : "";
    } catch {
        return "";
    }
}

function criarBotaoFiltro(id, nome, ativo = false) {
    const item = document.createElement("li");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `filtroBotao${ativo ? " ativo" : ""}`;
    botao.dataset.filtro = id;
    botao.textContent = nome;
    item.appendChild(botao);
    return item;
}

function renderizarFiltros(categorias) {
    filtrosLista.replaceChildren(criarBotaoFiltro("todos", "Todos", true));
    categorias.forEach(categoria => {
        filtrosLista.appendChild(
            criarBotaoFiltro(String(categoria.id), categoria.nome)
        );
    });
}

function gerarCardProduto(produto) {
    const imagemOriginal = obterImagemSegura(produto.imagemUrl);
    const imagemUrl = imagemOriginal || imagemFallback;
    const classeImagem = imagemOriginal ? "" : " imagemProdutoFallback";
    const imagemHtml = `<img class="${classeImagem.trim()}" src="${escaparHtml(imagemUrl)}" alt="${escaparHtml(produto.nome)}" loading="lazy">`;
    const precos = Array.isArray(produto.variacoes)
        ? produto.variacoes
            .map(variacao => Number(variacao.preco))
            .filter(preco => Number.isFinite(preco) && preco > 0)
        : [];
    const preco = precos.length
        ? `A partir de ${Math.min(...precos).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`
        : "Preço sob consulta";

    return `
        <a class="produtoCard" href="/produto.html?id=${encodeURIComponent(produto.id)}" data-categoria="${escaparHtml(produto.categoriaId)}">
            <div class="produtoImagem">${imagemHtml}</div>
            <div class="produtoInfo">
                <span class="produtoNome">${escaparHtml(produto.nome)}</span>
                <span class="produtoCategoria">${escaparHtml(produto.categoriaNome || "")}</span>
                <span class="produtoPreco">${preco}</span>
            </div>
        </a>`;
}

function aplicarFiltro(categoriaId) {
    filtroAtivo = categoriaId;
    let visiveis = 0;

    produtosGrid.querySelectorAll(".produtoCard").forEach(card => {
        const pertence = filtroAtivo === "todos"
            || card.dataset.categoria === filtroAtivo;
        card.classList.toggle("oculto", !pertence);
        if (pertence) visiveis++;
    });

    const aviso = produtosGrid.querySelector(".nenhumResultado");
    if (aviso) aviso.classList.toggle("visivel", visiveis === 0);
}

function renderizarProdutos(produtos) {
    produtosGrid.innerHTML = produtos.map(gerarCardProduto).join("");
    produtosGrid.querySelectorAll("img:not(.imagemProdutoFallback)").forEach(imagem => {
        imagem.addEventListener("error", () => {
            imagem.src = imagemFallback;
            imagem.classList.add("imagemProdutoFallback");
        }, { once: true });
    });
    const aviso = document.createElement("p");
    aviso.className = "nenhumResultado";
    aviso.textContent = produtos.length
        ? "Nenhum produto encontrado nesta categoria."
        : "Nenhum produto cadastrado.";
    produtosGrid.appendChild(aviso);
    aplicarFiltro(filtroAtivo);
}

function selecionarFiltro(categoriaId) {
    const filtroExiste = [...filtrosLista.querySelectorAll(".filtroBotao")]
        .some(botao => botao.dataset.filtro === categoriaId);
    filtroAtivo = filtroExiste ? categoriaId : "todos";
    filtrosLista.querySelectorAll(".filtroBotao").forEach(botao => {
        botao.classList.toggle("ativo", botao.dataset.filtro === filtroAtivo);
    });
    aplicarFiltro(filtroAtivo);
}

function exibirErro(mensagem) {
    produtosGrid.replaceChildren();
    const aviso = document.createElement("p");
    aviso.className = "nenhumResultado visivel";
    aviso.textContent = mensagem;
    produtosGrid.appendChild(aviso);
}

filtrosLista.addEventListener("click", evento => {
    const botao = evento.target.closest(".filtroBotao");
    if (!botao) return;

    selecionarFiltro(botao.dataset.filtro);
});

async function carregarCatalogo() {
    try {
        const [categorias, produtos] = await Promise.all([
            getCategorias(),
            getProdutos()
        ]);

        if (!Array.isArray(categorias) || !Array.isArray(produtos)) {
            throw new Error("A API retornou dados inválidos para o catálogo.");
        }

        renderizarFiltros(categorias);
        renderizarProdutos(produtos);
        const categoriaSolicitada = new URLSearchParams(window.location.search)
            .get("categoriaId");
        if (categoriaSolicitada) selecionarFiltro(categoriaSolicitada);
    } catch (erro) {
        exibirErro(`Não foi possível carregar os produtos: ${erro.message}`);
    }
}

carregarCatalogo();
