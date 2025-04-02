export interface BlogPost {
  _id?: string
  title: string
  slug?: string
  content: string
  excerpt: string
  featuredImage: string | null
  author?: {
    _id: string
    name: string
    email?: string
  } | null
  status: "draft" | "published" | "scheduled"
  categories: string[] | BlogCategory[]
  tags: string[] | BlogTag[]
  metaTitle?: string
  metaDescription?: string
  publishedAt?: string | null
  scheduledAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface BlogCategory {
  _id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface BlogTag {
  _id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

