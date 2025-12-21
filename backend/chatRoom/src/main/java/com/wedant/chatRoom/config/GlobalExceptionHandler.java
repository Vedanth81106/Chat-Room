package com.wedant.chatRoom.config; // Ensure this matches your folder structure!

import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException exp) {

        System.out.println("⚠️ Handling Error: " + exp.getMessage()); // Debug print

        return ResponseEntity
                .status(HttpStatus.CONFLICT) // Returns 409
                .body(Map.of("message", exp.getMessage()));
    }
}