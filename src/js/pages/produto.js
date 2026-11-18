import { produtos } from "./catalogo.js";

const parametros = new URLSearchParams(window.location.search);
const idProduto = Number(parametros.get("id"));

const produto = produtos.find(item => item.id === idProduto);

if (!produto) {
    document.querySelector(".produtoDetalhes").innerHTML =
        "<p>Produto não encontrado. Volte ao catálogo e escolha outro produto.</p>";
} else {
    document.title = `${produto.nome} — CLOSET`;

    document.getElementById("nomeProduto").textContent = produto.nome;
    document.getElementById("categoriaProduto").textContent = produto.labelCategoria;
    document.getElementById("precoProduto").textContent = produto.preco;

    document.getElementById("descricaoProduto").textContent =
        `Conheça o ${produto.nome}, uma peça da nossa coleção ${produto.labelCategoria.toLowerCase()}. Entre em contato para saber mais sobre o produto e sua disponibilidade.`;

    const imagens = [
        document.getElementById("imagemPrincipal"),
        document.getElementById("imagemSecundaria1"),
        document.getElementById("imagemSecundaria2")
    ];

    imagens.forEach((imagem, indice) => {
        imagem.src = produto.imagem;
        imagem.alt = `${produto.nome} - imagem ${indice + 1}`;
    });

    const numeroTelefone = "554498986125";

    const mensagem = `Olá! Tenho interesse no produto ${produto.nome}, da CLOSET. Gostaria de saber mais sobre a disponibilidade.`;

    const linkWhatsApp =
        `https://wa.me/${numeroTelefone}?text=${encodeURIComponent(mensagem)}`;

    document.getElementById("btnInteresse").href = linkWhatsApp;
}
