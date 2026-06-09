package com.photocalendar.calendar.domain;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** day_image 테이블 매핑 도메인. 1단계는 day_entry당 한 장(sort_order=0). */
@Getter
@Setter
@NoArgsConstructor
public class DayImage {

    private Long id;
    private Long dayEntryId;
    private String imageUrl;
    private String thumbUrl;
    private String fit;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
