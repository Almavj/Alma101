import axios from 'axios';
import { API_URL } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

class BlogService {
    private api: ReturnType<typeof axios.create>;
    
    constructor() {
        this.api = axios.create({
            baseURL: `${API_URL}/blogs.php`,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add token to requests when available. We fetch the current
        // session/token from Supabase at request time so we never persist
        // tokens in browser storage.
        this.api.interceptors.request.use(async (config) => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = (session as any)?.access_token ?? null;
                if (token) {
                    config.headers = config.headers ?? {};
                    (config.headers as any).Authorization = `Bearer ${token}`;
                }
            } catch (err) {
                // ignore - proceed without auth header
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