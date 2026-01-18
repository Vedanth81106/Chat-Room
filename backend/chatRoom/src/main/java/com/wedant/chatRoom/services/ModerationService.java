package com.wedant.chatRoom.services;

import com.wedant.chatRoom.modelsandenums.MessageStatus;
import com.wedant.chatRoom.modelsandenums.ModerationKeyword;
import com.wedant.chatRoom.modelsandenums.ModerationResult;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class ModerationService {

    public final Set<String> shield = ModerationKeyword.getAllBlockedWords();

    public String filterMessage(String input){

        if(input == null) return "";

        String[] words = input.split("\\s+");
        StringBuilder result = new StringBuilder();

        for(String word : words){

            String cleanWord = normalizeForCheck(word);

            //if it is a 100% match stop there
            if (shield.contains(cleanWord)) {
                result.append("**** ");
                continue;
            }

            // Don't run Levenshtein on tiny words like "is", "the", "hi".
            // Most slurs are 4+ characters.
            if (cleanWord.length() < 3) {
                result.append(word).append(" ");
                continue;
            }

            // This only runs if the word isn't in the shield and is long enough.
            if (isFuzzyMatch(cleanWord)) {
                result.append("**** ");
            } else {
                result.append(word).append(" ");
            }
        }

        return result.toString().trim();
    }

    public String normalizeForCheck(String input){
        if(input == null) return "";

        return input.toLowerCase()
                .replace("@", "a")
                .replace("$", "s")
                .replace("0", "o")
                .replace("1", "i")
                .replace("!", "i")
                .replace("3", "e")
                // Removes all non-alphanumeric characters except spaces
                .replaceAll("[^a-z0-9\\s]", "");
    }

    public double calculateSimilarity(String s1, String s2){
        if (s1 == null || s2 == null) return 0.0;
        if (s1.equals(s2)) return 1.0;

        int distance = calculateLevenshteinDistance(s1,s2);
        // Formula: 1 - (distance / max_length)
        return 1.0 - ((double) distance/Math.max(s1.length(), s2.length()));
    }

    private int calculateLevenshteinDistance(String x, String y) {
        int[][] dp = new int[x.length() + 1][y.length() + 1];

        for (int i = 0; i <= x.length(); i++) {
            for (int j = 0; j <= y.length(); j++) {
                if (i == 0) dp[i][j] = j;
                else if (j == 0) dp[i][j] = i;
                else {
                    int cost = (x.charAt(i - 1) == y.charAt(j - 1)) ? 0 : 1;
                    dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                            dp[i - 1][j - 1] + cost);
                }
            }
        }
        return dp[x.length()][y.length()];
    }

    private boolean isFuzzyMatch(String cleanWord) {
        for (ModerationKeyword m : ModerationKeyword.values()) {
            String romanName = m.name().toLowerCase();
            String nativeScript = m.getScriptValue().toLowerCase();

            // Check Romanized (English letters)
            if (Math.abs(cleanWord.length() - romanName.length()) <= 2) {
                if (calculateSimilarity(cleanWord, romanName) >= 0.8) return true;
            }

            // Check Native Script (only if it's different from the Roman name)
            if (!romanName.equals(nativeScript)) {
                if (Math.abs(cleanWord.length() - nativeScript.length()) <= 2) {
                    if (calculateSimilarity(cleanWord, nativeScript) >= 0.8) return true;
                }
            }
        }
        return false;
    }

    public ModerationResult moderate(String input){

        if(input == null || input.isBlank()){
            return new ModerationResult(MessageStatus.APPROVED," ");
        }

        String filtered = filterMessage(input);

        if(filtered.contains("****")){
            return new ModerationResult(MessageStatus.REJECTED, filtered);
        }

        String[] words = input.trim().split("\\s+");

        if (words.length <= 2) {
            // Safe bypass for "Hi", "Lol", etc.
            return new ModerationResult(MessageStatus.APPROVED, input);
        }

        return new ModerationResult(MessageStatus.PENDING, input);
    }
}
