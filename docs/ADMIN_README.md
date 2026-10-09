# Giftcode Admin — 100% GitHub
**Không cần Cloudflare, backend riêng hay PAT trong trình duyệt.**

## Quy trình
1. GitHub Pages: tại Settings → Pages → Build and deployment → Deploy from a branch, chọn `main` và `/docs`. Sau khi merge PR, mở `https://kenthudoan.github.io/df-codes-data/`.
2. Trang quản trị tự đọc `codes.json` và `expired.json` công khai từ nhánh `main`; soạn các thay đổi trên thiết bị, kiểm tra rồi bấm **Sao chép lệnh cập nhật**.
3. Mở Actions → **Giftcode Admin Publish** → Run workflow (chọn `main`) → dán JSON vào `changes_json`. Bạn cần đăng nhập GitHub và có quyền chạy Actions; trang Pages không giữ token.
4. Workflow kiểm tra dữ liệu, phát hiện nguồn đã bị cập nhật sau khi bạn mở Dashboard, tạo branch và Pull Request. Bạn xem diff / checks rồi merge thủ công.
5. Sau merge, extension tải dữ liệu mới theo cơ chế fetch/cache hiện có.

## Cài đặt bảo mật repo
- Settings → Actions → General → Workflow permissions: cần `Read and write permissions` và bật **Allow GitHub Actions to create and approve pull requests** cho workflow `admin-publish.yml` được tạo PR.
- Cân nhắc bảo vệ branch `main` bằng rulesets, yêu cầu status check `Giftcode Admin Checks / test` và cấm force push.
- **Không lưu token, mật khẩu hoặc session Garena trong Pages, JSON hay Actions inputs.**
- Chỉ người có quyền chạy workflow trên repository mới phát hành được thay đổi; người truy cập trang công khai chỉ có thể soạn và sao chép payload.

## Đặc tính
- Bảo toàn mã cũ và schema đang dùng; không giả định `safe` nghĩa là mọi tài khoản đều đổi được.
- Mã chưa rõ hạn không có `validUntil`; các placeholder 2099 cũ được giữ nguyên để tránh phát hành thay đổi hàng loạt không được duyệt.
- Chuyển mã đã xác minh hết hạn vào `expired.json`, giữ log `id/code/expiredAt/reason`. Không được dựa riêng vào lỗi `limit` hoặc `used`.
- Thay đổi trong cùng batch không được trùng cùng giftcode; theo dõi xung đột bằng `lastUpdated` ở bước Actions, và kiểm tra lại Git diff trước khi merge.
- Dữ liệu nháp chỉ sống trong tab browser; **nên copy trước khi refresh trang**.
- Trình duyệt không tự tạo PR hoặc đăng nhập OAuth: nút phát hành đưa bạn sang GitHub Actions có xác thực native. Không có database riêng.

## Kiểm thử
`node --test tests/admin.test.mjs` và `node --check docs/app.js`.
