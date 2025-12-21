package com.wedant.chatRoom.repositories;

import com.wedant.chatRoom.models.Message;
import com.wedant.chatRoom.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByUserIdAndContentContaining(UUID userId, String content);
    List<Message> findByContentContaining(String content);
    List<Message> findByUserOrderByTimestampAsc(User user);
    List<Message> findByUserIdOrderByTimestampAsc(UUID userId);
    List<Message> findAllByOrderByTimestampAsc();
}