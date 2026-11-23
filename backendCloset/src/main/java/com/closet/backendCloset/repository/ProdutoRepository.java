package com.closet.backendCloset.repository;


import com.closet.backendCloset.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findAllByOrderByIdDesc();

    List<Produto> findByCategoria_Id(Long categoriaId);
    boolean existsByCategoria_Id(Long categoriaId);
}
