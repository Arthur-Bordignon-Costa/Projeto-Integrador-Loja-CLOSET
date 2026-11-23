package com.closet.backendCloset.service;

import com.closet.backendCloset.dto.*;
import com.closet.backendCloset.entity.Categoria;
import com.closet.backendCloset.entity.Produto;
import com.closet.backendCloset.entity.ProdutoVariacao;
import com.closet.backendCloset.repository.CategoriaRepository;
import com.closet.backendCloset.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final CloudinaryService cloudinaryService;

    private ProdutoResponseDTO converterParaDTO(Produto produto) {

        List<ProdutoVariacaoResponseDTO> variacoes = produto.getVariacoes()
                .stream()
                .map(variacao -> new ProdutoVariacaoResponseDTO(
                        variacao.getId(),
                        variacao.getPreco(),
                        variacao.getTamanho(),
                        variacao.getCor(),
                        variacao.getEstoque()
                ))
                .toList();

        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getImagemUrl(),
                produto.getCategoria().getId(),
                produto.getCategoria().getNome(),
                variacoes
        );
    }

    public List<ProdutoResponseDTO> listarProdutos() {

        return produtoRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    public List<ProdutoResponseDTO> listarPorCategoria(Long categoriaId) {

        if (!categoriaRepository.existsById(categoriaId)) {
            throw new RuntimeException("Categoria não encontrada");
        }

        return produtoRepository.findByCategoria_Id(categoriaId)
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    public ProdutoResponseDTO buscarPorId(Long id) {

        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Produto não encontrado"));

        return converterParaDTO(produto);
    }

    public ProdutoResponseDTO cadastrarProduto(ProdutoRequestDTO dados) {

        Categoria categoria = categoriaRepository.findById(dados.categoriaId())
                .orElseThrow(() ->
                        new RuntimeException("Categoria não encontrada"));

        Produto produto = new Produto();

        produto.setNome(dados.nome());
        produto.setDescricao(dados.descricao());
        produto.setImagemUrl(dados.imagemUrl());
        produto.setCategoria(categoria);

        dados.variacoes().forEach(dadosVariacao -> {

            ProdutoVariacao variacao = new ProdutoVariacao();

            variacao.setPreco(dadosVariacao.preco());
            variacao.setTamanho(dadosVariacao.tamanho());
            variacao.setCor(dadosVariacao.cor());
            variacao.setEstoque(dadosVariacao.estoque());

            produto.adicionarVariacao(variacao);
        });

        Produto produtoSalvo = produtoRepository.save(produto);

        return converterParaDTO(produtoSalvo);
    }


    public ProdutoResponseDTO atualizarProduto(Long id, ProdutoRequestDTO dados)
            throws IOException {

        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        Categoria categoria = categoriaRepository.findById(dados.categoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        produto.setNome(dados.nome());
        produto.setDescricao(dados.descricao());
        produto.setCategoria(categoria);

        if (dados.imagemPublicId() != null) {
            System.out.println("Imagem antiga: " + produto.getImagemPublicId());
            System.out.println("Imagem nova: " + dados.imagemPublicId());

            cloudinaryService.excluirImagem(produto.getImagemPublicId());

            produto.setImagemUrl(dados.imagemUrl());
            produto.setImagemPublicId(dados.imagemPublicId());
        }

        produto.getVariacoes().clear();

        dados.variacoes().forEach(dadosVariacao -> {

            ProdutoVariacao variacao = new ProdutoVariacao();

            variacao.setPreco(dadosVariacao.preco());
            variacao.setTamanho(dadosVariacao.tamanho());
            variacao.setCor(dadosVariacao.cor());
            variacao.setEstoque(dadosVariacao.estoque());

            produto.adicionarVariacao(variacao);
        });

        Produto produtoAtualizado = produtoRepository.save(produto);

        return converterParaDTO(produtoAtualizado);
    }

    public void excluirProduto(Long id) throws IOException {

        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        cloudinaryService.excluirImagem(produto.getImagemPublicId());
        produtoRepository.delete(produto);
    }

}