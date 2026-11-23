
package com.closet.backendCloset.controller;

import com.closet.backendCloset.dto.LoginRequestDTO;
import com.closet.backendCloset.dto.LoginResponseDTO;
import com.closet.backendCloset.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO dados
    ) {
        String token = authService.login(
                dados.username(),
                dados.password()
        );
        return ResponseEntity.ok(new LoginResponseDTO(token, "Bearer"));
    }
}
