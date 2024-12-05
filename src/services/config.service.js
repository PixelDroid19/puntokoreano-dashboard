import { api } from './auth.service';
class ConfigService {
    static async getSettings() {
        try {
            const response = await api.get('/dashboard/settings');
            return response.data;
        }
        catch (error) {
            console.error('Error fetching settings:', error);
            throw error;
        }
    }
    static async updateSeo(seoConfig) {
        try {
            const response = await api.patch('/dashboard/settings/seo', seoConfig);
            return response.data;
        }
        catch (error) {
            console.error('Error updating SEO settings:', error);
            throw error;
        }
    }
    static async updateSettings(settings) {
        try {
            const response = await api.patch('/dashboard/settings', settings);
            return response.data;
        }
        catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }
}
export default ConfigService;
