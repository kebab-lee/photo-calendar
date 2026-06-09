package com.photocalendar.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 현재 사용자 정보(가입/조회 공용). */
@Getter
@AllArgsConstructor
public class MeResponse {

    private final Long id;
    private final String email;
}
