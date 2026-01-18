package com.wedant.chatRoom.controllers;

import com.wedant.chatRoom.modelsandenums.User;
import com.wedant.chatRoom.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public List<User> findUsers(@RequestParam String username){
        return userService.getAllUsersContaining(username);
    }
}
