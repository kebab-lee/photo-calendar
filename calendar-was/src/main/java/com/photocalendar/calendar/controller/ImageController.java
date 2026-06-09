package com.photocalendar.calendar.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.photocalendar.calendar.dto.FitRequest;
import com.photocalendar.calendar.dto.ImageResponse;
import com.photocalendar.calendar.security.SecurityUtil;
import com.photocalendar.calendar.service.ImageService;

import jakarta.validation.Valid;

@RestController
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    /** 업로드(있으면 교체). multipart: file + fit. */
    @PostMapping(value = "/api/entries/{date}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImageResponse upload(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("file") MultipartFile file,
            @RequestParam("fit") String fit) {
        return imageService.save(SecurityUtil.currentUserId(), date, file, fit);
    }

    /** fit(cover/contain) 변경. */
    @PatchMapping("/api/entries/{date}/image")
    public ImageResponse patchFit(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody FitRequest request) {
        return imageService.updateFit(SecurityUtil.currentUserId(), date, request.getFit());
    }

    /** 삭제. */
    @DeleteMapping("/api/entries/{date}/image")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        imageService.delete(SecurityUtil.currentUserId(), date);
    }
}
