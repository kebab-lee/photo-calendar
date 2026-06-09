-- 포토 다이어리 캘린더 — DB 스키마 (1단계)
-- 네이밍: snake_case (CLAUDE.md 코딩 컨벤션)
-- 적용: MySQL에 직접 import (앱 자동 실행 안 함)
--   예) mysql -u photocalendar -p photocalendar < schema.sql

CREATE TABLE `user` (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE day_entry (
  id         BIGINT   NOT NULL AUTO_INCREMENT,
  user_id    BIGINT   NOT NULL,
  entry_date DATE     NOT NULL,
  comment    TEXT     NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- 사용자별 하루 1개
  UNIQUE KEY uk_day_entry_user_date (user_id, entry_date),
  CONSTRAINT fk_day_entry_user FOREIGN KEY (user_id)
    REFERENCES `user`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE day_image (
  id           BIGINT       NOT NULL AUTO_INCREMENT,
  day_entry_id BIGINT       NOT NULL,
  image_url    VARCHAR(512) NOT NULL,
  thumb_url    VARCHAR(512) NOT NULL,
  fit          VARCHAR(10)  NOT NULL DEFAULT 'cover',  -- 'cover' / 'contain'
  sort_order   INT          NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_day_image_entry (day_entry_id),
  CONSTRAINT fk_day_image_entry FOREIGN KEY (day_entry_id)
    REFERENCES day_entry(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE todo (
  id           BIGINT       NOT NULL AUTO_INCREMENT,
  day_entry_id BIGINT       NOT NULL,
  content      VARCHAR(500) NOT NULL,
  is_done      TINYINT(1)   NOT NULL DEFAULT 0,
  sort_order   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_todo_entry (day_entry_id),
  CONSTRAINT fk_todo_entry FOREIGN KEY (day_entry_id)
    REFERENCES day_entry(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
