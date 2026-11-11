async function carregarComponente(elemento, arquivo) {
    const response = await fetch(arquivo);

    if (!response.ok) {
        throw new Error(`Erro ao carregar ${arquivo}`);
    }

    const html = await response.text();

    document.querySelector(elemento).innerHTML = html;
}

const numeroTelefone = "554498986125";
const mensagem = "Olá! Gostaria de saber mais sobre os produtos da CLOSET.";

document.addEventListener("click", (evento) => {
    
    if (evento.target.closest(".numeroWhatsApp")) {
        window.open(`https://wa.me/${numeroTelefone}?text=${mensagem}`, "_blank");
        return;
    }

    if (evento.target.closest(".localizacao")) {
        window.open("https://www.google.com/maps/place/CLOSET+Foz/@-25.4966082,-54.5606457,17z/data=!3m1!4b1!4m6!3m5!1s0x94f691355c65afed:0xc4e58d899ead5d1f!8m2!3d-25.4966082!4d-54.5606457!16s%2Fg%2F11zkvqw344?entry=ttu&g_ep=EgoyMDI2MDkyMi4wIKXMDSoASAFQAw%3D%3D", "_blank");
        return;
    }

    if (evento.target.closest("#btnMenu")) {
        document.getElementById("menuNavegacao")?.classList.toggle("ativo");
    }
});

carregarComponente("#componentHeader", "src/components/header.html");
carregarComponente("#componentFooter", "src/components/footer.html");
