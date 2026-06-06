/** 支付相关API */

import client from './client';
import type { ApiResponse, OrderInfo, OrderCreateRequest, MockPayRequest, MockPayResponse } from '../types';

/** 创建订单 */
export async function createOrder(data: OrderCreateRequest): Promise<ApiResponse<OrderInfo>> {
  return client.post('/payment/orders', data);
}

/** Mock支付 */
export async function mockPay(data: MockPayRequest): Promise<ApiResponse<MockPayResponse>> {
  return client.post('/payment/mock-pay', data);
}

/** 查询订单状态 */
export async function getOrder(orderNo: string): Promise<ApiResponse<OrderInfo>> {
  return client.get(`/payment/orders/${orderNo}`);
}
