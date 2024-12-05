import { api } from "./auth.service";
class BlogService {
    /**
     * Obtiene los posts del blog con paginación y filtros
     */
    static async getPosts(filters = {}) {
        try {
            const { data } = await api.get(this.BASE_URL, {
                params: filters,
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            return data;
        }
        catch (error) {
            this.handleError(error, 'Error fetching blog posts');
            throw error;
        }
    }
    /**
     * Obtiene un post específico por ID o slug
     */
    static async getPost(identifier) {
        try {
            const { data } = await api.get(`${this.BASE_URL}/${identifier}`);
            return data;
        }
        catch (error) {
            this.handleError(error, 'Error fetching blog post');
            throw error;
        }
    }
    /**
     * Crea un nuevo post
     */
    static async createPost(post) {
        try {
            const { data } = await api.post(this.BASE_URL, post);
            return data;
        }
        catch (error) {
            this.handleError(error, 'Error creating blog post');
            throw error;
        }
    }
    /**
     * Actualiza un post existente
     */
    static async updatePost(postId, post) {
        try {
            const { data } = await api.patch(`${this.BASE_URL}/${postId}`, post);
            return data;
        }
        catch (error) {
            this.handleError(error, 'Error updating blog post');
            throw error;
        }
    }
    /**
     * Elimina un post
     */
    static async deletePost(postId) {
        try {
            const { data } = await api.delete(`${this.BASE_URL}/${postId}`);
            return data;
        }
        catch (error) {
            this.handleError(error, 'Error deleting blog post');
            throw error;
        }
    }
    /**
     * Obtiene metadatos del blog (categorías, tags, etc)
     */
    static async getMetadata() {
        try {
            const { data } = await api.get(`${this.BASE_URL}/metadata`);
            return data;
        }
        catch (error) {
            this.handleError(error, 'Error fetching blog metadata');
            throw error;
        }
    }
    /**
     * Manejador centralizado de errores
     */
    static handleError(error, message) {
        console.error(message, error);
        if (error.response) {
            const status = error.response.status;
            switch (status) {
                case 401:
                case 403:
                    throw new Error('Authentication error. Please login again.');
                case 404:
                    throw new Error('Resource not found');
                case 422:
                    throw new Error('Validation error: ' + JSON.stringify(error.response.data.errors));
                default:
                    throw new Error(`Server error: ${error.response.data.message || 'Unknown error'}`);
            }
        }
        throw new Error('Network error: Unable to connect to server');
    }
}
Object.defineProperty(BlogService, "BASE_URL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: '/dashboard/blog'
});
export default BlogService;
