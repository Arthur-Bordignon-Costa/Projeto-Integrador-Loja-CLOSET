import { getProduto } from "../api.js";

const numeroTelefone = "554498986125";
const estadoProduto = document.getElementById("estadoProduto");
const produtoDetalhes = document.getElementById("produtoDetalhes");
const galeriaProduto = document.getElementById("galeriaProduto");
const informacoesProduto = document.getElementById("informacoesProduto");

function mostrarEstado(mensagem) {
    estadoProduto.textContent = mensagem;
    estadoProduto.hidden = false;
    galeriaProduto.hidden = true;
    informacoesProduto.hidden = true;
}

function obterImagemSegura(url) {
    if (typeof url !== "string" || !url.trim()) return "";

    try {
        const resolvida = new URL(url, window.location.origin);
        return ["http:", "https:"].includes(resolvida.protocol) ? resolvida.href : "";
    } catch {
        return "";
    }
}

function formatarPreco(preco) {
    return Number(preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function renderizarVariacoes(variacoes) {
    const lista = document.getElementById("variacoesProduto");
    lista.replaceChildren();

    if (!variacoes.length) {
        const item = document.createElement("li");
        item.textContent = "Consulte a disponibilidade pelo WhatsApp.";
        lista.appendChild(item);
        return;
    }

    variacoes.forEach(variacao => {
        const item = document.createElement("li");
        const nome = document.createElement("span");
        const preco = document.createElement("strong");
        const estoque = document.createElement("small");

        nome.textContent = [variacao.tamanho, variacao.cor].filter(Boolean).join(" · ")
            || "Variação";
        preco.textContent = Number.isFinite(Number(variacao.preco))
            ? formatarPreco(variacao.preco)
            : "Preço sob consulta";
        estoque.textContent = Number(variacao.estoque) > 0
            ? "Disponível"
            : "Indisponível";

        item.append(nome, preco, estoque);
        lista.appendChild(item);
    });
}

function renderizarProduto(produto) {
    if (!produto || produto.id == null) {
        mostrarEstado("Produto não encontrado. Volte ao catálogo e escolha outra peça.");
        return;
    }

    const nome = produto.nome || "Produto";
    const imagem = obterImagemSegura(produto.imagemUrl);
    const variacoes = Array.isArray(produto.variacoes) ? produto.variacoes : [];
    const precos = variacoes
        .map(variacao => Number(variacao.preco))
        .filter(preco => Number.isFinite(preco) && preco > 0);

    document.title = `${nome} — CLOSET`;
    document.getElementById("categoriaProduto").textContent = produto.categoriaNome || "CLOSET";
    document.getElementById("nomeProduto").textContent = nome;
    document.getElementById("precoProduto").textContent = precos.length
        ? `A partir de ${formatarPreco(Math.min(...precos))}`
        : "Preço sob consulta";
    document.getElementById("descricaoProduto").textContent =
        produto.descricao || "Entre em contato para saber mais sobre este produto.";
    renderizarVariacoes(variacoes);

    if (imagem) {
        const imagemElemento = document.getElementById("imagemProduto");
        imagemElemento.src = imagem;
        imagemElemento.alt = nome;
        galeriaProduto.hidden = false;
    }
    produtoDetalhes.classList.toggle("semImagem", !imagem);

    const mensagem = `Olá! Tenho interesse no produto ${nome}, da CLOSET. Gostaria de saber mais sobre a disponibilidade.`;
    document.getElementById("btnInteresse").href =
        `https://wa.me/${numeroTelefone}?text=${encodeURIComponent(mensagem)}`;

    estadoProduto.hidden = true;
    informacoesProduto.hidden = false;
}

async function carregarProduto() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id || !/^\d+$/.test(id)) {
        mostrarEstado("Produto não encontrado. Volte ao catálogo e escolha outra peça.");
        return;
    }

    try {
        const produto = await getProduto(id);
        renderizarProduto(produto);
    } catch (erro) {
        mostrarEstado(`Não foi possível carregar o produto: ${erro.message}`);
    }
}

carregarProduto();
