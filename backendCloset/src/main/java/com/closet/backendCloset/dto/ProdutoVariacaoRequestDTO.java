package com.closet.backendCloset.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProdutoVariacaoRequestDTO(

        @NotNull(message = "O preço é obrigatório")
        @DecimalMin(value = "0.01")
        BigDecimal preco,

        @NotBlank(message = "O tamanho é obrigatório")
        String tamanho,

        @NotBlank(message = "A cor é obrigatória")
        String cor,

        @NotNull(message = "O estoque é obrigatório")
        @PositiveOrZero
        Integer estoque

) {
}