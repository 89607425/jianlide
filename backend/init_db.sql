-- 简立得数据库初始化脚本
-- 执行方式: mysql -u root -p < init_db.sql

CREATE DATABASE IF NOT EXISTS jianlida DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jianlida;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `nickname` VARCHAR(50) DEFAULT '' COMMENT '昵称',
    `email` VARCHAR(100) DEFAULT '' COMMENT '邮箱',
    `member_type` TINYINT NOT NULL DEFAULT 0 COMMENT '0免费用户 1付费会员',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 简历表
CREATE TABLE IF NOT EXISTS `resume` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '所属用户',
    `file_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
    `file_path` VARCHAR(500) NOT NULL COMMENT '服务器存储路径',
    `raw_text` TEXT COMMENT 'PDF提取的原文',
    `parsed_data` JSON COMMENT '结构化解析结果',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0解析中 1成功 2失败',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='简历表';

-- 诊断报告表
CREATE TABLE IF NOT EXISTS `diagnosis` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `resume_id` BIGINT NOT NULL COMMENT '关联简历',
    `ats_score` TINYINT NOT NULL DEFAULT 0 COMMENT 'ATS通过率得分 0-20',
    `content_score` TINYINT NOT NULL DEFAULT 0 COMMENT '内容质量得分 0-25',
    `project_score` TINYINT NOT NULL DEFAULT 0 COMMENT '项目经历得分 0-30',
    `match_score` TINYINT NOT NULL DEFAULT 0 COMMENT '岗位匹配度得分 0-25',
    `total_score` TINYINT NOT NULL DEFAULT 0 COMMENT '总分 0-100',
    `detail` JSON NOT NULL COMMENT '完整诊断详情JSON',
    `is_unlocked` TINYINT NOT NULL DEFAULT 0 COMMENT '0未解锁 1已解锁',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_resume_id` (`resume_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诊断报告表';

-- 润色结果表
CREATE TABLE IF NOT EXISTS `polish_result` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `resume_id` BIGINT NOT NULL COMMENT '关联简历',
    `polished_text` TEXT NOT NULL COMMENT '润色后全文',
    `diff_data` JSON COMMENT '润色对比数据',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_resume_id` (`resume_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='润色结果表';

-- 订单表
CREATE TABLE IF NOT EXISTS `order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '下单用户',
    `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
    `product_type` TINYINT NOT NULL COMMENT '1完整报告 2AI润色',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '金额',
    `pay_channel` TINYINT NOT NULL DEFAULT 1 COMMENT '1微信 2苹果',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0待支付 1已支付 2已退款',
    `transaction_id` VARCHAR(128) DEFAULT '' COMMENT '第三方交易号',
    `resume_id` BIGINT COMMENT '关联简历（解锁哪份报告）',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `paid_at` DATETIME DEFAULT NULL COMMENT '支付时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
