import axios from 'axios';
import { API_URL } from '@/lib/api';

class BlogService {
    private api: ReturnType<typeof axios.create>;
    
    constructor() {
        this.api = axios.create({
            baseURL: `${API_URL}/blogs.php`,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add token to requests if available
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    async getBlogs(page = 1, limit = 10) {
        try {
            const response = await this.api.get(`?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getBlog(id: string) {
        try {
            const response = await this.api.get(`?id=${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createBlog(blogData: {
        title: string;
        content: string;
        excerpt?: string;
        image_url?: string;
    }) {
        try {
            const response = await this.api.post('', blogData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateBlog(id: string, blogData: {
        title?: string;
        content?: string;
        excerpt?: string;
        image_url?: string;
    }) {
        try {
            const response = await this.api.put(`?id=${id}`, blogData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async deleteBlog(id: string) {
        try {
            const response = await this.api.delete(`?id=${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private handleError(error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            return {
                status: error.response.status,
                message: ((error.response.data as { message?: string } | undefined)?.message) || 'An error occurred'
            };
        }
        return {
            status: 500,
            message: 'Network error occurred'
        };
    }
}

export const blogService = new BlogService();