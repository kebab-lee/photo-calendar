package com.photocalendar.calendar.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

/** PATCH /api/entries/{date}/image 본문. cover/contain. */
@Getter
@Setter
public class FitRequest {

    @NotBlank
    private String fit;
}
