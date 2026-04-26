-- ============================================
-- Login Server — Tables
-- Database: super_warrior_z
-- Tables: users, servers, login_history, user_login_logs
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    user_id             VARCHAR(64)     PRIMARY KEY,
    password            VARCHAR(128)    NOT NULL DEFAULT 'game_origin',
    channel_code        VARCHAR(32)     NOT NULL DEFAULT 'game_origin',
    nick_name           VARCHAR(64)     DEFAULT '',
    security_code       VARCHAR(128)    DEFAULT '',
    vip_level           INT             DEFAULT 0,
    vip_exp             INT             DEFAULT 0,
    level               INT             DEFAULT 1,
    exp                 BIGINT          DEFAULT 0,
    diamond             BIGINT          DEFAULT 0,
    gold                BIGINT          DEFAULT 0,
    power               INT             DEFAULT 0,
    head_image          VARCHAR(64)     DEFAULT '',
    head_box            INT             DEFAULT 0,
    create_time         BIGINT          NOT NULL DEFAULT 0,
    last_login_time     BIGINT          NOT NULL DEFAULT 0,
    last_login_server   INT             DEFAULT 0,
    login_token         VARCHAR(128)    DEFAULT '',
    language            VARCHAR(8)      DEFAULT 'en',
    today_login_count   INT             DEFAULT 0,
    today_login_date    DATE            DEFAULT '1970-01-01',
    is_banned           TINYINT(1)      DEFAULT 0,
    register_server_id  INT             DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS servers (
    server_id               INT             PRIMARY KEY,
    server_name             VARCHAR(64)     NOT NULL,
    url                     VARCHAR(256)    NOT NULL,
    chat_url                VARCHAR(256)    NOT NULL,
    dungeon_url             VARCHAR(256)    NOT NULL,
    world_room_id           VARCHAR(64)     NOT NULL DEFAULT '',
    guild_room_id           VARCHAR(64)     NOT NULL DEFAULT '',
    team_dungeon_chat_room  VARCHAR(64)     NOT NULL DEFAULT '',
    status                  TINYINT(1)      DEFAULT 1,
    is_hot                  TINYINT(1)      DEFAULT 0,
    is_new                  TINYINT(1)      DEFAULT 0,
    offline_reason          VARCHAR(256)    DEFAULT '',
    sort_order              INT             DEFAULT 0,
    open_time               TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_history (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(64)     NOT NULL,
    server_id   INT             NOT NULL,
    channel_code VARCHAR(32)    DEFAULT '',
    login_time  BIGINT          NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_user_server (user_id, server_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_login_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(64)     NOT NULL,
    channel_code VARCHAR(32)    DEFAULT '',
    sub_channel VARCHAR(64)     DEFAULT '',
    server_id   INT             DEFAULT 0,
    user_level  INT             DEFAULT 1,
    create_time BIGINT          DEFAULT 0,
    login_time  BIGINT          DEFAULT 0,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO servers (
    server_id, server_name, url, chat_url, dungeon_url,
    world_room_id, guild_room_id, team_dungeon_chat_room,
    status, is_hot, is_new, offline_reason, sort_order
) VALUES (
    1001, 'Server 1',
    'http://127.0.0.1:8100',
    'http://127.0.0.1:8200',
    'http://127.0.0.1:8300',
    'world_1001', 'guild_1001', 'teamdungeon_1001',
    1, 0, 1, '', 1
);
