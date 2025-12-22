package com.wedant.chatRoom.controllers;

import com.wedant.chatRoom.models.Message;
import com.wedant.chatRoom.repositories.MessageRepository;
import com.wedant.chatRoom.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public List<Message> getChatHistory(){
        return messageService.getAllMessages();
    }
}
