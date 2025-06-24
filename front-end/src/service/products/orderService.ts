// src/service/orderService.ts
import api from '../api'; // đường dẫn tới file api của bạn

export interface CreateOrderDTO {
  paymentMethod: string;
  shippingMethod: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export async function createOrder(data: CreateOrderDTO): Promise<ApiResponse<any>> {
  try {
    const response = await api.post('/orders/create-order', data);
    return response.data; // trả về ApiResponse<Order>
  } catch (error) {
    // Xử lý lỗi nếu cần
    console.error('Error creating order:', error);
    throw error;
  }
}
