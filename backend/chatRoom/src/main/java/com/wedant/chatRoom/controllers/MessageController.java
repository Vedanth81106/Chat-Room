package com.wedant.chatRoom.controllers;

import com.wedant.chatRoom.models.Message;
import com.wedant.chatRoom.repositories.MessageRepository;
import com.wedant.chatRoom.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // 1. GET CHAT HISTORY (Global)
    // Works for initial load and scrolling
    @GetMapping
    public List<Message> getChatHistory(@RequestParam(required = false) String before) {
        LocalDateTime timestamp = (before != null) ? LocalDateTime.parse(before) : null;
        return messageService.getChatHistory(timestamp);
    }

    // 2. SEARCH MESSAGES
    @GetMapping("/search")
    public List<Message> searchMessages(@RequestParam String content) {
        return messageService.searchMessages(content);
    }

    // 3. GET USER HISTORY
    @GetMapping("/user/{userId}")
    public List<Message> getMessagesByUser(@PathVariable UUID userId) {
        return messageService.getMessagesByUserId(userId);
    }


}