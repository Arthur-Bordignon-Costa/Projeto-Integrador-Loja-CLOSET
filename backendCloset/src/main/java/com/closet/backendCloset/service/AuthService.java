
package com.closet.backendCloset.service;

import com.closet.backendCloset.entity.Usuario;
import com.closet.backendCloset.repository.UsuarioRepository;
import com.closet.backendCloset.security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final TokenService tokenService;

    public String login(String username, String password) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        username,
                        password
                )
        );

        Usuario usuario = usuarioRepository.findByUsername(
                authentication.getName()
        ).orElseThrow(() ->
                new RuntimeException("Usuário não encontrado")
        );

        return tokenService.generateToken(usuario);
    }
}
