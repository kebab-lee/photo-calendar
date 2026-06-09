package com.photocalendar.calendar.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** day_entry 테이블 매핑 도메인. (user_id, entry_date) 유니크. */
@Getter
@Setter
@NoArgsConstructor
public class DayEntry {

    private Long id;
    private Long userId;
    private LocalDate entryDate;
    private String comment;
    private LocalDateTime updatedAt;
}
