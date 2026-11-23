const urlConfigurada = import.meta.env.VITE_API_URL || "";

export const BASE_URL = urlConfigurada.replace(/\/+$/, "");

const CHAVE_TOKEN = "closet_admin_token";
const CHAVE_TIPO_TOKEN = "closet_admin_token_type";

function obterOpcoesCookie() {
    return `Path=/; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

function obterCookie(chave) {
    const prefixo = `${chave}=`;
    const cookie = document.cookie
        .split(";")
        .map(item => item.trim())
        .find(item => item.startsWith(prefixo));

    return cookie ? decodeURIComponent(cookie.slice(prefixo.length)) : null;
}

export function salvarToken(token, tipo = "Bearer") {
    const opcoes = obterOpcoesCookie();
    document.cookie = `${CHAVE_TOKEN}=${encodeURIComponent(token)}; ${opcoes}`;
    document.cookie = `${CHAVE_TIPO_TOKEN}=${encodeURIComponent(tipo)}; ${opcoes}`;
    sessionStorage.removeItem(CHAVE_TOKEN);
    sessionStorage.removeItem(CHAVE_TIPO_TOKEN);
}

export function obterToken() {
    const token = obterCookie(CHAVE_TOKEN);
    if (token) return token;

    const tokenLegado = sessionStorage.getItem(CHAVE_TOKEN);
    if (tokenLegado) {
        const tipoLegado = sessionStorage.getItem(CHAVE_TIPO_TOKEN) || "Bearer";
        salvarToken(tokenLegado, tipoLegado);
    }

    return tokenLegado;
}

export function removerToken() {
    const opcoes = obterOpcoesCookie();
    document.cookie = `${CHAVE_TOKEN}=; Max-Age=0; ${opcoes}`;
    document.cookie = `${CHAVE_TIPO_TOKEN}=; Max-Age=0; ${opcoes}`;
    sessionStorage.removeItem(CHAVE_TOKEN);
    sessionStorage.removeItem(CHAVE_TIPO_TOKEN);
}

export function headersAuth() {
    const token = obterToken();
    if (!token) {
        throw new Error("Faça login novamente para continuar.");
    }

    const tipo = obterCookie(CHAVE_TIPO_TOKEN) || "Bearer";
    return { Authorization: `${tipo} ${token}` };
}

async function lerMensagemErro(resposta) {
    const texto = await resposta.text();
    if (!texto) return "";

    try {
        const erro = JSON.parse(texto);
        if (typeof erro.message === "string") return erro.message;
        if (typeof erro.detail === "string") return erro.detail;
        if (typeof erro.error === "string") return erro.error;
        if (Array.isArray(erro.errors)) {
            return erro.errors
                .map(item => item.defaultMessage || item.message || String(item))
                .join(" ");
        }
    } catch {
        return texto;
    }

    return texto;
}

async function requisitar(caminho, { metodo = "GET", dados, autenticada = false } = {}) {
    const headers = { Accept: "application/json" };
    const opcoes = { method: metodo, headers };

    if (dados !== undefined) {
        if (typeof FormData !== "undefined" && dados instanceof FormData) {
            opcoes.body = dados;
        } else {
            headers["Content-Type"] = "application/json";
            opcoes.body = JSON.stringify(dados);
        }
    }

    if (autenticada) {
        Object.assign(headers, headersAuth());
    }

    let resposta;
    try {
        resposta = await fetch(`${BASE_URL}${caminho}`, opcoes);
    } catch (erro) {
        if (erro instanceof TypeError) {
            throw new Error("Não foi possível conectar à API. Verifique o backend e a configuração de CORS.");
        }
        throw erro;
    }

    if (resposta.status === 401) {
        removerToken();
        if (caminho === "/api/auth/login") {
            throw new Error("Usuário ou senha incorretos.");
        }
        if (autenticada) {
            window.location.replace("/login.html");
        }
        throw new Error("Sua sessão expirou. Entre novamente.");
    }

    if (resposta.status === 403) {
        throw new Error("Seu usuário não tem permissão para realizar esta ação.");
    }

    if (!resposta.ok) {
        const mensagem = await lerMensagemErro(resposta);
        throw new Error(mensagem || `A API respondeu com erro (${resposta.status}).`);
    }

    if (resposta.status === 204) return null;

    const texto = await resposta.text();
    if (!texto) return null;

    try {
        return JSON.parse(texto);
    } catch {
        throw new Error("A API retornou uma resposta inválida.");
    }
}

export async function login(username, password) {
    const dados = await requisitar("/api/auth/login", {
        metodo: "POST",
        dados: { username, password }
    });

    if (!dados || typeof dados.token !== "string" || !dados.token.trim()) {
        throw new Error("A resposta do login não contém um token válido.");
    }

    const tipo = dados.tipo || "Bearer";
    if (tipo.toLowerCase() !== "bearer") {
        throw new Error("A API retornou um tipo de token não suportado.");
    }

    salvarToken(dados.token, tipo);
}

export function getProdutos() {
    return requisitar("/api/produtos");
}

export function getProduto(id) {
    return requisitar(`/api/produtos/${encodeURIComponent(id)}`);
}

export function criarProduto(dados) {
    return requisitar("/api/produtos", {
        metodo: "POST",
        dados,
        autenticada: true
    });
}

export function atualizarProduto(id, dados) {
    return requisitar(`/api/produtos/${encodeURIComponent(id)}`, {
        metodo: "PUT",
        dados,
        autenticada: true
    });
}

export function deletarProduto(id) {
    return requisitar(`/api/produtos/${encodeURIComponent(id)}`, {
        metodo: "DELETE",
        autenticada: true
    });
}

export function getCategorias() {
    return requisitar("/api/categorias");
}

export function criarCategoria(dados) {
    return requisitar("/api/categorias", {
        metodo: "POST",
        dados,
        autenticada: true
    });
}

export function atualizarCategoria(id, dados) {
    return requisitar(`/api/categorias/${encodeURIComponent(id)}`, {
        metodo: "PUT",
        dados,
        autenticada: true
    });
}

export function deletarCategoria(id) {
    return requisitar(`/api/categorias/${encodeURIComponent(id)}`, {
        metodo: "DELETE",
        autenticada: true
    });
}
