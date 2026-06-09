package com.photocalendar.calendar.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * todo 테이블 매핑 도메인.
 * isDone은 래퍼 타입(Boolean)으로 둬서 Lombok이 getIsDone()/setIsDone()을 생성하고,
 * MyBatis가 is_done -> isDone 으로 자동 매핑되게 한다(primitive boolean의 is 접두사 처리 회피).
 */
@Getter
@Setter
@NoArgsConstructor
public class Todo {

    private Long id;
    private Long dayEntryId;
    private String content;
    private Boolean isDone;
    private Integer sortOrder;
}
