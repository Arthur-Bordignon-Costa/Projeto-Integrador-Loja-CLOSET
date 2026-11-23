let categorias = [];
let produtos = [];

export function obterCategorias() {
    return categorias;
}

export function atualizarCategorias(novasCategorias) {
    categorias = novasCategorias;
}

export function obterProdutos() {
    return produtos;
}

export function atualizarProdutos(novosProdutos) {
    produtos = novosProdutos;
}
