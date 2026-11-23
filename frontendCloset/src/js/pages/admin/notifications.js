const toast = document.getElementById("toast");
let toastTimer;

export function mostrarToast(mensagem, tipo = "") {
    clearTimeout(toastTimer);
    toast.textContent = mensagem;
    toast.className = `toast${tipo ? ` ${tipo}` : ""} visivel`;
    toastTimer = setTimeout(() => {
        toast.className = "toast";
    }, 3500);
}
