
package com.closet.backendCloset.controller;

import com.closet.backendCloset.dto.ProdutoRequestDTO;
import com.closet.backendCloset.dto.ProdutoResponseDTO;
import com.closet.backendCloset.dto.ProdutoVariacaoRequestDTO;
import com.closet.backendCloset.service.CloudinaryService;
import com.closet.backendCloset.service.ProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;
    private final CloudinaryService cloudinaryService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listar(
            @RequestParam(required = false) Long categoriaId
    ) {
        if (categoriaId != null) {
            return ResponseEntity.ok(produtoService.listarPorCategoria(categoriaId));
        }

        return ResponseEntity.ok(produtoService.listarProdutos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProdutoResponseDTO> cadastrar(
            @RequestParam String nome,
            @RequestParam(required = false) String descricao,
            @RequestParam Long categoriaId,
            @RequestParam String variacoesJson,
            @RequestParam MultipartFile foto
    ) throws IOException {

        List<ProdutoVariacaoRequestDTO> variacoes =
                objectMapper.readValue(
                        variacoesJson,
                        new TypeReference<>() {}
                );

        Map imagem = cloudinaryService.fazerUpload(foto);

        String imagemUrl = imagem.get("secure_url").toString();
        String imagemPublicId = imagem.get("public_id").toString();

        ProdutoRequestDTO dados = new ProdutoRequestDTO(
                nome,
                descricao,
                imagemUrl,
                categoriaId,
                imagemPublicId,
                variacoes
        );

        ProdutoResponseDTO produto = produtoService.cadastrarProduto(dados);

        return ResponseEntity.status(HttpStatus.CREATED).body(produto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProdutoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestParam String nome,
            @RequestParam(required = false) String descricao,
            @RequestParam Long categoriaId,
            @RequestParam String variacoesJson,
            @RequestParam(required = false) MultipartFile foto
    ) throws IOException {

        List<ProdutoVariacaoRequestDTO> variacoes =
                objectMapper.readValue(
                        variacoesJson,
                        new TypeReference<>() {}
                );

        String imagemUrl = null;
        String imagemPublicId = null;

        if (foto != null && !foto.isEmpty()) {
            Map imagem = cloudinaryService.fazerUpload(foto);

            imagemUrl = imagem.get("secure_url").toString();
            imagemPublicId = imagem.get("public_id").toString();
        }

        ProdutoRequestDTO dados = new ProdutoRequestDTO(
                nome,
                descricao,
                imagemUrl,
                categoriaId,
                imagemPublicId,
                variacoes
        );

        return ResponseEntity.ok(produtoService.atualizarProduto(id, dados));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) throws IOException {

        produtoService.excluirProduto(id);

        return ResponseEntity.noContent().build();
    }
}
