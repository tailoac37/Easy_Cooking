export interface UserUpdateInfo {
  fullName: string;        // Họ tên người dùng
  userName: string;        // Tên hiển thị (username)
  email: string;           // Địa chỉ email
  bio: string;             // Giới thiệu bản thân
  oldPassword?: string;    // Mật khẩu cũ (nếu đổi mật khẩu)
  newPassword?: string;    // Mật khẩu mới (nếu đổi mật khẩu)
}
