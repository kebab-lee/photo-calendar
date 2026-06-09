package com.photocalendar.calendar.service;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Set;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.photocalendar.calendar.domain.DayEntry;
import com.photocalendar.calendar.domain.DayImage;
import com.photocalendar.calendar.dto.ImageResponse;
import com.photocalendar.calendar.exception.NotFoundException;
import com.photocalendar.calendar.mapper.DayEntryMapper;
import com.photocalendar.calendar.mapper.DayImageMapper;
import com.photocalendar.calendar.storage.ImageStorage;
import com.photocalendar.calendar.storage.ImageStorage.StoredImage;

@Service
public class ImageService {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png");
    private static final Set<String> ALLOWED_FITS = Set.of("cover", "contain");

    private final DayEntryMapper dayEntryMapper;
    private final DayImageMapper dayImageMapper;
    private final ImageStorage imageStorage;

    public ImageService(DayEntryMapper dayEntryMapper, DayImageMapper dayImageMapper,
                        ImageStorage imageStorage) {
        this.dayEntryMapper = dayEntryMapper;
        this.dayImageMapper = dayImageMapper;
        this.imageStorage = imageStorage;
    }

    /** 업로드(있으면 교체). day_entry 없으면 자동 생성. 항상 sort_order=0 한 장. */
    @Transactional
    public ImageResponse save(Long userId, LocalDate date, MultipartFile file, String fit) {
        validateFit(fit);
        BufferedImage image = decodeAndValidate(file);

        DayEntry entry = getOrCreateEntry(userId, date);
        DayImage existing = dayImageMapper.findByDayEntryId(entry.getId());
        if (existing != null) {
            imageStorage.deleteFiles(existing.getImageUrl(), existing.getThumbUrl());
            dayImageMapper.deleteByDayEntryId(entry.getId());
        }

        StoredImage stored = imageStorage.storeResized(image);
        DayImage dayImage = new DayImage();
        dayImage.setDayEntryId(entry.getId());
        dayImage.setImageUrl(stored.imageUrl());
        dayImage.setThumbUrl(stored.thumbUrl());
        dayImage.setFit(fit);
        dayImage.setSortOrder(0);
        dayImageMapper.insert(dayImage);
        return new ImageResponse(dayImage.getImageUrl(), dayImage.getThumbUrl(), dayImage.getFit());
    }

    /** fit(cover/contain) 변경. 엔트리/이미지 없으면 404. */
    @Transactional
    public ImageResponse updateFit(Long userId, LocalDate date, String fit) {
        validateFit(fit);
        DayImage image = requireImage(userId, date);
        dayImageMapper.updateFit(image.getDayEntryId(), fit);
        return new ImageResponse(image.getImageUrl(), image.getThumbUrl(), fit);
    }

    /** 삭제(파일 + row). 엔트리/이미지 없으면 404. */
    @Transactional
    public void delete(Long userId, LocalDate date) {
        DayImage image = requireImage(userId, date);
        imageStorage.deleteFiles(image.getImageUrl(), image.getThumbUrl());
        dayImageMapper.deleteByDayEntryId(image.getDayEntryId());
    }

    private DayImage requireImage(Long userId, LocalDate date) {
        DayEntry entry = dayEntryMapper.findByUserIdAndEntryDate(userId, date);
        if (entry == null) {
            throw new NotFoundException("이미지를 찾을 수 없습니다.");
        }
        DayImage image = dayImageMapper.findByDayEntryId(entry.getId());
        if (image == null) {
            throw new NotFoundException("이미지를 찾을 수 없습니다.");
        }
        return image;
    }

    private DayEntry getOrCreateEntry(Long userId, LocalDate date) {
        DayEntry entry = dayEntryMapper.findByUserIdAndEntryDate(userId, date);
        if (entry != null) {
            return entry;
        }
        DayEntry created = new DayEntry();
        created.setUserId(userId);
        created.setEntryDate(date);
        dayEntryMapper.insert(created);
        return created;
    }

    private void validateFit(String fit) {
        if (fit == null || !ALLOWED_FITS.contains(fit)) {
            throw new IllegalArgumentException("fit은 cover 또는 contain이어야 합니다.");
        }
    }

    /** content-type 화이트리스트 + 실제 디코드까지 확인(위장 파일 차단). */
    private BufferedImage decodeAndValidate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어 있습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다(JPEG/PNG).");
        }
        BufferedImage image;
        try {
            image = ImageIO.read(file.getInputStream());
        } catch (IOException e) {
            throw new IllegalArgumentException("이미지를 읽을 수 없습니다.");
        }
        if (image == null) {
            throw new IllegalArgumentException("유효한 이미지가 아닙니다.");
        }
        return image;
    }
}
