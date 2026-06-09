package com.photocalendar.calendar.mapper;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.photocalendar.calendar.domain.DayEntry;
import com.photocalendar.calendar.dto.EntrySummaryResponse;

@Mapper
public interface DayEntryMapper {

    /** 사용자별 하루 1개. upsert 판단용 조회. */
    DayEntry findByUserIdAndEntryDate(@Param("userId") Long userId,
                                      @Param("entryDate") LocalDate entryDate);

    DayEntry findById(Long id);

    /** 생성된 PK는 dayEntry.id에 채워진다(useGeneratedKeys). */
    int insert(DayEntry dayEntry);

    int updateComment(@Param("id") Long id, @Param("comment") String comment);

    /** 달력 월별 요약(존재하는 day_entry만). 썸네일/fit/hasComment/투두 카운트 집계. */
    List<EntrySummaryResponse> findMonthlySummary(@Param("userId") Long userId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);
}
