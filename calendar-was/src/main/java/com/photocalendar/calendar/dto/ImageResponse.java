package com.photocalendar.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 날짜 상세의 이미지(1단계 한 장). */
@Getter
@AllArgsConstructor
public class ImageResponse {

    private final String imageUrl;
    private final String thumbUrl;
    private final String fit;
}
