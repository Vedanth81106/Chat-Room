package com.wedant.chatRoom.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer{

    public void configureMessageBroker(MessageBrokerRegistry config){

        config.enableSimpleBroker("/topic");  //this is where the server will send messages to clients.(its the output)
        config.setApplicationDestinationPrefixes("/app");//(its the input)
    }

    public void registerStompEndpoints(StompEndpointRegistry registry){

        registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("*")
        .withSockJS();
        //sockjs is a library that provides WebSocket-like communication for browsers that dont support WebSocket.
    }

}
