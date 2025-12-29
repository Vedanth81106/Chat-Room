package com.wedant.chatRoom.dtos;


import java.time.LocalDateTime;
import java.util.Optional;

public record ChatRequest (String username,
                           String content,
                           LocalDateTime timestamp,
                           String recipientUsername
){}
