package com.closet.backendCloset.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

import lombok.*;

@Entity
@Table(name = "produto_variacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoVariacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(nullable = false, length = 25)
    private String tamanho;

    @Column(nullable = false, length = 50)
    private String cor;

    @Column(nullable = false)
    private Integer estoque;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;
}