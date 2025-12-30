export interface Blog {
  blog_id: number;
  author_id: number;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  tags: string[];
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  created_at: string;
  updated_at: string;
}
