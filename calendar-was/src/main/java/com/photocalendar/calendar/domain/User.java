package com.photocalendar.calendar.domain;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** user 테이블 매핑 도메인. */
@Getter
@Setter
@NoArgsConstructor
public class User {

    private Long id;
    private String email;
    private String passwordHash;
    private LocalDateTime createdAt;
}
