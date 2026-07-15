-- DragonTile Games — D1 Database Schema
-- Run this in Cloudflare D1 dashboard or via: wrangler d1 execute dragontile-db --file=schema.sql

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL CHECK(game IN ('mahjong', 'klotski', 'hanzi', 'touhu', 'abacus')),
  player TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  time_seconds INTEGER NOT NULL DEFAULT 0,
  player_token TEXT,
  approved INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_game ON scores(game);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_created ON scores(created_at);
CREATE INDEX IF NOT EXISTS idx_scores_token ON scores(player_token);

-- Sample data for testing
INSERT OR IGNORE INTO scores (game, player, score, time_seconds, created_at) VALUES
('mahjong', 'DragonMaster99', 420, 135, '2026-07-01T00:00:00Z'),
('mahjong', 'TileWhisperer', 385, 182, '2026-07-02T00:00:00Z'),
('mahjong', 'ZenPanda', 350, 168, '2026-07-03T00:00:00Z'),
('mahjong', 'BambooKing', 320, 210, '2026-07-04T00:00:00Z'),
('mahjong', 'JadeWarrior', 300, 245, '2026-07-05T00:00:00Z'),
('mahjong', 'SilkRoad', 280, 195, '2026-07-06T00:00:00Z'),
('mahjong', 'LotusFlower', 250, 260, '2026-07-07T00:00:00Z'),
('mahjong', 'EastWind', 220, 300, '2026-07-08T00:00:00Z'),
('mahjong', 'GreatWall', 200, 285, '2026-07-09T00:00:00Z'),
('mahjong', 'RiceField', 180, 330, '2026-07-10T00:00:00Z'),
('klotski', 'SlideMaster', 1560, 45, '2026-07-01T00:00:00Z'),
('klotski', 'CaoCaoFan', 1420, 52, '2026-07-02T00:00:00Z'),
('klotski', 'PuzzlePro', 1380, 62, '2026-07-03T00:00:00Z'),
('hanzi', 'WordNinja', 980, 330, '2026-07-01T00:00:00Z'),
('hanzi', 'RadicalRacer', 850, 375, '2026-07-02T00:00:00Z');
