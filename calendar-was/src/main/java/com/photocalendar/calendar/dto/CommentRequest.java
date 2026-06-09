package com.photocalendar.calendar.dto;

import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

/** PUT /api/entries/{date} 본문. comment는 null/공백 허용(공백+엔트리 없음이면 no-op). */
@Getter
@Setter
public class CommentRequest {

    @Size(max = 5000)
    private String comment;
}
