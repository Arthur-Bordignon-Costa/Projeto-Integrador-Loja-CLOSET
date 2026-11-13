const produtos = [
    {
        id: 1,
        nome: "Camisa Essencial",
        categoria: "casual",
        labelCategoria: "CASUAL",
        preco: "R$ 189,90",
        imagem: "./public/img/geral/teste2.jpg"
    },
    {
        id: 2,
        nome: "Conjunto Movimento",
        categoria: "esportivo",
        labelCategoria: "ESPORTIVO",
        preco: "R$ 329,90",
        imagem: "./public/img/geral/teste1.jpg"
    },
    {
        id: 3,
        nome: "Calça Alfaiataria",
        categoria: "esporte-fino",
        labelCategoria: "ESPORTE FINO",
        preco: "R$ 279,90",
        imagem: "./public/img/geral/teste4.jpg"
    },
    {
        id: 4,
        nome: "Vestido Elegance",
        categoria: "esporte-fino",
        labelCategoria: "ESPORTE FINO",
        preco: "R$ 349,90",
        imagem: "./public/img/geral/teste3.jpg"
    },
    {
        id: 5,
        nome: "Blusa Serena",
        categoria: "casual",
        labelCategoria: "CASUAL",
        preco: "R$ 169,90",
        imagem: "./public/img/geral/teste2.jpg"
    },
    {
        id: 6,
        nome: "Jeans Classic",
        categoria: "casual",
        labelCategoria: "CASUAL",
        preco: "R$ 229,90",
        imagem: "./public/img/geral/teste1.jpg"
    },
    {
        id: 7,
        nome: "Top Performance",
        categoria: "esportivo",
        labelCategoria: "ESPORTIVO",
        preco: "R$ 149,90",
        imagem: "./public/img/geral/porta-da-loja.png"
    },
    {
        id: 8,
        nome: "Conjunto Office",
        categoria: "esporte-fino",
        labelCategoria: "ESPORTE FINO",
        preco: "R$ 309,90",
        imagem: "./public/img/geral/teste3.jpg"
    }
];

function gerarCardProduto(produto) {
    const imagemHtml = produto.imagem
        ? `<img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">`
        : "";

    return `
        <article class="produtoCard" data-categoria="${produto.categoria}" data-id="${produto.id}">
            <div class="produtoImagem">
                ${imagemHtml}
            </div>
            <div class="produtoInfo">
                <span class="produtoNome">${produto.nome}</span>
                <span class="produtoCategoria">${produto.labelCategoria}</span>
                <span class="produtoPreco">${produto.preco}</span>
            </div>
        </article>
    `;
}

function renderizarProdutos() {
    const grid = document.getElementById("produtosGrid");
    if (!grid) return;

    grid.innerHTML = produtos.map(gerarCardProduto).join("") +
        `<p class="nenhumResultado" id="nenhumResultado">Nenhum produto encontrado nesta categoria.</p>`;
}

let filtroAtivo = "todos";

function aplicarFiltro(categoria) {
    filtroAtivo = categoria;

    const cards = document.querySelectorAll(".produtoCard");
    let visiveis = 0;

    cards.forEach(card => {
        const pertence = categoria === "todos" || card.dataset.categoria === categoria;
        card.classList.toggle("oculto", !pertence);
        if (pertence) visiveis++;
    });

    const aviso = document.getElementById("nenhumResultado");
    if (aviso) aviso.classList.toggle("visivel", visiveis === 0);
}

function configurarFiltros() {
    const botoes = document.querySelectorAll(".filtroBotao");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            botoes.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            aplicarFiltro(botao.dataset.filtro);
        });
    });
}

renderizarProdutos();
configurarFiltros();