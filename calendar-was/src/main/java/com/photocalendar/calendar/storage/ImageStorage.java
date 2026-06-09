package com.photocalendar.calendar.storage;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import net.coobird.thumbnailator.Thumbnails;

/** 로컬 디스크 이미지 저장소: 풀+썸네일 리사이즈 저장, 파일 삭제, URL↔경로 매핑. */
@Component
public class ImageStorage {

    public record StoredImage(String imageUrl, String thumbUrl) {
    }

    private final Path baseDir;
    private final Path fullDir;
    private final Path thumbDir;
    private final String baseUrl;
    private final int fullMaxPx;
    private final int thumbMaxPx;

    public ImageStorage(@Value("${app.upload.dir}") String uploadDir,
                        @Value("${app.upload.base-url}") String baseUrl,
                        @Value("${app.upload.full-max-px}") int fullMaxPx,
                        @Value("${app.upload.thumb-max-px}") int thumbMaxPx) {
        this.baseDir = Path.of(uploadDir).toAbsolutePath().normalize();
        this.fullDir = baseDir.resolve("full");
        this.thumbDir = baseDir.resolve("thumb");
        this.baseUrl = baseUrl;
        this.fullMaxPx = fullMaxPx;
        this.thumbMaxPx = thumbMaxPx;
        try {
            Files.createDirectories(fullDir);
            Files.createDirectories(thumbDir);
        } catch (IOException e) {
            throw new UncheckedIOException("업로드 디렉터리 생성 실패: " + baseDir, e);
        }
    }

    /** 풀+썸네일을 JPEG로 저장(종횡비 유지, 확대 없이 축소만). */
    public StoredImage storeResized(BufferedImage image) {
        String name = UUID.randomUUID() + ".jpg";
        int longest = Math.max(image.getWidth(), image.getHeight());
        double fullScale = Math.min(1.0, (double) fullMaxPx / longest);
        double thumbScale = Math.min(1.0, (double) thumbMaxPx / longest);
        try {
            Thumbnails.of(image).scale(fullScale).outputFormat("jpg").toFile(fullDir.resolve(name).toFile());
            Thumbnails.of(image).scale(thumbScale).outputFormat("jpg").toFile(thumbDir.resolve(name).toFile());
        } catch (IOException e) {
            throw new UncheckedIOException("이미지 저장 실패", e);
        }
        return new StoredImage(baseUrl + "/full/" + name, baseUrl + "/thumb/" + name);
    }

    /** URL들에 대응하는 파일 삭제(best-effort). */
    public void deleteFiles(String... urls) {
        for (String url : urls) {
            Path p = resolve(url);
            if (p != null) {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ignored) {
                    // best-effort: 파일 없음/권한 등은 무시(교체·삭제 흐름을 막지 않음)
                }
            }
        }
    }

    /** /uploads/.. URL → 베이스 하위 디스크 경로. 베이스 밖이면 null(traversal 차단). */
    private Path resolve(String url) {
        if (url == null || !url.startsWith(baseUrl + "/")) {
            return null;
        }
        Path p = baseDir.resolve(url.substring(baseUrl.length() + 1)).normalize();
        return p.startsWith(baseDir) ? p : null;
    }
}
