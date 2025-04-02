

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import BlogService from "../services/blog.service" // Fixed import path
import type { BlogFilters, BlogPostDataToSend } from "../types/blog.types"

// Query keys for better cache management
export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (filters: BlogFilters) => [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const,

  categories: ["blog-categories"] as const,
  categoriesList: () => [...blogKeys.categories, "list"] as const,

  tags: ["blog-tags"] as const,
  tagsList: () => [...blogKeys.tags, "list"] as const,
}

// Blog Posts Hooks
export function useBlogs(filters: BlogFilters = {}) {
  return useQuery({
    queryKey: blogKeys.list(filters),
    queryFn: () => BlogService.getPosts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBlogDetail(id: string) {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: () => BlogService.getPostById(id),
    enabled: !!id, // Only run if id is provided
  })
}

export function useCreateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postData: Partial<BlogPostDataToSend & { featuredImageFile?: File | null }>) =>
      BlogService.createPost(postData),
    onSuccess: () => {
      // Invalidate blog lists to refetch
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() })
    },
  })
}

export function useUpdateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      postData,
    }: {
      id: string
      postData: Partial<BlogPostDataToSend & { featuredImageFile?: File | null }>
    }) => BlogService.updatePost(id, postData),
    onSuccess: (data, variables) => {
      // Update both the list and the specific blog detail
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() })
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(variables.id) })
    },
  })
}

export function useDeleteBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => BlogService.deletePost(id),
    onSuccess: () => {
      // Invalidate blog lists to refetch
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() })
    },
  })
}

// Blog Categories Hooks
export function useBlogCategories(filters: any = {}) {
  return useQuery({
    queryKey: blogKeys.categoriesList(),
    queryFn: () => BlogService.getCategories(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryData: { name: string }) => BlogService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categoriesList() })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, categoryData }: { id: string; categoryData: { name: string } }) =>
      BlogService.updateCategory(id, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categoriesList() })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => BlogService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categoriesList() })
    },
  })
}

// Blog Tags Hooks
export function useBlogTags(filters: any = {}) {
  return useQuery({
    queryKey: blogKeys.tagsList(),
    queryFn: () => BlogService.getTags(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tagData: { name: string }) => BlogService.createTag(tagData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.tagsList() })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, tagData }: { id: string; tagData: { name: string } }) => BlogService.updateTag(id, tagData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.tagsList() })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => BlogService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.tagsList() })
    },
  })
}

