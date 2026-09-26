# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在浏览器 localStorage（首次打开用 `src/mocks` 种子数据初始化）。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>

## 联排工作流（场景 ↔ 时间轴）

- **场景编辑 `/cues`**：调整场景名称、淡入、保持和优先级；保存后新场景自动排入时间轴末尾，已有场景的修改立即同步到时间轴。场景可停用 / 归档 / 恢复。
- **时间轴编排 `/timeline`**：场景停用或归档后，其已排轨道标记为「失效」，不参与播放；同一层时间重叠时保留优先级较高的场景，较低的一条标成「被替换」并留在原位；移除（或停用）高优先级轨道后，被替换的轨道自动恢复。轨道可调整开始时间、换层、锁定与移除。
- **舞台预览 `/preview`**：只播放状态为「正常」的轨道，失效与被替换的轨道单独列出。
- **持久化**：排布、状态和替换关系按最后一次操作结果保存，重新打开页面原样展示（替换关系由 `utils/trackResolver.ts` 按保存数据确定性推导）。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit（Zustand）+ localStorage |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`，或在侧边栏点「重置本地数据」清空 localStorage 恢复种子。

## 枚举/常量出现位置清单

- FixtureType: constants/FixtureType、types/FixtureType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CueStatus: constants/CueStatus、types/CueStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TrackPlayState（ACTIVE 正常 / INVALID 失效 / REPLACED 被替换）: constants/TrackPlayState、types/TrackPlayState、constants/statusText、utils/trackResolver、pages/TimelinePage、pages/PreviewPage、components/common/StatusBadge 均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
