import { login, obterToken, removerToken } from "./api.js";

export function estaLogado() {
    return Boolean(obterToken());
}

export function fazerLogin(usuario, senha) {
    return login(usuario, senha);
}

export function fazerLogout() {
    removerToken();
}
