package com.photocalendar.calendar.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.photocalendar.calendar.dto.CommentRequest;
import com.photocalendar.calendar.dto.EntryDetailResponse;
import com.photocalendar.calendar.dto.EntrySummaryResponse;
import com.photocalendar.calendar.security.SecurityUtil;
import com.photocalendar.calendar.service.EntryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/entries")
public class EntryController {

    private final EntryService entryService;

    public EntryController(EntryService entryService) {
        this.entryService = entryService;
    }

    /** 달력 월별 요약. month=YYYY-MM. */
    @GetMapping
    public List<EntrySummaryResponse> summary(@RequestParam String month) {
        return entryService.getMonthlySummary(SecurityUtil.currentUserId(), month);
    }

    /** 그날 전체(없으면 빈 셸). */
    @GetMapping("/{date}")
    public EntryDetailResponse detail(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return entryService.getDetail(SecurityUtil.currentUserId(), date);
    }

    /** 코멘트 저장(day_entry 없으면 upsert). */
    @PutMapping("/{date}")
    public EntryDetailResponse saveComment(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody CommentRequest request) {
        return entryService.saveComment(SecurityUtil.currentUserId(), date, request.getComment());
    }
}
