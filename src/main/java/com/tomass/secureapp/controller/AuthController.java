package com.tomass.secureapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @GetMapping("/login")
    public ResponseEntity<?> login(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of(
                "status", "success", 
                "message", "Logged in successfully as " + authentication.getName()
            ));
        }
        return ResponseEntity.status(401).body(Map.of("status", "error", "message", "Unauthorized"));
    }
}
