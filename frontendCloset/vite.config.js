export default {
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true
            }
        }
    },
    build: {
        rollupOptions: {
            input: ["index.html", "catalogo.html", "produto.html", "admin.html", "login.html"]
        }
    }
};
