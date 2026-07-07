# Brainstorm Report — Meshy/Unity MCP & Model Generation Pipeline

- Date: 2026-07-07 21:18 (+07)
- Repo: arenahub-asset (worktree `claude/vigorous-pascal-36eb80`)
- Mode flags: `--html` (HTML report cạnh file này)
- Status: APPROVED — user chọn Phương án A + commit binary vào git

## 1. Problem Statement (problem-first inversion)

User đề xuất giải pháp: "thêm MCP cho Meshy và Unity để generate model". Vấn đề gốc bên dưới:

- **Repo chỉ tiêu thụ asset có sẵn** (207 pack Kenney CC0). Không có khả năng tạo asset MỚI theo yêu cầu game — thiếu sprite/model đặc thù thì bí.
- **48 pack 3D Kenney đang "chết"**: repo có GLB/GLTF nhưng engine chỉ render Canvas 2D, không game nào dùng được.
- **Muốn năng lực generate dùng chung cho nhiều người**: không phải setup cá nhân, mà là AI skill/config check vào repo — ai clone cũng dùng được với API key riêng.
- Unity KHÔNG giải quyết vấn đề generate (Unity là editor tiêu thụ model). Nó là hướng game tương lai — tách scope.

## 2. Requirements (đã chốt qua Q&A)

| Item | Quyết định |
|---|---|
| Mục tiêu model Meshy | Cả hai: ingest làm asset pack chung → phục vụ sprite-render 2D trước mắt + template 3D sau |
| Unity | Hướng game tương lai — docs + roadmap, brainstorm riêng; KHÔNG vào `.mcp.json` repo |
| Meshy plan/license | Hỗ trợ CẢ HAI: free (output CC BY 4.0, bắt buộc attribution) + paid (owned) |
| Multi-user | Skill + config project-scoped, mỗi user mang `MESHY_API_KEY` riêng qua env |
| Gap analysis | Danh sách xếp hạng, không thiết kế sâu |
| Lưu binary generated | Commit thẳng git (asset generated là duy nhất, không tái tải vĩnh viễn) |

## 3. Scout Evidence

- Stack: HTML5 Canvas 2D + TS strict + Vite, zero engine frameworks. Không `.mcp.json`, không three.js, không Unity.
- Pipeline asset đã multi-source: `assets/{source}-{slug}/`, resolver trong `scripts/asset-source-resolvers.mjs`, license per-pack với cảnh báo CC-BY attribution (`docs/conventions.md:54-59`).
- Binary Kenney gitignored (tái tải được); 2 pack R1 ngoại lệ commit đầy đủ — tiền lệ cho việc commit binary generated.
- Verify bên ngoài: Meshy có MCP CHÍNH THỨC `@meshy-ai/meshy-mcp-server` (npm, tools: text-to-3d, image-to-3d, refine, remesh, retexture, rig, animate; cần `MESHY_API_KEY`). Unity MCP chính thức đi kèm AI Assistant package: cần Unity 6+, subscription, link Unity Cloud — thuần machine-local.

## 4. Approaches Evaluated

### A — MCP chính thức + Skill trong repo + Pipeline ingest ✅ CHỌN
- `.mcp.json` root: server Meshy chính thức qua npx, env-expansion cho API key.
- Skill `.claude/skills/meshy-model-gen/` check vào repo: generate → download → ingest `assets/meshy-{slug}/` → catalog. Mã hoá luật license 2 nhánh.
- Pros: zero MCP code phải maintain, server do Meshy maintain, multi-user tự nhiên, skill mã hoá được toàn bộ convention repo.
- Cons: phụ thuộc schema tool của server chính thức; sprite render vẫn là bài toán mở (phase riêng).

### B — Tự viết MCP server wrapper ❌
- Gói Meshy API + ingest thành 1 tool "generate-and-ingest".
- Cons: maintenance MCP code, trùng chức năng server chính thức, vi phạm YAGNI. Loại.

### C — Skill + REST trực tiếp, không MCP ❌ (giữ làm fallback)
- Script Node gọi Meshy REST, chạy được CI/headless.
- Cons: mất tương tác conversational; user yêu cầu MCP rõ ràng. Có thể bổ sung script fallback sau nếu cần automation.

## 5. Final Solution — Phương án A, 4 phases

### Phase 1 — MCP config + Skill + Ingest convention (core, làm ngay)
1. `.mcp.json` root repo:
```json
{
  "mcpServers": {
    "meshy": {
      "command": "npx",
      "args": ["-y", "@meshy-ai/meshy-mcp-server"],
      "env": { "MESHY_API_KEY": "${MESHY_API_KEY}" }
    }
  }
}
```
2. Mở rộng schema `pack.json` cho asset generated (cập nhật `docs/conventions.md`):
```json
{
  "id": "meshy-{slug}",
  "generator": "meshy",
  "license": "CC-BY-4.0 | proprietary-owned",
  "attribution": "Generated with Meshy (meshy.ai)",   // bắt buộc khi CC-BY
  "provenance": { "prompt": "...", "taskId": "...", "generatedBy": "user@...", "plan": "free|paid" },
  "style": "...", "tags": [...], "types": ["3d-models"], "importedAt": "..."
}
```
3. Skill `.claude/skills/meshy-model-gen/SKILL.md`: quy trình generate → poll task → download GLB/textures vào `assets/meshy-{slug}/` → viết `pack.json` (hỏi user plan free/paid để ghi license đúng) → `npm run catalog`. Luật cứng: pack CC-BY chỉ được dùng trong game có attribution surface.
4. Gitignore: thêm ngoại lệ `!assets/meshy-*/**` (binary generated commit thẳng — như tiền lệ 2 pack R1).
5. Docs: `docs/generated-assets-guide.md` (ngắn) + cập nhật CLAUDE.md mục "Finding assets".

### Phase 2 — Sprite-render pipeline (2D path)
- Script render GLB → sprite sheet nhiều góc (turntable) cho engine Canvas hiện tại.
- Ứng viên kỹ thuật: three.js + puppeteer headless GL, hoặc Blender CLI. Windows headless GL lắt léo — cần spike trước khi cam kết. Output đổ vào pack dạng `sprites/` cạnh model.

### Phase 3 — Template three.js + game 3D tham chiếu
- `templates/threejs-game/` + 1 game 3D reference (extraction-over-speculation: build game trước, extract sau).
- Unlock 48 pack Kenney 3D + model Meshy. Vi phạm nhẹ "zero engine frameworks" — chấp nhận three.js là dependency build-time, vendor theo nguyên tắc hiện tại.

### Phase 4 — Unity track (docs-only, brainstorm riêng khi kích hoạt)
- `docs/unity-mcp-setup.md`: hướng dẫn setup user-level (Unity 6+, AI Assistant package, subscription, Unity Cloud). KHÔNG check config vào repo.
- Roadmap entry: game Unity WebGL cho arenahub cần thiết kế lại nguyên tắc vendoring/static-dist → brainstorm riêng.

## 6. Gap Analysis — repo có thể bổ sung gì (xếp hạng impact/effort)

| # | Bổ sung | Impact | Effort | Ghi chú |
|---|---|---|---|---|
| 1 | Meshy MCP + skill + ingest (plan này) | Cao | Thấp | Mở năng lực asset mới |
| 2 | Template three.js + game 3D ref | Cao | Trung | Unlock 48 pack 3D đang chết |
| 3 | Sprite-render GLB→spritesheet | Trung | Trung | Cần spike headless GL |
| 4 | Populate `rules/` (poker, werewolf...) | Cao | Thấp | Đã hứa từ R2, đang trống; thuần markdown |
| 5 | Components mới: leaderboard, pause-menu, touch-joystick | Trung | Thấp | Extract khi game thứ 3 cần |
| 6 | SFX/music generation (skill ai-multimodal sẵn có) | Trung | Thấp | Cùng pattern ingest như Meshy |
| 7 | Template thứ 2: puzzle/board-game | Trung | Trung | Khi có game family mới |
| 8 | Unity WebGL track | Cao | Rất cao | Phá vendoring/static-dist — brainstorm riêng |

## 7. Risks & Mitigations

- **License leak**: game dùng pack CC-BY không attribution → skill enforce + cảnh báo trong catalog row. Mitigate: luật cứng trong SKILL.md + cột license trong catalog.
- **Official MCP server đổi schema**: skill mô tả workflow theo tên tool — cập nhật khi Meshy bump major. Mitigate: ghi version server vào skill.
- **Repo phình vì binary**: mỗi model vài MB, commit thẳng. Chấp nhận ở volume thấp; ngưỡng chuyển Git LFS/R2 ghi trong docs (ví dụ >500MB tổng meshy-*).
- **Headless GL trên Windows (phase 2)**: chưa chắc chạy — phải spike trước, có fallback Blender CLI.
- **`${VAR}` env expansion trong `.mcp.json`**: verify Claude Code hỗ trợ expansion khi implement; fallback = hướng dẫn user set env trực tiếp.

## 8. Success Metrics

- User mới clone repo + set `MESHY_API_KEY` → generate model + ingest đúng convention trong 1 phiên, không cần hỏi thêm.
- 100% pack `meshy-*` có `pack.json` đầy đủ license + provenance; catalog hiển thị license.
- Không game nào ship asset CC-BY thiếu attribution.

## 9. Next Steps

1. `/ck:plan` cho Phase 1 (MCP config + skill + convention) — scope nhỏ, làm trước.
2. Spike headless GL (phase 2) tách riêng.
3. Phase 3-4 chờ phase 1 chạy thật.

## Unresolved Questions

- Claude Code có expand `${MESHY_API_KEY}` trong `.mcp.json` env không? (verify khi implement; nếu không → docs hướng dẫn set env shell)
- Meshy free-plan output có metadata license machine-readable trong API response không, hay skill phải hỏi user plan? (tạm: hỏi user)
- Ngưỡng dung lượng cụ thể để chuyển sang LFS/R2? (đề xuất 500MB, chốt khi gần chạm)
