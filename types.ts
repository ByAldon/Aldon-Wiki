interface Category {
  id: string;
  name: string;
}

interface WikiPage {
  id: string;
  title: string;
  content: string;
  categoryId: string;
}