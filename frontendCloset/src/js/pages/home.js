import { getCategorias, getProdutos } from "../api.js";

const colecoesGrid = document.getElementById("colecoesGrid");
const imagemFallback = "/img/logo/closet-logo-black.png";

function obterImagemSegura(url) {
    if (typeof url !== "string" || !url.trim()) return "";

    try {
        const resolvida = new URL(url, window.location.origin);
        return ["http:", "https:"].includes(resolvida.protocol) ? resolvida.href : "";
    } catch {
        return "";
    }
}

function criarCardColecao(categoria, indice, produtos) {
    const produto = produtos.find(item =>
        String(item.categoriaId) === String(categoria.id)
    );
    const imagemProduto = obterImagemSegura(produto && produto.imagemUrl);
    const imagem = document.createElement("img");
    imagem.src = imagemProduto || imagemFallback;
    imagem.alt = imagemProduto
        ? `${categoria.nome} — ${produto.nome}`
        : `Logo CLOSET — ${categoria.nome}`;
    if (!imagemProduto) imagem.classList.add("imagemColecaoFallback");
    imagem.addEventListener("error", () => {
        imagem.src = imagemFallback;
        imagem.classList.add("imagemColecaoFallback");
    }, { once: true });

    const card = document.createElement("article");
    card.className = "card";

    const areaImagem = document.createElement("div");
    areaImagem.className = "card-image";
    areaImagem.appendChild(imagem);

    const conteudo = document.createElement("div");
    conteudo.className = "card-content";

    const numero = document.createElement("span");
    numero.className = "card-number";
    numero.textContent = String(indice + 1).padStart(2, "0");

    const nome = document.createElement("h3");
    nome.textContent = categoria.nome;

    const link = document.createElement("a");
    link.href = `/catalogo.html?categoriaId=${encodeURIComponent(categoria.id)}`;
    link.textContent = "VER COLEÇÃO →";

    conteudo.append(numero, nome, link);
    card.append(areaImagem, conteudo);
    return card;
}

async function carregarColecoes() {
    try {
        const [categorias, produtos] = await Promise.all([
            getCategorias(),
            getProdutos()
        ]);
        if (!Array.isArray(categorias) || !Array.isArray(produtos)) {
            throw new Error("A API retornou dados inválidos para as coleções.");
        }

        const categoriasExibidas = categorias.slice(0, 4);
        if (!categoriasExibidas.length) {
            colecoesGrid.replaceChildren();
            const estado = document.createElement("p");
            estado.className = "colecoesEstado";
            estado.textContent = "Nenhuma categoria cadastrada.";
            colecoesGrid.appendChild(estado);
            return;
        }

        colecoesGrid.replaceChildren(
            ...categoriasExibidas.map((categoria, indice) =>
                criarCardColecao(categoria, indice, produtos)
            )
        );
    } catch (erro) {
        colecoesGrid.replaceChildren();
        const estado = document.createElement("p");
        estado.className = "colecoesEstado";
        estado.textContent = `Não foi possível carregar as categorias: ${erro.message}`;
        colecoesGrid.appendChild(estado);
    }
}

carregarColecoes();