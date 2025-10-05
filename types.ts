export interface Category {
  id: string;
  name: string;
}

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  categoryId: string;
}