package com.photocalendar.calendar.storage;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.UUID;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

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

    /** 풀+썸네일을 JPEG로 저장(종횡비 유지, 확대 없이 축소만, EXIF Orientation 자동 회전). */
    public StoredImage storeResized(byte[] imageBytes) {
        String name = UUID.randomUUID() + ".jpg";
        // 긴 변은 회전해도 변하지 않으므로 헤더의 원본 크기로 스케일을 구해도 안전하다.
        int longest = longestSide(imageBytes);
        double fullScale = Math.min(1.0, (double) fullMaxPx / longest);
        double thumbScale = Math.min(1.0, (double) thumbMaxPx / longest);
        try {
            // BufferedImage가 아닌 원본 스트림을 넘겨야 Thumbnailator가 EXIF Orientation을 읽어 자동 회전한다.
            Thumbnails.of(new ByteArrayInputStream(imageBytes)).scale(fullScale).outputFormat("jpg").toFile(fullDir.resolve(name).toFile());
            Thumbnails.of(new ByteArrayInputStream(imageBytes)).scale(thumbScale).outputFormat("jpg").toFile(thumbDir.resolve(name).toFile());
        } catch (IOException e) {
            throw new UncheckedIOException("이미지 저장 실패", e);
        }
        return new StoredImage(baseUrl + "/full/" + name, baseUrl + "/thumb/" + name);
    }

    /** 픽셀 디코드 없이 헤더에서 원본 긴 변(px)을 읽는다. */
    private static int longestSide(byte[] imageBytes) {
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(imageBytes))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) {
                throw new IOException("이미지 형식을 인식할 수 없습니다.");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(in);
                return Math.max(reader.getWidth(0), reader.getHeight(0));
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            throw new UncheckedIOException("이미지 저장 실패", e);
        }
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
