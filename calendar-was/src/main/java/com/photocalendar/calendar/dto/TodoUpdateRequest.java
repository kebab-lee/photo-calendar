package com.photocalendar.calendar.dto;

import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

/** PATCH /api/todos/{id} 본문. 부분 수정 — null인 필드는 변경하지 않음. */
@Getter
@Setter
public class TodoUpdateRequest {

    @Size(max = 500)
    private String content;

    private Boolean isDone;
}
