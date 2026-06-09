package com.photocalendar.calendar.exception;

/** 가입 시 이메일 중복. → 409 */
public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
