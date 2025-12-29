package com.wedant.chatRoom.controllers;

import com.wedant.chatRoom.dtos.ChatRequest;
import com.wedant.chatRoom.models.Message;
import com.wedant.chatRoom.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatRequest chatRequest, Principal principal){

        Message savedMessage = messageService.createMessage(chatRequest.username(),
                chatRequest.content(),
                chatRequest.recipientUsername());

        if(chatRequest.recipientUsername() == null || chatRequest.recipientUsername().isEmpty()){
            simpMessagingTemplate.convertAndSend("/topic/messages", savedMessage);
        }else{
            simpMessagingTemplate.convertAndSendToUser(
                    chatRequest.recipientUsername(),
                    "/queue/messages",
                    savedMessage
            );

            simpMessagingTemplate.convertAndSendToUser(
                    chatRequest.username(),
                    "/queue/messages",
                    savedMessage
            );
        }

    }

    @MessageMapping("/typing")
    @SendTo("/topic/typing")
    public String broadcastTyping(@Payload String username){
        return username;
    }
}
