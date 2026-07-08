-- Add instagram_media table
CREATE TABLE IF NOT EXISTS `instagram_media` (
  `id`            VARCHAR(191) NOT NULL,
  `shortcode`     VARCHAR(191) NOT NULL,
  `media_type`    VARCHAR(191) NOT NULL,
  `url`           TEXT         NOT NULL,
  `thumbnail_url` TEXT         NULL,
  `caption`       TEXT         NULL,
  `posted_at`     DATETIME(3)  NOT NULL,
  `source_url`    TEXT         NULL,
  `category`      VARCHAR(191) NULL,
  `is_featured`   BOOLEAN      NOT NULL DEFAULT false,
  `created_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `instagram_media_shortcode_key` (`shortcode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
