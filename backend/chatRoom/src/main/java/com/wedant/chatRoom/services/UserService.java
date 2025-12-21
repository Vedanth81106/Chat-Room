package com.wedant.chatRoom.services;

import com.wedant.chatRoom.models.User;
import com.wedant.chatRoom.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserByUsername(String username){
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Username of specified user was not found!"));
    }

    public User getUserById(UUID id){
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Id of specified user was not found!"));
    }
}
