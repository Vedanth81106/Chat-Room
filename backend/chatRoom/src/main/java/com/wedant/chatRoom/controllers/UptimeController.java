package com.wedant.chatRoom.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
public class UptimeController {

    @GetMapping("/health")
    public ResponseEntity<String> checkHealth() {
        return new ResponseEntity<>("OK", HttpStatus.OK);
    }
}
