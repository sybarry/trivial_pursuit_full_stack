package fr.alma.trivial_pursuit_server.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Constant {
    public static final int BOARD_CARD_LIST_SIZE_IN_JSON = 100;
    public static final int CARD_NB_QUESTIONS = 6;
    public static final int CARD_NB_ANSWERS = 6;
    public static final int BOARD_CASE_LIST_SIZE = 72;
    public static final int BOARD_CASE_LIST_NB_SIMPLE_CASE_INSTANCE = 66;
    public static final int BOARD_AND_PARTY_PLAYER_LIST_MIN_SIZE = 2;
    public static final int BOARD_AND_PARTY_PLAYER_LIST_MAX_SIZE = 6;
    public static final int CASE_MIN_NEIGHBORS = 2;
    public static final int CASE_MAX_NEIGHBORS = 6;
    public static final int SIZE_JSON_CARD = 72;

    public static String get_SHA_512_SecurePassword(String passwordToHash) {
        String generatedPassword = null;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] bytes = md.digest(passwordToHash.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte aByte : bytes) {
                sb.append(Integer.toString((aByte & 0xff) + 0x100, 16)
                        .substring(1));
            }
            generatedPassword = sb.toString();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return generatedPassword;
    }
}
