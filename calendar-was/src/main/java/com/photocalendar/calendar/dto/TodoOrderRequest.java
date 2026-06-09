package com.photocalendar.calendar.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

import lombok.Getter;
import lombok.Setter;

/** PUT /api/entries/{date}/todos/order 본문. 해당 날짜 todo 전체 id를 새 순서대로. */
@Getter
@Setter
public class TodoOrderRequest {

    @NotEmpty
    private List<Long> orderedIds;
}
