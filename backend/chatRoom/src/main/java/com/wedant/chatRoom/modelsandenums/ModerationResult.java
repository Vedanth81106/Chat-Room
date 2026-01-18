package com.wedant.chatRoom.modelsandenums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class ModerationResult {

    private final MessageStatus status;
    private final String content;
}
