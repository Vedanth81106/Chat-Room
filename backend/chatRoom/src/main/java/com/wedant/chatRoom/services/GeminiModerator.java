package com.wedant.chatRoom.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiModerator implements HateSpeechEngine{

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean isSafe(String text) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
        String prompt = "You are an expert Indian Content Moderator. " +
                "Check the following message for: \n" +
                "1. Caste-based insults (e.g., calling a caste 'nech' or 'low').\n" +
                "2. Religious hate or defamation.\n" +
                "3. Use of 'bc' or 'mc' as an insult (but 'bc' as 'because' is SAFE).\n\n" +
                "If the message is even slightly hateful, offensive, or casteist, respond ONLY with 'HATE'. " +
                "If it is perfectly normal conversation, respond ONLY with 'SAFE'.\n\n" +
                "Message: " + text;

        //exact JSON structure expected by gemini
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        try{
            Map<String,Object> response = restTemplate.postForEntity(url,requestBody,Map.class).getBody();
            String result = extractText(response).trim();
            return !result.toUpperCase().contains("HATE");
        }catch(Exception e){
            System.err.println("API ERROR: " + e.getMessage());
            return true;
        }
    }

    private String extractText(Map<String, Object> response) {
        try {
            List candidates = (List) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "SAFE";

            Map firstCandidate = (Map) candidates.get(0);

            // Check if the AI blocked the response due to its own safety filters
            if (firstCandidate.containsKey("finishReason") &&
                    firstCandidate.get("finishReason").equals("SAFETY")) {
                return "HATE"; // If Google's own AI thinks it's too toxic to even repeat, it's HATE.
            }

            Map content = (Map) firstCandidate.get("content");
            List parts = (List) content.get("parts");
            return (String) ((Map) parts.get(0)).get("text");
        } catch (Exception e) {
            return "SAFE";
        }
    }
}
