
export interface Comment {
  commentId: number;           // ID bình luận (từ backend: commentID)
  parentId: number | null;     // ID bình luận cha (từ backend: parentCommentId)
  content: string;             // Nội dung bình luận
  createdAt: string;           // Ngày tạo (từ backend: createAt)
  updateAt: string;
  user: {
    fullName: string;          // Tên user (từ backend: username)
    avatarUrl: string;         // Ảnh user (từ backend: avatarUrl)
    userId: number;
  };
  replies: [];
}
