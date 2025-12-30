export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "FOLLOW" | "COMMENT" | "LIKE" | "SYSTEM" | string;
  createdAt: string;
  senderName: string | null;
  recipeId: number | null;
  userId: number | null;
  read: boolean; // API có trả về
}
