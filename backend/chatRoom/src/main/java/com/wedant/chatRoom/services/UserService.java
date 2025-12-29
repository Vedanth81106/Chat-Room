package com.wedant.chatRoom.services;

import com.wedant.chatRoom.models.User;
import com.wedant.chatRoom.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsersContaining(String partialUsername){
        return userRepository.findByUsernameContainingIgnoreCase(partialUsername);
    }
}
