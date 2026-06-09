package com.photocalendar.calendar.exception;

/** 로그인 실패(이메일/비번 불일치). → 401 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
