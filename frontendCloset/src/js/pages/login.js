import { estaLogado, fazerLogin } from "../auth.js";

// Se já estiver logado, vai direto pro painel
if (estaLogado()) {
    window.location.replace("/admin.html");
}

const formLogin  = document.getElementById("formLogin");
const inputUser  = document.getElementById("inputUsuario");
const inputSenha = document.getElementById("inputSenha");
const erroLogin  = document.getElementById("erroLogin");
const btnEntrar  = document.getElementById("btnEntrar");

formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    erroLogin.textContent = "";

    const usuario = inputUser.value.trim();
    const senha   = inputSenha.value;

    if (!usuario || !senha) {
        erroLogin.textContent = "Preencha usuário e senha.";
        return;
    }

    btnEntrar.disabled = true;
    try {
        await fazerLogin(usuario, senha);
        window.location.replace("/admin.html");
    } catch (erro) {
        erroLogin.textContent = erro.message || "Não foi possível entrar. Tente novamente.";
        inputSenha.value = "";
        inputSenha.focus();
    } finally {
        btnEntrar.disabled = false;
    }
});
