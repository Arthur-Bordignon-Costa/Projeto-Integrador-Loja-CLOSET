const numeroTelefone = "554498986125";
const mensagem = "Olá! Gostaria de saber mais sobre os produtos da CLOSET.";
const numeroWhatsApp = document.querySelectorAll(".numeroWhatsApp");
const localizacao = document.querySelectorAll(".localizacao");

numeroWhatsApp.forEach(botao => {
    botao.addEventListener("click", () => {
        window.open(`https://wa.me/${numeroTelefone}?text=${mensagem}`, "_blank");
    });
});

localizacao.forEach(botao => {
    botao.addEventListener("click", () => {
        window.open("https://www.google.com/maps/place/CLOSET+Foz/@-25.4966082,-54.5606457,17z/data=!3m1!4b1!4m6!3m5!1s0x94f691355c65afed:0xc4e58d899ead5d1f!8m2!3d-25.4966082!4d-54.5606457!16s%2Fg%2F11zkvqw344?entry=ttu&g_ep=EgoyMDI2MDkyMi4wIKXMDSoASAFQAw%3D%3D", "_blank");
    });
});

const btnMenu = document.getElementById("btnMenu");
const menuNavegacao = document.getElementById("menuNavegacao");

btnMenu.addEventListener("click", () => {
    menuNavegacao.classList.toggle("ativo");
});