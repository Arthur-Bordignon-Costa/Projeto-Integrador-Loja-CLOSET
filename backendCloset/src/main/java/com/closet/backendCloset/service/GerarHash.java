package com.closet.backendCloset.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String senha = "AdminCloset123";

        System.out.println(encoder.encode(senha));
    }
}

