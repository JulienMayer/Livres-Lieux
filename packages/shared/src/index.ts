export type Visibility = 'PUBLIC' | 'PRIVATE';

export interface UserDTO {
  id: string;
  email: string;
  displayName?: string | null;
}

export interface BookDTO {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
}

export interface PlaceDTO {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface ListDTO {
  id: string;
  name: string;
  visibility: Visibility;
  userId?: string | null;
}

