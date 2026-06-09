package com.photocalendar.calendar.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 달력 월별 요약 1일치. MyBatis 집계 쿼리 결과 매핑 대상이자 API 응답.
 * 큰 이미지/코멘트 본문/투두 목록은 포함하지 않는다(달력은 가볍게).
 */
@Getter
@Setter
@NoArgsConstructor
public class EntrySummaryResponse {

    private LocalDate date;
    private String thumbUrl;
    private String fit;
    private boolean hasComment;
    private int todoTotal;
    private int todoDone;
}
