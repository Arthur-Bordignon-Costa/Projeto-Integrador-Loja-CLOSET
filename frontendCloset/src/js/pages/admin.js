import { configurarNavegacao } from "./admin/navigation.js";
import { inicializarProdutos } from "./admin/products.js";
import { inicializarCategorias } from "./admin/categories.js";
import { estaLogado, fazerLogout } from "../auth.js";
import { mostrarToast } from "./admin/notifications.js";

async function iniciarAdmin() {
    if (!estaLogado()) {
        window.location.replace("/login.html");
        return;
    }

    const produtos = inicializarProdutos();
    const categorias = inicializarCategorias();

    configurarNavegacao({
        aoAbrirProdutos: produtos.renderizarTabela,
        aoAbrirCategorias: categorias.renderizarCategorias,
        aoSair: fazerLogout
    });

    const resultados = await Promise.allSettled([
        produtos.carregarProdutos(),
        categorias.carregarCategorias()
    ]);

    produtos.renderizarTabela();
    produtos.preencherSelectCategorias();
    categorias.renderizarCategorias();

    if (!estaLogado()) {
        window.location.replace("/login.html");
        return;
    }

    const erros = resultados
        .filter(resultado => resultado.status === "rejected")
        .map(resultado => resultado.reason.message);

    if (erros.length) {
        mostrarToast(erros.join(" "), "erro");
    }
}

iniciarAdmin();
