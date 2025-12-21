package com.wedant.chatRoom.controllers;

import com.wedant.chatRoom.dtos.ChatRequest;
import com.wedant.chatRoom.models.Message;
import com.wedant.chatRoom.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public Message processMessage(@Payload ChatRequest chatRequest){

        Message savedMessage = messageService.createMessage(chatRequest.username(), chatRequest.content());

        return savedMessage;
    }
}
