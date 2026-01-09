package com.wedant.chatRoom.services;

import com.wedant.chatRoom.models.Message;
import com.wedant.chatRoom.models.User;
import com.wedant.chatRoom.repositories.MessageRepository;
import com.wedant.chatRoom.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable; // ✅ Correct Import
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

    // 1. GET GLOBAL CHAT (Fixed: No Private Messages)
    public List<Message> getChatHistory(LocalDateTime beforeTimestamp) {
        List<Message> messages;

        if (beforeTimestamp == null) {
            // FIX: Only get Global messages (Recipient is Null)
            messages = messageRepository.findTop50ByRecipientIsNullOrderByTimestampDesc();
        } else {
            messages = messageRepository.findTop50ByRecipientIsNullAndTimestampBeforeOrderByTimestampDesc(beforeTimestamp);
        }

        Collections.reverse(messages);
        return messages;
    }

    // 2. GET PRIVATE CONVERSATION (Fixed: No AWT Print error)
    public List<Message> getConversation(UUID senderId, UUID recipientID){

        Pageable limit = PageRequest.of(0, 50);

        // FIX: Removed the incorrect (java.awt.print) cast
        List<Message> messages = messageRepository.findConversation(senderId, recipientID, limit);

        Collections.reverse(messages);
        return messages;
    }

    // 3. SEARCH
    public List<Message> searchMessages(String content, UUID currentUserId, UUID recipientId) {
        List<Message> messages;

        if(recipientId == null){
            // Global Search
            messages = messageRepository.findByRecipientIsNullAndContentContainingIgnoreCase(content);
        } else {
            // Private Search
            messages = messageRepository.searchPrivateMessages(currentUserId, recipientId, content);
        }

        Collections.reverse(messages);
        return messages;
    }

    // 4. CREATE MESSAGE
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
                .recipient(recipient) // Can be null (Global) or User (Private)
                .timestamp(LocalDateTime.now())
                .content(content)
                .build();

        return messageRepository.save(message);
    }

    // ... edit and delete methods can stay the same ...
    public Message editMessage(UUID messageId, String content){
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Could not find message!!"));
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }

    public void deleteMessage(UUID messageId){
        if (!messageRepository.existsById(messageId)) {
            throw new RuntimeException("Could not find message!");
        }
        messageRepository.deleteById(messageId);
    }
}