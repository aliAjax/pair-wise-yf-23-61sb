export const mockData = {
  "fixture": [
    { "id": 1, "fixture_code": "PAR-01", "fixture_type": "PAR", "position_x": "80", "position_y": "60", "dmx_address": "1", "channel_count": 4, "color_mode": "RGBW" },
    { "id": 2, "fixture_code": "PAR-02", "fixture_type": "PAR", "position_x": "200", "position_y": "60", "dmx_address": "5", "channel_count": 4, "color_mode": "RGBW" },
    { "id": 3, "fixture_code": "SPOT-01", "fixture_type": "SPOT", "position_x": "320", "position_y": "60", "dmx_address": "9", "channel_count": 6, "color_mode": "MOVING_HEAD" },
    { "id": 4, "fixture_code": "WASH-01", "fixture_type": "WASH", "position_x": "440", "position_y": "60", "dmx_address": "15", "channel_count": 4, "color_mode": "RGBW" },
    { "id": 5, "fixture_code": "BEAM-01", "fixture_type": "BEAM", "position_x": "160", "position_y": "240", "dmx_address": "19", "channel_count": 3, "color_mode": "RGB" },
    { "id": 6, "fixture_code": "STROBE-01", "fixture_type": "STROBE", "position_x": "400", "position_y": "240", "dmx_address": "22", "channel_count": 2, "color_mode": "DIMMER_ONLY" }
  ],
  "cueScene": [
    { "id": 1, "name": "开场暖场", "fixture_states": "{\"1\":\"#f59e0b\",\"2\":\"#f59e0b\"}", "fade_in_ms": "800", "hold_ms": "4200", "priority": "5", "scene_status": "READY" },
    { "id": 2, "name": "主歌律动", "fixture_states": "{\"3\":\"#38bdf8\",\"4\":\"#38bdf8\"}", "fade_in_ms": "500", "hold_ms": "4500", "priority": "10", "scene_status": "READY" },
    { "id": 3, "name": "高潮频闪", "fixture_states": "{\"5\":\"#f8fafc\",\"6\":\"#f8fafc\"}", "fade_in_ms": "100", "hold_ms": "2900", "priority": "20", "scene_status": "READY" },
    { "id": 4, "name": "旧版谢幕", "fixture_states": "{\"1\":\"#ef4444\"}", "fade_in_ms": "1200", "hold_ms": "3800", "priority": "5", "scene_status": "DISABLED" },
    { "id": 5, "name": "备用开场", "fixture_states": "{\"2\":\"#22c55e\"}", "fade_in_ms": "600", "hold_ms": "4400", "priority": "8", "scene_status": "ARCHIVED" }
  ],
  "timelineTrack": [
    { "id": 1, "cue_scene_id": 1, "start_ms": "0", "duration_ms": "5000", "layer": "1", "locked": "false", "track_status": "REPLACED" },
    { "id": 2, "cue_scene_id": 2, "start_ms": "3000", "duration_ms": "5000", "layer": "1", "locked": "false", "track_status": "ACTIVE" },
    { "id": 3, "cue_scene_id": 3, "start_ms": "9000", "duration_ms": "3000", "layer": "1", "locked": "false", "track_status": "ACTIVE" },
    { "id": 4, "cue_scene_id": 4, "start_ms": "12000", "duration_ms": "5000", "layer": "1", "locked": "false", "track_status": "INVALID" },
    { "id": 5, "cue_scene_id": 5, "start_ms": "3000", "duration_ms": "4000", "layer": "2", "locked": "false", "track_status": "INVALID" },
    { "id": 6, "cue_scene_id": 2, "start_ms": "0", "duration_ms": "2000", "layer": "2", "locked": "true", "track_status": "ACTIVE" }
  ],
  "showProject": [
    { "id": 1, "title": "周五联排方案", "venue_name": "实验剧场", "fixture_ids": [1, 2, 3, 4, 5, 6], "track_ids": [1, 2, 3, 4, 5, 6], "updated_at": "2026-09-26T09:00:00Z" }
  ]
} as const;
