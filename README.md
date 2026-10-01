# df-codes-data

Dữ liệu giftcode cộng đồng cho extension **Auto Redeem Code Delta Force**.

## Mục đích

Extension đọc file [`codes.json`](./codes.json) từ repo này để hiển thị danh sách code mới cho người dùng — không cần cập nhật extension, không cần tự tìm trên mạng.

## Cấu trúc

| File | Vai trò |
|---|---|
| `codes.json` | Code đã được user **verify trên tài khoản thật**, dùng được |
| `expired.json` | Code đã hết hạn (audit log) |
| `schema.json` | JSON Schema cho `codes.json` (cho phép `tier` + `verifiedAt`) |
| `.github/workflows/refresh.yml` | GitHub Actions: validate + bump metadata |

## Tier

Mỗi code có field `tier` (extension 1.7.7+ đọc để lọc UI):

| Tier | Ý nghĩa | Số lượng |
|---|---|---|
| `safe` | User đã đổi thành công trên tk thật | 263 |
| `risky` | Server Garena lỗi cấu hình, không phải lỗi mã | 21 |
| `broken` | Hết hạn hoặc sai format (đÃ BỎ khỏi repo) | 0 |
| `unknown` | Chưa verify | 0 |

## Phase 1 (hiện tại)

Read-only. Tác giả extension commit trực tiếp vào `codes.json`. Workflow tự động validate + bump `lastUpdated`.

## Phase tiếp theo (planned)

- **Phase 2**: Mở GitHub Issue với label `code-submission` để cộng đồng gửi code mới.
- **Phase 3**: Vote bằng 👍 reaction trên Issues.
- **Phase 4**: GitHub Actions tự promote submission có ≥ N votes vào `codes.json`.

## Quy tắc khi thêm code

1. `id` phải unique (dùng slug hoặc hash ngắn).
2. `code` chỉ chứa `[A-Za-z0-9_-]`, 6–40 ký tự.
3. Bắt buộc có `validUntil` (ISO-8601).
4. Nên có `source` (URL bài viết gốc).
5. Sau khi push, GitHub Actions tự validate và bump `lastUpdated`.

## Đóng góp

Mở Issue với label `code-submission` (Phase 2+). Trước Phase 2, PR trực tiếp vào `codes.json` cũng được chấp nhận.
