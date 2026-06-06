/** 支付流程自定义Hook */

import { useState, useCallback } from 'react';
import { createOrder, mockPay } from '../api/payment';
import type { OrderInfo, MockPayResponse } from '../types';

interface UsePaymentReturn {
  order: OrderInfo | null;
  payResult: MockPayResponse | null;
  loading: boolean;
  error: string;
  placeOrder: (productType: 1 | 2, resumeId: number) => Promise<OrderInfo | null>;
  doMockPay: (orderNo: string) => Promise<MockPayResponse | null>;
}

export function usePayment(): UsePaymentReturn {
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [payResult, setPayResult] = useState<MockPayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const placeOrder = useCallback(async (productType: 1 | 2, resumeId: number): Promise<OrderInfo | null> => {
    setLoading(true);
    setError('');
    try {
      const res = await createOrder({ product_type: productType, resume_id: resumeId });
      setOrder(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message || '创建订单失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const doMockPay = useCallback(async (orderNo: string): Promise<MockPayResponse | null> => {
    setLoading(true);
    setError('');
    try {
      const res = await mockPay({ order_no: orderNo });
      setPayResult(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message || '支付失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { order, payResult, loading, error, placeOrder, doMockPay };
}
