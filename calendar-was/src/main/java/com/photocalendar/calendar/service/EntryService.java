package com.photocalendar.calendar.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.photocalendar.calendar.domain.DayEntry;
import com.photocalendar.calendar.domain.DayImage;
import com.photocalendar.calendar.dto.EntryDetailResponse;
import com.photocalendar.calendar.dto.EntrySummaryResponse;
import com.photocalendar.calendar.dto.ImageResponse;
import com.photocalendar.calendar.dto.TodoResponse;
import com.photocalendar.calendar.mapper.DayEntryMapper;
import com.photocalendar.calendar.mapper.DayImageMapper;
import com.photocalendar.calendar.mapper.TodoMapper;

@Service
public class EntryService {

    private final DayEntryMapper dayEntryMapper;
    private final DayImageMapper dayImageMapper;
    private final TodoMapper todoMapper;

    public EntryService(DayEntryMapper dayEntryMapper, DayImageMapper dayImageMapper,
                        TodoMapper todoMapper) {
        this.dayEntryMapper = dayEntryMapper;
        this.dayImageMapper = dayImageMapper;
        this.todoMapper = todoMapper;
    }

    /** month=YYYY-MM. 형식 오류 시 DateTimeParseException → 전역 핸들러가 400. */
    public List<EntrySummaryResponse> getMonthlySummary(Long userId, String month) {
        YearMonth ym = YearMonth.parse(month);
        return dayEntryMapper.findMonthlySummary(userId, ym.atDay(1), ym.atEndOfMonth());
    }

    /** 그날 전체. 항목 없으면 빈 셸(생성하지 않음). */
    public EntryDetailResponse getDetail(Long userId, LocalDate date) {
        DayEntry entry = dayEntryMapper.findByUserIdAndEntryDate(userId, date);
        if (entry == null) {
            return new EntryDetailResponse(date, null, null, List.of());
        }
        DayImage img = dayImageMapper.findByDayEntryId(entry.getId());
        ImageResponse image = (img == null) ? null
                : new ImageResponse(img.getImageUrl(), img.getThumbUrl(), img.getFit());
        List<TodoResponse> todos = todoMapper.findByDayEntryId(entry.getId()).stream()
                .map(t -> new TodoResponse(t.getId(), t.getContent(), t.getIsDone(), t.getSortOrder()))
                .toList();
        return new EntryDetailResponse(date, entry.getComment(), image, todos);
    }

    /**
     * 코멘트 저장(upsert). 엔트리 있으면 갱신(빈 문자열로 비우기 허용),
     * 없고 코멘트에 내용 있으면 생성, 없고 공백이면 no-op(빈 row 금지).
     */
    @Transactional
    public EntryDetailResponse saveComment(Long userId, LocalDate date, String comment) {
        DayEntry entry = dayEntryMapper.findByUserIdAndEntryDate(userId, date);
        if (entry != null) {
            dayEntryMapper.updateComment(entry.getId(), comment);
        } else if (comment != null && !comment.isBlank()) {
            DayEntry created = new DayEntry();
            created.setUserId(userId);
            created.setEntryDate(date);
            created.setComment(comment);
            dayEntryMapper.insert(created);
        }
        return getDetail(userId, date);
    }
}
