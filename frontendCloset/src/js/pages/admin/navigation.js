const telas = {
    produtos: document.getElementById("view-lista"),
    formularioProduto: document.getElementById("view-form"),
    categorias: document.getElementById("view-categorias"),
    formularioCategoria: document.getElementById("view-form-categoria")
};

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const navProdutos = document.getElementById("navProdutos");
const navCategorias = document.getElementById("navCategorias");

export function mostrarTela(tela) {
    Object.values(telas).forEach(item => {
        item.hidden = item !== tela;
    });

    const estaEmProdutos =
        tela === telas.produtos || tela === telas.formularioProduto;

    navProdutos.classList.toggle("ativo", estaEmProdutos);
    navCategorias.classList.toggle("ativo", !estaEmProdutos);
    fecharSidebar();
}

export function configurarNavegacao({ aoAbrirProdutos, aoAbrirCategorias, aoSair }) {
    const btnMenu = document.getElementById("btnMenu");
    const btnSair = document.getElementById("btnSair");

    function abrirSidebar() {
        sidebar.classList.add("aberta");
        sidebarOverlay.classList.add("ativo");
    }

    function fechar() {
        sidebar.classList.remove("aberta");
        sidebarOverlay.classList.remove("ativo");
    }

    function alternarSidebar() {
        if (sidebar.classList.contains("aberta")) {
            fechar();
        } else {
            abrirSidebar();
        }
    }

    btnMenu.addEventListener("click", alternarSidebar);
    sidebarOverlay.addEventListener("click", fechar);
    btnSair.addEventListener("click", () => {
        aoSair();
        window.location.replace("/login.html");
    });

    navProdutos.addEventListener("click", evento => {
        evento.preventDefault();
        mostrarTela(telas.produtos);
        aoAbrirProdutos();
    });

    navCategorias.addEventListener("click", evento => {
        evento.preventDefault();
        mostrarTela(telas.categorias);
        aoAbrirCategorias();
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && sidebar.classList.contains("aberta")) {
            fechar();
        }
    });
}

function fecharSidebar() {
    sidebar.classList.remove("aberta");
    sidebarOverlay.classList.remove("ativo");
}
