import { Tabs } from "antd";
import { useState, Suspense } from "react";
import BlogPostList from "./blog-post-list";
import BlogPostForm from "./blog-post-form";
import CategoryManagement from "./category-management";
import TagManagement from "./tag-management";
import { FileText, Tag, FolderOpen } from "lucide-react";
import type { BlogPost } from "../../types/blog";

export default function BlogManagement() {
  const [activeKey, setActiveKey] = useState("posts");
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    if (key === "posts") {
      setCurrentPostId(null);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setCurrentPostId(post._id);
    setActiveKey("create");
  };

  const handleCreatePost = () => {
    setCurrentPostId(null);
    setActiveKey("create");
  };

  const handleCancelEdit = () => {
    setCurrentPostId(null);
    setActiveKey("posts");
  };

  const items = [
    {
      key: "posts",
      label: (
        <span className="flex items-center gap-2">
          <FileText size={16} />
          Posts del Blog
        </span>
      ),
      children: (
        <BlogPostList
          onEditPost={handleEditPost}
          onCreatePost={handleCreatePost}
        />
      ),
    },
    {
      key: "create",
      label: (
        <span className="flex items-center gap-2">
          <FileText size={16} />
          {currentPostId ? "Editar Post" : "Crear Post"}
        </span>
      ),
      children: (
        <Suspense
          fallback={<div className="p-8 text-center">Cargando editor...</div>}
        >
          <BlogPostForm postId={currentPostId} onCancel={handleCancelEdit} />
        </Suspense>
      ),
    },
    {
      key: "categories",
      label: (
        <span className="flex items-center gap-2">
          <FolderOpen size={16} />
          Categorías
        </span>
      ),
      children: <CategoryManagement />,
    },
    {
      key: "tags",
      label: (
        <span className="flex items-center gap-2">
          <Tag size={16} />
          Etiquetas
        </span>
      ),
      children: <TagManagement />,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Gestión del Blog</h1>
        <p className="text-gray-500">
          Crea y administra el contenido de tu blog
        </p>
      </div>
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={items}
        className="p-4"
        size="large"
        tabBarStyle={{ marginBottom: 24 }}
      />
    </div>
  );
}
