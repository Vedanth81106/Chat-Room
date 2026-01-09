package com.wedant.chatRoom.controllers;

import com.wedant.chatRoom.models.Message;
import com.wedant.chatRoom.models.User;
import com.wedant.chatRoom.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
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
        if (before == null) {
            return messageService.getChatHistory(null);
        }

        String isoDate = before.replace(" ", "T");

        LocalDateTime timestamp = LocalDateTime.parse(isoDate);
        return messageService.getChatHistory(timestamp);
    }

    // 2. SEARCH MESSAGES
    @GetMapping("/search")
    public List<Message> searchMessages(@RequestParam String content,
                                        @RequestParam(required = false) UUID recipientId,
                                        Authentication authentication) {

        if(authentication == null){
            System.out.println("User not authenticated");
            return List.of();
        }
        User user = getCurrentUser(authentication);
        return messageService.searchMessages(content, user.getId(),recipientId);
    }

    // 3. GET USER HISTORY
    @GetMapping("/user/{userId}")
    public List<Message> getMessagesByUser(@PathVariable UUID userId, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        if (currentUser == null) {
            return List.of();
        }

        // Now we fetch the conversation between Current User and Target User (userId)
        return messageService.getConversation(currentUser.getId(), userId);
    }

    private User getCurrentUser(Authentication auth) {
        if (auth == null) return null;
        return (User) auth.getPrincipal();
    }

}