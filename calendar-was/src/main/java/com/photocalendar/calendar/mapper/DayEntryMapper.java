package com.photocalendar.calendar.mapper;

import java.time.LocalDate;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.photocalendar.calendar.domain.DayEntry;

@Mapper
public interface DayEntryMapper {

    /** 사용자별 하루 1개. upsert 판단용 조회. */
    DayEntry findByUserIdAndEntryDate(@Param("userId") Long userId,
                                      @Param("entryDate") LocalDate entryDate);

    DayEntry findById(Long id);

    /** 생성된 PK는 dayEntry.id에 채워진다(useGeneratedKeys). */
    int insert(DayEntry dayEntry);

    int updateComment(@Param("id") Long id, @Param("comment") String comment);
}
