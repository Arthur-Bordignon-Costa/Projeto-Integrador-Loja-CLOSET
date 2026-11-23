import {
    getProdutos,
    criarProduto,
    atualizarProduto,
    deletarProduto
} from "../../api.js";
import { obterCategorias, obterProdutos, atualizarProdutos } from "./state.js";
import { mostrarTela } from "./navigation.js";
import { mostrarToast } from "./notifications.js";
import { escaparHtml } from "./utils.js";

const viewLista = document.getElementById("view-lista");
const viewForm = document.getElementById("view-form");
const tabelaBody = document.getElementById("tabelaBody");
const tabela = document.getElementById("tabelaProdutos");
const tabelaVazia = document.getElementById("tabelaVazia");
const btnNovoProduto = document.getElementById("btnNovoProduto");
const formProduto = document.getElementById("formProduto");
const formTitulo = document.getElementById("formTitulo");
const produtoId = document.getElementById("produtoId");
const produtoNome = document.getElementById("produtoNome");
const produtoCategoria = document.getElementById("produtoCategoria");
const produtoDescricao = document.getElementById("produtoDescricao");
const listaVariantes = document.getElementById("listaVariantes");
const btnAddVariante = document.getElementById("btnAddVariante");
const btnVoltarLista = document.getElementById("btnVoltarLista");
const btnSalvar = formProduto.querySelector('[type="submit"]');
const formErro = document.getElementById("formErro");
const uploadArea = document.getElementById("uploadArea");
const inputImagem = document.getElementById("inputImagem");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const uploadPreview = document.getElementById("uploadPreview");
const previewImg = document.getElementById("previewImg");
const btnRemoverImagem = document.getElementById("btnRemoverImagem");
const uploadAviso = document.getElementById("uploadAviso");

let imagemAtual = "";
let imagemUrlOriginal = "";
let arquivoImagemAtual = null;
let permiteUploadImagem = true;

function mapearProduto(dados) {
    if (!dados || dados.id == null || dados.categoriaId == null) {
        throw new Error("A API retornou um produto em formato inválido.");
    }

    const id = String(dados.id);
    const imagemUrl = dados.imagemUrl || "";
    return {
        id,
        nome: dados.nome || "",
        categoria: String(dados.categoriaId),
        categoriaNome: dados.categoriaNome || "",
        descricao: dados.descricao || "",
        imagemUrl,
        imagem: imagemUrl,
        variantes: Array.isArray(dados.variacoes)
            ? dados.variacoes.map(variacao => ({
                tamanho: variacao.tamanho,
                cor: variacao.cor,
                preco: Number(variacao.preco),
                quantidade: Number(variacao.estoque)
            }))
            : []
    };
}

export async function carregarProdutos() {
    const dados = await getProdutos();
    if (!Array.isArray(dados)) {
        throw new Error("A API retornou uma lista de produtos inválida.");
    }

    atualizarProdutos(dados.map(mapearProduto));
    renderizarTabela();
}

function formatarCategoria(id, nomeAlternativo) {
    const categoria = obterCategorias().find(item => item.id === id);
    return categoria ? categoria.nome : nomeAlternativo || "—";
}

export function preencherSelectCategorias() {
    produtoCategoria.innerHTML = '<option value="">Selecione...</option>';

    obterCategorias().forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria.id;
        option.textContent = categoria.nome;
        produtoCategoria.appendChild(option);
    });
}

function renderizarProduto(produto) {
    const variantes = Array.isArray(produto.variantes) ? produto.variantes : [];
    const estoqueTotal = variantes.reduce(
        (total, variante) => total + (Number(variante.quantidade) || 0),
        0
    );
    const badges = variantes.length
        ? variantes.map(variante =>
            `<span class="badge">${escaparHtml(variante.tamanho)} - ${escaparHtml(variante.cor)} (${Number(variante.quantidade) || 0} un)</span>`
        ).join("")
        : '<span style="color:#bbb;font-size:0.8rem">—</span>';
    const imagem = produto.imagem
        ? `<img src="${escaparHtml(produto.imagem)}" alt="${escaparHtml(produto.nome)}" class="produtoThumb" />`
        : '<div class="semThumb" aria-hidden="true">👕</div>';

    return `
        <tr>
            <td>
                <div class="celulaProduto">
                    ${imagem}
                    <div class="produtoInfo">
                        <strong>${escaparHtml(produto.nome)}</strong>
                        <small>${escaparHtml(produto.descricao)}</small>
                    </div>
                </div>
            </td>
            <td>${escaparHtml(formatarCategoria(produto.categoria, produto.categoriaNome))}</td>
            <td><div class="variantesBadges">${badges}</div></td>
            <td><span class="estoqueTotal">${estoqueTotal > 0 ? `${estoqueTotal} un` : "—"}</span></td>
            <td>
                <div class="acoes">
                    <button class="btnIcone btnEditar" data-acao="editar" data-id="${escaparHtml(produto.id)}" title="Editar" aria-label="Editar ${escaparHtml(produto.nome)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btnIcone btnIconePerigo btnExcluir" data-acao="excluir" data-id="${escaparHtml(produto.id)}" title="Excluir" aria-label="Excluir ${escaparHtml(produto.nome)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>`;
}

export function renderizarTabela() {
    const produtos = obterProdutos();
    const temProdutos = produtos.length > 0;
    tabelaVazia.hidden = temProdutos;
    tabela.hidden = !temProdutos;
    tabelaBody.innerHTML = produtos.map(renderizarProduto).join("");
}

function criarLinhaVariante(variante = {}) {
    const item = document.createElement("div");
    item.className = "varianteItem";
    item.innerHTML = `
        <span class="varianteLabel"></span>
        <div class="varianteColunas">
            <div class="varianteCampo">
                <label>Tam</label>
                <select required aria-label="Tamanho">
                    <option value="">Selecione</option>
                    <option value="PP">PP</option>
                    <option value="P">P</option>
                    <option value="M">M</option>
                    <option value="G">G</option>
                    <option value="GG">GG</option>
                    <option value="U">Único</option>
                </select>
            </div>
            <div class="varianteCampo">
                <label>Cor</label>
                <input type="text" placeholder="Ex: Verde Oliva" required />
            </div>
            <div class="varianteCampo">
                <label>Preço (R$)</label>
                <input type="number" placeholder="0,00" min="0.01" step="0.01" required />
            </div>
            <div class="varianteCampo">
                <label>Qtd Estoque</label>
                <input type="number" placeholder="0" min="0" step="1" required />
            </div>
            <button type="button" class="btnRemoverVariante" title="Remover variante" aria-label="Remover variante">✕</button>
        </div>`;

    const campos = item.querySelectorAll("select, input");
    campos[0].value = variante.tamanho || "";
    campos[1].value = variante.cor || "";
    campos[2].value = variante.preco ?? "";
    campos[3].value = variante.quantidade ?? "";
    item.querySelector(".btnRemoverVariante").addEventListener("click", () => {
        item.remove();
        atualizarRotulosVariantes();
    });

    return item;
}

function atualizarRotulosVariantes() {
    listaVariantes.querySelectorAll(".varianteLabel").forEach((label, indice) => {
        label.textContent = `ITEM #${indice + 1}`;
    });
}

function adicionarVariante(variante) {
    listaVariantes.appendChild(criarLinhaVariante(variante));
    atualizarRotulosVariantes();
}

function limparImagem() {
    imagemAtual = "";
    imagemUrlOriginal = "";
    arquivoImagemAtual = null;
    inputImagem.value = "";
    previewImg.removeAttribute("src");
    uploadPreview.hidden = true;
    uploadPlaceholder.hidden = false;
    atualizarBotaoRemoverImagem();
}

function atualizarBotaoRemoverImagem() {
    btnRemoverImagem.hidden = !imagemAtual || Boolean(produtoId.value && !arquivoImagemAtual);
}

function definirImagem(src, urlOriginal = imagemUrlOriginal, arquivo = null) {
    imagemAtual = src;
    imagemUrlOriginal = urlOriginal;
    arquivoImagemAtual = arquivo;
    previewImg.src = src;
    uploadPreview.hidden = false;
    uploadPlaceholder.hidden = true;
    atualizarBotaoRemoverImagem();
}

function definirDisponibilidadeUpload(disponivel) {
    permiteUploadImagem = disponivel;
    uploadArea.setAttribute("aria-disabled", String(!disponivel));
    uploadArea.setAttribute("aria-required", String(!produtoId.value));
    uploadArea.tabIndex = disponivel ? 0 : -1;
    uploadArea.classList.toggle("desabilitado", !disponivel);
    atualizarBotaoRemoverImagem();
    uploadAviso.textContent = produtoId.value
        ? "A imagem atual será mantida se você não selecionar outra."
        : "A foto é obrigatória no cadastro e será enviada ao servidor.";
}

function voltarParaLista() {
    formErro.textContent = "";
    mostrarTela(viewLista);
    renderizarTabela();
}

function abrirFormularioNovo() {
    preencherSelectCategorias();
    formProduto.reset();
    produtoId.value = "";
    formTitulo.textContent = "Cadastrar Nova Peça no Catálogo";
    btnSalvar.textContent = "Salvar Alterações no Sistema";
    formErro.textContent = "";
    definirDisponibilidadeUpload(true);
    limparImagem();
    listaVariantes.innerHTML = "";
    adicionarVariante();
    mostrarTela(viewForm);
    produtoNome.focus();
}

function abrirFormularioEdicao(produto) {
    formProduto.reset();
    produtoId.value = produto.id;
    produtoNome.value = produto.nome || "";
    preencherSelectCategorias();
    produtoCategoria.value = produto.categoria || "";
    produtoDescricao.value = produto.descricao || "";
    formTitulo.textContent = "Editar Produto Selecionado";
    btnSalvar.textContent = "Salvar Alterações no Sistema";
    formErro.textContent = "";
    arquivoImagemAtual = null;
    definirDisponibilidadeUpload(true);
    if (produto.imagemUrl) {
        definirImagem(produto.imagemUrl, produto.imagemUrl);
    } else {
        limparImagem();
    }

    listaVariantes.innerHTML = "";
    const variantes = Array.isArray(produto.variantes) ? produto.variantes : [];
    if (variantes.length) {
        variantes.forEach(adicionarVariante);
    } else {
        adicionarVariante();
    }

    mostrarTela(viewForm);
    produtoNome.focus();
}

async function lerImagem(file) {
    if (!file || !file.type.startsWith("image/")) {
        formErro.textContent = "Selecione um arquivo de imagem válido.";
        return;
    }

    try {
        const imagem = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Não foi possível ler a imagem selecionada."));
            reader.readAsDataURL(file);
        });
        if (typeof imagem !== "string") {
            throw new Error("Não foi possível gerar a prévia da imagem.");
        }
        definirImagem(imagem, imagemUrlOriginal, file);
        uploadArea.removeAttribute("aria-invalid");
        formErro.textContent = "";
    } catch (erro) {
        formErro.textContent = erro.message;
    }
}

function lerVariantes() {
    return [...listaVariantes.querySelectorAll(".varianteItem")].map(item => {
        const campos = item.querySelectorAll("select, input");
        return {
            tamanho: campos[0].value,
            cor: campos[1].value.trim(),
            preco: Number(campos[2].value),
            quantidade: Number(campos[3].value)
        };
    });
}

async function salvarProduto(evento) {
    evento.preventDefault();
    formErro.textContent = "";

    if (!formProduto.reportValidity()) return;

    const variantes = lerVariantes();
    if (!variantes.length) {
        formErro.textContent = "Adicione pelo menos uma variante.";
        return;
    }

    const id = produtoId.value;
    if (!id && !arquivoImagemAtual) {
        formErro.textContent = "Selecione uma foto para cadastrar o produto.";
        uploadArea.setAttribute("aria-invalid", "true");
        uploadArea.focus();
        return;
    }

    const formulario = new FormData();
    formulario.append("nome", produtoNome.value.trim());
    formulario.append("descricao", produtoDescricao.value.trim());
    formulario.append("categoriaId", produtoCategoria.value);
    formulario.append("variacoesJson", JSON.stringify(
        variantes.map(variante => ({
            tamanho: variante.tamanho,
            cor: variante.cor,
            preco: variante.preco,
            estoque: variante.quantidade
        }))
    ));
    if (arquivoImagemAtual) {
        formulario.append("foto", arquivoImagemAtual);
    }

    btnSalvar.disabled = true;
    try {
        let resposta;
        if (id) {
            resposta = await atualizarProduto(id, formulario);
        } else {
            resposta = await criarProduto(formulario);
        }

        const produtoSalvo = mapearProduto(resposta);

        atualizarProdutos(id
            ? obterProdutos().map(item =>
                String(item.id) === String(produtoSalvo.id) ? produtoSalvo : item
            )
            : [...obterProdutos(), produtoSalvo]
        );
        mostrarToast(id ? "Produto atualizado!" : "Produto cadastrado!");
        voltarParaLista();
    } catch (erro) {
        formErro.textContent = erro.message;
    } finally {
        btnSalvar.disabled = false;
    }
}

async function confirmarExclusao(produto) {
    const resultado = await Swal.fire({
        title: "Confirmar exclusão?",
        imageUrl: produto.imagem || undefined,
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: produto.nome,
        html: `<strong>${escaparHtml(produto.nome)}</strong><p>Você tem certeza que deseja deletar o produto?<br><span style="color:#d9534f">Esta ação não pode ser desfeita!</span></p>`,
        showCancelButton: true,
        confirmButtonText: "Sim, deletar!",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e3342f",
        cancelButtonColor: "#3085d6"
    });

    if (!resultado.isConfirmed) return;

    try {
        await deletarProduto(produto.id);
        atualizarProdutos(obterProdutos().filter(item =>
            String(item.id) !== String(produto.id)
        ));
        renderizarTabela();
        mostrarToast("Produto removido!");
    } catch (erro) {
        mostrarToast(erro.message, "erro");
    }
}

export function inicializarProdutos() {
    tabelaBody.addEventListener("click", evento => {
        const botao = evento.target.closest("button[data-acao]");
        if (!botao) return;

        const produto = obterProdutos().find(item =>
            String(item.id) === botao.dataset.id
        );
        if (!produto) return;

        if (botao.dataset.acao === "editar") {
            abrirFormularioEdicao(produto);
        } else if (botao.dataset.acao === "excluir") {
            confirmarExclusao(produto);
        }
    });

    btnNovoProduto.addEventListener("click", abrirFormularioNovo);
    btnVoltarLista.addEventListener("click", voltarParaLista);
    btnAddVariante.addEventListener("click", () => adicionarVariante());
    formProduto.addEventListener("submit", salvarProduto);

    uploadArea.addEventListener("click", evento => {
        if (permiteUploadImagem && evento.target !== btnRemoverImagem) {
            inputImagem.click();
        }
    });
    uploadArea.addEventListener("keydown", evento => {
        if (permiteUploadImagem && (evento.key === "Enter" || evento.key === " ")) {
            evento.preventDefault();
            inputImagem.click();
        }
    });
    inputImagem.addEventListener("change", () => {
        if (permiteUploadImagem) lerImagem(inputImagem.files[0]);
    });
    btnRemoverImagem.addEventListener("click", () => {
        if (!imagemAtual) return;
        if (produtoId.value && imagemUrlOriginal) {
            arquivoImagemAtual = null;
            inputImagem.value = "";
            definirImagem(imagemUrlOriginal, imagemUrlOriginal);
        } else {
            limparImagem();
        }
    });

    uploadArea.addEventListener("dragover", evento => {
        evento.preventDefault();
        if (!permiteUploadImagem) return;
        uploadArea.classList.add("dragover");
    });
    uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragover");
    });
    uploadArea.addEventListener("drop", evento => {
        evento.preventDefault();
        if (!permiteUploadImagem) return;
        uploadArea.classList.remove("dragover");
        lerImagem(evento.dataTransfer.files[0]);
    });
    document.addEventListener("paste", evento => {
        if (viewForm.hidden || !permiteUploadImagem) return;
        const imagemColada = [...evento.clipboardData.items]
            .find(item => item.type.startsWith("image/"));
        if (imagemColada) lerImagem(imagemColada.getAsFile());
    });

    preencherSelectCategorias();
    renderizarTabela();
    return { renderizarTabela, preencherSelectCategorias, carregarProdutos };
}