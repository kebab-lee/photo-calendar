package com.photocalendar.calendar.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 날짜 상세 전체. 항목이 없으면 comment/image=null, todos=[]인 빈 셸로 반환. */
@Getter
@AllArgsConstructor
public class EntryDetailResponse {

    private final LocalDate date;
    private final String comment;
    private final ImageResponse image;
    private final List<TodoResponse> todos;
}
