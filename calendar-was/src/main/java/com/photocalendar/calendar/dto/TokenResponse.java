package com.photocalendar.calendar.dto;

import lombok.Getter;

/** 로그인 응답. 1단계는 access token 단일. */
@Getter
public class TokenResponse {

    private final String accessToken;
    private final String tokenType = "Bearer";

    public TokenResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}
