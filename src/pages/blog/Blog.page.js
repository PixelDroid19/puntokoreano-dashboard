import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
//src/pages/blog/Blog.page.tsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Row, Col, Input, Select, Button, Modal, message, Space, Empty, } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import BlogService from "../../services/blog.service";
import BlogPostCard from "./components/BlogPostCard";
import BlogPostForm from "./components/BlogPostForm";
import debounce from "lodash/debounce";
import BlogPostModal from "./components/BlogPostModal";
const Blog = () => {
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState("");
    const [selectedPost, setSelectedPost] = React.useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
    // Queries y Mutations
    const { data: postsData, isLoading } = useQuery({
        queryKey: ["blog-posts", searchText, statusFilter, categoryFilter],
        queryFn: () => BlogService.getPosts({
            search: searchText,
            status: statusFilter || undefined,
            category: categoryFilter || undefined,
        }),
    });
    const createPost = useMutation({
        mutationFn: (post) => BlogService.createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
            message.success("Artículo creado correctamente");
            setIsFormModalOpen(false);
        },
        onError: (error) => {
            message.error(error.message);
        },
    });
    const updatePost = useMutation({
        mutationFn: ({ id, data }) => BlogService.updatePost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
            message.success("Artículo actualizado correctamente");
            setIsFormModalOpen(false);
        },
        onError: (error) => {
            message.error(error.message);
        },
    });
    const deletePost = useMutation({
        mutationFn: (id) => BlogService.deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
            message.success("Artículo eliminado correctamente");
        },
        onError: (error) => {
            message.error(error.message);
        },
    });
    // Handlers
    const handleSearch = debounce((value) => {
        setSearchText(value);
    }, 500);
    const handleSubmit = (values) => {
        console.log('selectedPost', selectedPost);
        if (selectedPost) {
            updatePost.mutate({ id: selectedPost._id, data: values });
        }
        else {
            createPost.mutate(values);
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6 flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Blog" }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => {
                            setSelectedPost(null);
                            setIsFormModalOpen(true);
                        }, children: "Nuevo Art\u00EDculo" })] }), _jsx("div", { className: "mb-6", children: _jsxs(Space, { wrap: true, children: [_jsx(Input, { placeholder: "Buscar art\u00EDculos", prefix: _jsx(SearchOutlined, {}), onChange: (e) => handleSearch(e.target.value), style: { width: 200 } }), _jsx(Select, { placeholder: "Filtrar por estado", allowClear: true, style: { width: 150 }, onChange: (value) => setStatusFilter(value), options: [
                                { label: "Borrador", value: "draft" },
                                { label: "Publicado", value: "published" },
                                { label: "Archivado", value: "archived" },
                            ] }), _jsx(Select, { placeholder: "Filtrar por categor\u00EDa", allowClear: true, style: { width: 150 }, onChange: (value) => setCategoryFilter(value), options: [
                                { label: "Noticias", value: "news" },
                                { label: "Tutoriales", value: "tutorials" },
                                { label: "Productos", value: "products" },
                            ] })] }) }), _jsx(Row, { gutter: [16, 16], children: postsData?.data.posts.length === 0 ? (_jsx(Col, { span: 24, children: _jsx(Empty, { description: "No hay art\u00EDculos disponibles" }) })) : (postsData?.data.posts.map((post) => (_jsx(Col, { xs: 24, sm: 12, lg: 8, xl: 6, children: _jsx(BlogPostCard, { post: post, onEdit: (post) => {
                            setSelectedPost(post);
                            setIsFormModalOpen(true);
                        }, onDelete: (post) => deletePost.mutate(post._id), onView: (post) => {
                            setSelectedPost(post);
                            setIsViewModalOpen(true);
                        } }) }, post._id)))) }), _jsx(Modal, { title: selectedPost ? "Editar Artículo" : "Nuevo Artículo", open: isFormModalOpen, onCancel: () => {
                    setIsFormModalOpen(false);
                    setSelectedPost(null);
                }, footer: null, width: 800, children: _jsx(BlogPostForm, { initialValues: selectedPost || undefined, onSubmit: handleSubmit, loading: createPost.isPending || updatePost.isPending }) }), _jsx(BlogPostModal, { selectedPost: selectedPost, isViewModalOpen: isViewModalOpen, onClose: () => {
                    setIsViewModalOpen(false);
                    setSelectedPost(null);
                } })] }));
};
export default Blog;
