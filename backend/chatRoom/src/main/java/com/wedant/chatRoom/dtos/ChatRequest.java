package com.wedant.chatRoom.dtos;

import java.time.LocalDateTime;

public record ChatRequest (String username, String content, LocalDateTime timestamp){}
