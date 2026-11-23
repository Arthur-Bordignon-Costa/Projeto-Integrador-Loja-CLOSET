package com.closet.backendCloset.dto;

import java.util.List;

public record ProdutoResponseDTO(
        Long id,
        String nome,
        String descricao,
        String imagemUrl,
        Long categoriaId,
        String categoriaNome,
        List<ProdutoVariacaoResponseDTO> variacoes
) {
}