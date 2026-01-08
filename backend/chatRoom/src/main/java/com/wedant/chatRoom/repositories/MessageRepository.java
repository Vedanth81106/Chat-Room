package com.wedant.chatRoom.repositories;

import com.wedant.chatRoom.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findTop50ByContentContaining(String content);
    List<Message> findTop50ByUserIdOrderByTimestampDesc(UUID userId);
    List<Message> findTop50ByOrderByTimestampDesc();
    List<Message> findTop50ByTimestampBeforeOrderByTimestampDesc(LocalDateTime time);
}

