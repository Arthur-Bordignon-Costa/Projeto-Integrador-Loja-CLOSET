package com.closet.backendCloset.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record ProdutoRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 150)
        String nome,

        String descricao,

        @Size(max = 500)
        String imagemUrl,

        @NotNull(message = "A categoria é obrigatória")
        @Positive
        Long categoriaId,

        String imagemPublicId,

        @NotEmpty(message = "O produto deve possuir pelo menos uma variação")
        List<@Valid ProdutoVariacaoRequestDTO> variacoes

) {
}
