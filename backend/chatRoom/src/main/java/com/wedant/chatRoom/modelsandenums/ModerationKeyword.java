package com.wedant.chatRoom.modelsandenums;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public enum ModerationKeyword {
    // --- HINDI / HINGLISH ---
    CHUTIYA("hindi"), BHOSDIKE("hindi"), BSDK("hindi"), BEHENCHOD("hindi"), MADARCHOD("hindi"),
    GANDU("hindi"), HARAMZADA("hindi"), KAMEENA("hindi"), KUTTA("hindi"), SALE("hindi"),
    CHAMAAR("hindi"), BHANGI("hindi"), DALIDDR("hindi"), RANDI("hindi"), LAUDA("hindi"),

    // --- TAMIL / TANGLISH ---
    PARA_TAMIL("tamil"), SAKKILIYA("tamil"), NADHARI("tamil"), CHANDALA("tamil"),
    OMALA("tamil"), SUNNI("tamil"), THEVIDIA("tamil"), KUDHI("tamil"),
    PANDARAM("tamil"), CHERI("tamil"), PUNDA("tamil"), POKKIIRI("tamil"),

    // --- TELUGU / TELGLISH ---
    CHANDAALAM("telugu"), MADIGA("telugu"), MAALA("telugu"), LANJAKODAKA("telugu"),
    DAPPUNA("telugu"), NEECHUDU("telugu"), NIKRUSHTUDU("telugu"), BOKKA("telugu"),
    MUNDA("telugu"), LANJA("telugu"), LAMDI("telugu"), GUDDA("telugu"),

    // --- KANNADA / KANGLISH ---
    SULE_MAGA("kannada"), HAJAMA("kannada"), HADARAGITTI("kannada"), TIKA("kannada"),
    BOLI_MAGANE("kannada"), NAYI("kannada"), LOAFER("kannada"), THOO("kannada"),
    KUTRA("kannada"), GANCHALI("kannada"), HUCHCHA("kannada"), BADDI_MAGA("kannada"),

    // --- BENGALI / BANGLA ---
    BOKACHODA("bengali"), BAINCHOD("bengali"), SALA("bengali"), HARAMJADA("bengali"),
    CHUDAR_BHAI("bengali"), KUTTAR_BACCHA("bengali"), GANDU_BENGALI("bengali"), MAGI("bengali"),
    CHHAGOL("bengali"), KHANKI("bengali"), FAKINNI("bengali"), MALUAN("bengali"),

    // --- MARATHI ---
    AICHYA_GAVATH("marathi"), ZHAVA("marathi"), BHADKHAO("marathi"), CHAVAT("marathi"),
    SHENYA("marathi"), LAY_BHARI_INSULT("marathi"), GANDI_MARATHI("marathi"), RANDA_MARATHI("marathi"),
    GOTYA("marathi"), BHOSARI("marathi"), AAI_GHATLIS("marathi"), BE_BAVLYA("marathi"),

    // --- PUNJABI ---
    LUN_PUNJABI("punjabi"), KANJAR("punjabi"), KUTTE_DA_PUTTAR("punjabi"), PHUDDI("punjabi"),
    GASHTI("punjabi"), BANDI_DE_BACCHA("punjabi"), SALLE_PUNJABI("punjabi"), TERI_MAA_DI("punjabi"),

    // --- NATIVE SCRIPT FALLBACKS ---
    H_BHOSDIKE("भोसड़ीके", "hindi"), H_CHUTIYA("चूतिया", "hindi"),
    T_PARA("பறையன்", "tamil"), T_THEVIDIA("தேவிடியா", "tamil"),
    TE_LANJA("లంజ", "telugu"), TE_MUNDA("ముండ", "telugu"),
    K_SULE("ಸೂಳೆ", "kannada"), K_NAYI("ನಾಯಿ", "kannada"),
    B_BOKACHODA("বোকাচোదా", "bengali"), B_SALA("শালা", "bengali"),
    M_AICHYA("आईच्या", "marathi"), M_BOSARI("भोसरी", "marathi");

    private final String language;
    private final String scriptValue;

    // Original constructor for Romanized versions
    ModerationKeyword(String language) {
        this.language = language;
        this.scriptValue = this.name(); // Defaults to Enum name
    }

    // New constructor for Native Script versions
    ModerationKeyword(String scriptValue, String language) {
        this.language = language;
        this.scriptValue = scriptValue;
    }

    public String getLanguage() {
        return language;
    }

    public String getScriptValue() {
        return scriptValue;
    }

    // Helper to get all "words" for the shield loop
    public static Set<String> getAllBlockedWords() {
        return Arrays.stream(ModerationKeyword.values())
                .map(keyword -> keyword.getScriptValue().toLowerCase())
                .collect(Collectors.toSet());
    }
}