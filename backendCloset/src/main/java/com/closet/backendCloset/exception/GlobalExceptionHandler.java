
package com.closet.backendCloset.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> tratarValidacao(
            MethodArgumentNotValidException ex
    ) {
        Map<String, String> erros = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(erro ->
                erros.put(erro.getField(), erro.getDefaultMessage())
        );

        return ResponseEntity.badRequest().body(erros);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> tratarRegraNegocio(
            RuntimeException ex
    ) {
        Map<String, String> resposta = new HashMap<>();
        resposta.put("erro", ex.getMessage());

        HttpStatus status = HttpStatus.BAD_REQUEST;

        if (ex.getMessage() != null &&
                ex.getMessage().contains("não encontrada")) {
            status = HttpStatus.NOT_FOUND;
        }

        if (ex.getMessage() != null &&
                (ex.getMessage().contains("já existe") ||
                        ex.getMessage().contains("possui produtos"))) {
            status = HttpStatus.CONFLICT;
        }

        return ResponseEntity.status(status).body(resposta);
    }
}
