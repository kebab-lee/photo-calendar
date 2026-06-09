package com.photocalendar.calendar.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.photocalendar.calendar.domain.DayImage;

@Mapper
public interface DayImageMapper {

    /** 1단계는 한 장만 운영 → sort_order 최솟값 1건. */
    DayImage findByDayEntryId(Long dayEntryId);

    int insert(DayImage dayImage);

    /** "하루 한 장" 교체: 기존 행 제거 후 재삽입. */
    int deleteByDayEntryId(Long dayEntryId);

    int updateFit(@Param("dayEntryId") Long dayEntryId, @Param("fit") String fit);
}
