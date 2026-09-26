export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "PAR-01",
      "fixture_type": "PAR",
      "position_x": "120",
      "position_y": "80",
      "dmx_address": "1",
      "channel_count": 4,
      "color_mode": "RGBW"
    },
    {
      "id": 2,
      "fixture_code": "SPOT-01",
      "fixture_type": "SPOT",
      "position_x": "260",
      "position_y": "60",
      "dmx_address": "17",
      "channel_count": 6,
      "color_mode": "MOVING_HEAD"
    },
    {
      "id": 3,
      "fixture_code": "WASH-01",
      "fixture_type": "WASH",
      "position_x": "400",
      "position_y": "90",
      "dmx_address": "33",
      "channel_count": 3,
      "color_mode": "RGB"
    },
    {
      "id": 4,
      "fixture_code": "BEAM-01",
      "fixture_type": "BEAM",
      "position_x": "260",
      "position_y": "180",
      "dmx_address": "49",
      "channel_count": 1,
      "color_mode": "DIMMER_ONLY"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "开场暖场",
      "fixture_states": "{\"1\":180,\"3\":120}",
      "fade_in_ms": 2000,
      "hold_ms": 6000,
      "priority": 1,
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "独白追光",
      "fixture_states": "{\"2\":255}",
      "fade_in_ms": 1500,
      "hold_ms": 8000,
      "priority": 3,
      "scene_status": "READY"
    },
    {
      "id": 3,
      "name": "高潮频闪",
      "fixture_states": "{\"4\":255}",
      "fade_in_ms": 200,
      "hold_ms": 4000,
      "priority": 5,
      "scene_status": "READY"
    },
    {
      "id": 4,
      "name": "谢幕亮场",
      "fixture_states": "{\"1\":255,\"2\":255,\"3\":255,\"4\":255}",
      "fade_in_ms": 3000,
      "hold_ms": 5000,
      "priority": 2,
      "scene_status": "DRAFT"
    },
    {
      "id": 5,
      "name": "烟雾特效",
      "fixture_states": "{\"3\":80}",
      "fade_in_ms": 1000,
      "hold_ms": 3000,
      "priority": 4,
      "scene_status": "DISABLED"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": 0,
      "duration_ms": 8000,
      "layer": 1,
      "locked": false
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": 6000,
      "duration_ms": 9500,
      "layer": 1,
      "locked": false
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": 0,
      "duration_ms": 4200,
      "layer": 2,
      "locked": true
    },
    {
      "id": 4,
      "cue_scene_id": 4,
      "start_ms": 17000,
      "duration_ms": 8000,
      "layer": 1,
      "locked": false
    },
    {
      "id": 5,
      "cue_scene_id": 5,
      "start_ms": 5000,
      "duration_ms": 4000,
      "layer": 2,
      "locked": false
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "title 1",
      "venue_name": "venue name 1",
      "fixture_ids": [
        1,
        2
      ],
      "track_ids": [
        1,
        2
      ],
      "updated_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "title": "title 2",
      "venue_name": "venue name 2",
      "fixture_ids": [
        1,
        2
      ],
      "track_ids": [
        1,
        2
      ],
      "updated_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "title": "title 3",
      "venue_name": "venue name 3",
      "fixture_ids": [
        1,
        2
      ],
      "track_ids": [
        1,
        2
      ],
      "updated_at": "2026-06-13T09:00:00Z"
    }
  ]
} as const;
