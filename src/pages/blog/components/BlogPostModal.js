import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal, Tag, Space } from 'antd';
import dayjs from 'dayjs';
import LexicalViewer from '../../../components/LexicalBlogEditor/LexicalViewer.component';
import { statusColors } from './BlogPostCard';
const BlogPostModal = ({ selectedPost, isViewModalOpen, onClose }) => {
    if (!selectedPost)
        return null;
    return (_jsx(Modal, { title: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-xl font-semibold", children: selectedPost?.title }), _jsx(Tag, { color: statusColors[selectedPost?.status || "draft"], children: selectedPost?.status.toUpperCase() })] }), open: isViewModalOpen, onCancel: onClose, footer: null, width: 1000, className: "blog-post-modal", children: _jsxs("div", { className: "blog-post-content", children: [selectedPost.featured_image && (_jsx("div", { className: "featured-image-container mb-6", children: _jsx("img", { src: selectedPost.featured_image, alt: selectedPost.title, className: "w-full h-[300px] object-cover rounded-lg shadow-md" }) })), _jsx("div", { className: "metadata mb-6", children: _jsxs(Space, { direction: "vertical", size: "small", children: [_jsxs("div", { className: "flex flex-wrap gap-2", children: [selectedPost.categories.map((category) => (_jsx(Tag, { color: "blue", children: category }, category))), selectedPost.tags?.map((tag) => (_jsxs(Tag, { color: "default", children: ["#", tag] }, tag)))] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["\u00DAltima actualizaci\u00F3n:", " ", dayjs(selectedPost.updated_at).format("DD/MM/YYYY HH:mm")] })] }) }), _jsx("div", { className: "excerpt mb-6", children: _jsx("p", { className: "text-lg text-gray-600 italic border-l-4 border-blue-500 pl-4", children: selectedPost.excerpt }) }), _jsx("div", { className: "prose max-w-none", children: _jsx(LexicalViewer, { content: selectedPost.content }) })] }) }));
};
export default BlogPostModal;
