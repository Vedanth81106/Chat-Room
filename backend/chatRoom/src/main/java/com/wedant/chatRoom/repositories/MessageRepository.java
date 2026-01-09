package com.wedant.chatRoom.repositories;

import com.wedant.chatRoom.models.Message;
import org.springframework.data.domain.Pageable; // ✅ CORRECT IMPORT
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    // --- GLOBAL CHAT QUERIES (Must have Recipient IS NULL) ---

    // 1. Initial Load (Top 50 global messages)
    // FIX: Added RecipientIsNull so private DMs don't show here
    List<Message> findTop50ByRecipientIsNullOrderByTimestampDesc();

    // 2. Scrolling (Load older global messages)
    List<Message> findTop50ByRecipientIsNullAndTimestampBeforeOrderByTimestampDesc(LocalDateTime time);

    // 3. Global Search
    List<Message> findByRecipientIsNullAndContentContainingIgnoreCase(String content);


    // --- PRIVATE CHAT QUERIES ---

    // 4. Private Conversation (Load both sides: Sent & Received)
    @Query("SELECT m FROM Message m WHERE " +
            "(m.user.id = :myId AND m.recipient.id = :theirId) OR " +
            "(m.user.id = :theirId AND m.recipient.id = :myId) " +
            "ORDER BY m.timestamp DESC")
    List<Message> findConversation(@Param("myId") UUID myId,
                                   @Param("theirId") UUID theirId,
                                   Pageable pageable);

    // 5. Private Search
    @Query("SELECT m FROM Message m WHERE " +
            "( (m.user.id = :myId AND m.recipient.id = :theirId) OR " +
            "(m.user.id = :theirId AND m.recipient.id = :myId) ) " +
            "AND LOWER(m.content) LIKE LOWER(CONCAT('%', :content, '%')) " +
            "ORDER BY m.timestamp DESC")
    List<Message> searchPrivateMessages(
            @Param("myId") UUID myId,
            @Param("theirId") UUID theirId,
            @Param("content") String content
    );
}