package com.wedant.chatRoom.services;

import com.wedant.chatRoom.models.Message;
import com.wedant.chatRoom.models.User;
import com.wedant.chatRoom.repositories.MessageRepository;
import com.wedant.chatRoom.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public List<Message> getChatHistory(LocalDateTime beforeTimestamp) {
        List<Message> messages;
        if (beforeTimestamp == null) {
            messages = messageRepository.findTop50ByOrderByTimestampDesc();
        } else {
            messages = messageRepository.findTop50ByTimestampBeforeOrderByTimestampDesc(beforeTimestamp);
        }
        Collections.reverse(messages);
        return messages;
    }

    public List<Message> searchMessages(String content) {
        // Fetch top 50 matches (Newest first)
        List<Message> messages = messageRepository.findTop50ByContentContaining(content);

        // Reverse to show in chronological order
        Collections.reverse(messages);
        return messages;
    }

    public List<Message> getMessagesByUserId(UUID userId) {
        // Fetch top 50 messages from this user (Newest first)
        List<Message> messages = messageRepository.findTop50ByUserIdOrderByTimestampDesc(userId);

        // Reverse to show in chronological order
        Collections.reverse(messages);
        return messages;
    }

    public Message createMessage(String username, String content, String recipientUsername){

        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username not found!"));

        User recipient = null;
        if(recipientUsername != null && !recipientUsername.isEmpty()){
            recipient = userRepository.findByUsername(recipientUsername)
                    .orElseThrow(() -> new UsernameNotFoundException(("Recipient username not found!")));
        }

        var message = Message.builder()
                .user(sender)
                .recipient(recipient)
                .timestamp(LocalDateTime.now())
                .content(content)
                .build();

        return messageRepository.save(message);
    }

    public Message editMessage(UUID messageId, String content){

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Could not find message!!"));

        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        messageRepository.save(message);

        return message;
    }

    public void deleteMessage(UUID messageId){

        Message message = messageRepository.findById(messageId)
                        .orElseThrow(() -> new RuntimeException("Could not find message!"));
        messageRepository.delete(message);
    }
}
