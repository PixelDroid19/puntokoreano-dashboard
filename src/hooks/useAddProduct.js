// src/hooks/useAddProduct.ts
import { useMutation } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboard.service';
import { toast } from 'react-toastify';
import { NOTIFICATIONS } from '../enums/contants.notifications';
export const useAddProduct = (onSuccess) => {
    return useMutation({
        mutationFn: (product) => {
            return DashboardService.createProduct(product);
        },
        onSuccess: () => {
            toast.success(NOTIFICATIONS.PRODUCT_CREATED);
            onSuccess?.();
        },
        onError: (error) => {
            if (error.message.includes('ya existe')) {
                toast.error(NOTIFICATIONS.PRODUCT_EXIST);
            }
            else {
                toast.error(error.message);
            }
        },
    });
};
