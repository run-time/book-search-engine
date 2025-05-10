export interface BookInput {
  bookId: string;
  authors: string[];
  description: string;
  title: string;
  image?: string;
  link?: string;
}