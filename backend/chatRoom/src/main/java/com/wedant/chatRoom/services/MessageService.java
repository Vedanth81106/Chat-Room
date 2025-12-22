package com.wedant.chatRoom.services;

import com.wedant.chatRoom.models.Message;
import com.wedant.chatRoom.models.User;
import com.wedant.chatRoom.repositories.MessageRepository;
import com.wedant.chatRoom.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public Message getMessageById(UUID id){
        return messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Could not fetch message!!"));
    }
    public List<Message> getMessagesByUserIdAndContent(UUID userId, String content){
        return messageRepository.findByUserIdAndContentContaining(userId, content);
    }

    public List<Message> getMessagesByContent(String content){
        return messageRepository.findByContentContaining(content);
    }

    public List<Message> getMessagesByUser(User user){
        return messageRepository.findByUserOrderByTimestampAsc(user);
    }

    public List<Message> getMessagesByUserId(UUID userId){
        return messageRepository.findByUserIdOrderByTimestampAsc(userId);
    }

    public List<Message> getAllMessages(){
        return messageRepository.findAllByOrderByTimestampAsc();
    }

    public Message createMessage(String username, String content){

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username not found!"));

        var message = Message.builder()
                .user(user)
                .timestamp(LocalDateTime.now())
                .content(content)
                .build();

        messageRepository.save(message);

        return message;
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
