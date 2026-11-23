package com.closet.backendCloset.dto;

import java.math.BigDecimal;

public record ProdutoVariacaoResponseDTO(
        Long id,
        BigDecimal preco,
        String tamanho,
        String cor,
        Integer estoque
) {
}