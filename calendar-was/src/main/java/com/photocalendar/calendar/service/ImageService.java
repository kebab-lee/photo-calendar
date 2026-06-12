package com.photocalendar.calendar.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
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
        byte[] imageBytes = decodeAndValidate(file);

        DayEntry entry = getOrCreateEntry(userId, date);
        DayImage existing = dayImageMapper.findByDayEntryId(entry.getId());

        // 1) 새 파일을 먼저 생성한다. 리사이즈가 실패해도 옛 이미지는 그대로 보존됨.
        StoredImage stored = imageStorage.storeResized(imageBytes);

        // 2) DB 갱신(옛 행 제거 후 새 행 insert).
        if (existing != null) {
            dayImageMapper.deleteByDayEntryId(entry.getId());
        }
        DayImage dayImage = new DayImage();
        dayImage.setDayEntryId(entry.getId());
        dayImage.setImageUrl(stored.imageUrl());
        dayImage.setThumbUrl(stored.thumbUrl());
        dayImage.setFit(fit);
        dayImage.setSortOrder(0);
        dayImageMapper.insert(dayImage);

        // 3) 옛 파일은 마지막에 삭제(best-effort). 실패해도 고아 파일이 남을 뿐 깨진 참조는 안 생김.
        if (existing != null) {
            imageStorage.deleteFiles(existing.getImageUrl(), existing.getThumbUrl());
        }
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
        // DB 행을 먼저 지우고(트랜잭션 보호), 파일은 마지막에 삭제 → 깨진 참조 대신 고아 파일로 완화.
        dayImageMapper.deleteByDayEntryId(image.getDayEntryId());
        imageStorage.deleteFiles(image.getImageUrl(), image.getThumbUrl());
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

    /**
     * content-type 화이트리스트 + 실제 디코드까지 확인(위장 파일 차단).
     * 저장 시 EXIF Orientation 자동 회전이 동작하려면 원본 바이트가 필요하므로
     * 디코드 결과(BufferedImage)가 아닌 원본 바이트를 반환한다.
     */
    private byte[] decodeAndValidate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어 있습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다(JPEG/PNG).");
        }
        byte[] imageBytes;
        BufferedImage image;
        try {
            imageBytes = file.getBytes();
            image = ImageIO.read(new ByteArrayInputStream(imageBytes));
        } catch (IOException e) {
            throw new IllegalArgumentException("이미지를 읽을 수 없습니다.");
        }
        if (image == null) {
            throw new IllegalArgumentException("유효한 이미지가 아닙니다.");
        }
        return imageBytes;
    }
}
