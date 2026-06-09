package com.photocalendar.calendar.exception;

/** 리소스 없음 또는 본인 소유가 아님(존재 노출 회피). → 404 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
