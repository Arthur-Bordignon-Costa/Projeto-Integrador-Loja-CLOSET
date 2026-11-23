package com.closet.backendCloset.service;

import com.closet.backendCloset.dto.CategoriaRequestDTO;
import com.closet.backendCloset.dto.CategoriaResponseDTO;
import com.closet.backendCloset.entity.Categoria;
import com.closet.backendCloset.repository.CategoriaRepository;
import com.closet.backendCloset.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;

    private CategoriaResponseDTO converterParaDTO(Categoria categoria) {

        return new CategoriaResponseDTO(
                categoria.getId(),
                categoria.getNome()
        );
    }

    public List<CategoriaResponseDTO> listarCategorias() {

        return categoriaRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    public CategoriaResponseDTO buscarPorId(Long id) {

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Categoria não encontrada"));

        return converterParaDTO(categoria);
    }

    public CategoriaResponseDTO cadastrarCategoria(CategoriaRequestDTO dados) {

        if (categoriaRepository.findByNomeIgnoreCase(dados.nome()).isPresent()) {
            throw new RuntimeException("Essa categoria já existe");
        }

        Categoria categoria = new Categoria();

        categoria.setNome(dados.nome());

        Categoria categoriaSalva = categoriaRepository.save(categoria);

        return converterParaDTO(categoriaSalva);
    }

    public CategoriaResponseDTO atualizarCategoria(Long id, CategoriaRequestDTO dados) {

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Categoria não encontrada"));

        if (categoriaRepository.findByNomeIgnoreCase(dados.nome())
                .filter(c -> !c.getId().equals(id))
                .isPresent()) {

            throw new RuntimeException("Já existe uma categoria com esse nome");
        }

        categoria.setNome(dados.nome());

        Categoria categoriaAtualizada = categoriaRepository.save(categoria);

        return converterParaDTO(categoriaAtualizada);
    }

    public void excluirCategoria(Long id) {

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Categoria não encontrada"));

        if (produtoRepository.existsByCategoria_Id(id)) {
            throw new RuntimeException(
                    "Não é possível excluir uma categoria que possui produtos"
            );
        }

        categoriaRepository.delete(categoria);
    }
}
