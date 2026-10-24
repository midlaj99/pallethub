import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { success: false, error: 'Incomplete payment credentials' },
          { status: 400 }
        );
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment signature verification' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
      });
    }

    // In sandbox test mode, auto-approve verified test payments
    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
      sandbox: true,
    });
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
