package com.photocalendar.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 날짜 상세의 투두 항목. isDone은 래퍼(Boolean)로 둬 JSON 키가 "isDone"이 되게 한다. */
@Getter
@AllArgsConstructor
public class TodoResponse {

    private final Long id;
    private final String content;
    private final Boolean isDone;
    private final Integer sortOrder;
}
