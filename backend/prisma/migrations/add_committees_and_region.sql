-- Add committees table
CREATE TABLE IF NOT EXISTS `committees` (
  `id`         VARCHAR(191) NOT NULL,
  `name`       VARCHAR(191) NOT NULL,
  `name_ar`    VARCHAR(191) NULL,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add region/iqlim/city/committee fields to users
ALTER TABLE `users`
  ADD COLUMN `region` ENUM(
    'TANGER_TETOUAN_AL_HOCEIMA',
    'ORIENTAL',
    'FES_MEKNES',
    'RABAT_SALE_KENITRA',
    'BENI_MELLAL_KHENIFRA',
    'CASABLANCA_SETTAT',
    'MARRAKECH_SAFI',
    'DRAA_TAFILALET',
    'SOUSS_MASSA',
    'GUELMIM_OUED_NOUN',
    'LAAYOUNE_SAKIA_EL_HAMRA',
    'DAKHLA_OUED_ED_DAHAB'
  ) NULL,
  ADD COLUMN `iqlim` VARCHAR(191) NULL,
  ADD COLUMN `city` VARCHAR(191) NULL,
  ADD COLUMN `committee_id` VARCHAR(191) NULL,
  ADD INDEX `users_committee_id_fkey` (`committee_id`),
  ADD CONSTRAINT `users_committee_id_fkey` FOREIGN KEY (`committee_id`) REFERENCES `committees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
