package com.wedant.chatRoom.controllers;

import com.wedant.chatRoom.dtos.ChatRequest;
import com.wedant.chatRoom.modelsandenums.Message;
import com.wedant.chatRoom.modelsandenums.MessageStatus;
import com.wedant.chatRoom.services.GeminiModerator;
import com.wedant.chatRoom.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final GeminiModerator geminiModerator;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatRequest chatRequest){

        Message savedMessage = messageService.createMessage(
                chatRequest.username(),
                chatRequest.content(),
                chatRequest.recipientUsername());

        broadcastMessage(chatRequest,savedMessage);

        if(savedMessage.getStatus() == MessageStatus.PENDING){
            CompletableFuture.runAsync(() -> {
                try{
                    boolean isSafe = geminiModerator.isSafe(savedMessage.getContent());
                    MessageStatus finalStatus = isSafe ? MessageStatus.APPROVED : MessageStatus.REJECTED;

                    messageService.updateMessageStatus(savedMessage.getId(), finalStatus);
                    broadcastStatusUpdate(chatRequest,savedMessage.getId(),finalStatus);
                }catch(Exception e){
                    messageService.updateMessageStatus(savedMessage.getId(), MessageStatus.APPROVED);
                }
            });
        }

    }

    public record MessageStatusUpdate(UUID messageId, MessageStatus status) {}

    private void broadcastMessage(ChatRequest chatRequest, Message msg){
        if(chatRequest.recipientUsername() == null || chatRequest.recipientUsername().isEmpty()){
            simpMessagingTemplate.convertAndSend("/topic/messages", msg);
        }else{
            simpMessagingTemplate.convertAndSendToUser(
                    chatRequest.recipientUsername(),"/queue/messages", msg);

            simpMessagingTemplate.convertAndSendToUser(
                    chatRequest.username(),"/queue/messages", msg);
        }
    }

    private void broadcastStatusUpdate(ChatRequest req, UUID id, MessageStatus status){
        MessageStatusUpdate update = new MessageStatusUpdate(id,status);

        if(req.recipientUsername() == null || req.recipientUsername().isEmpty()){
            simpMessagingTemplate.convertAndSend("/topic/status",update);
        }else{
            simpMessagingTemplate.convertAndSendToUser(
                    req.recipientUsername(),"/queue/status", update);
            simpMessagingTemplate.convertAndSendToUser(
                    req.username(), "/queue/status", update);
        }
    }

    @MessageMapping("/typing")
    @SendTo("/topic/typing")
    public String broadcastTyping(@Payload String username){
        return username;
    }
}