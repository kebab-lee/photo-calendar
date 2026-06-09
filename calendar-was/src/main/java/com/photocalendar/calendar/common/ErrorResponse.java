package com.photocalendar.calendar.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 공통 에러 응답 바디. */
@Getter
@AllArgsConstructor
public class ErrorResponse {

    private final String code;
    private final String message;
}
