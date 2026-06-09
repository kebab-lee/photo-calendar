package com.photocalendar.calendar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

/** POST /api/entries/{date}/todos 본문. */
@Getter
@Setter
public class TodoCreateRequest {

    @NotBlank
    @Size(max = 500)
    private String content;
}
