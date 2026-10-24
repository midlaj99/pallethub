import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If real Razorpay keys are provided, interact with Razorpay API
    if (keyId && keySecret) {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert to paise
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          payment_capture: 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.description || 'Razorpay order creation failed');
      }

      return NextResponse.json({
        success: true,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        key: keyId,
        isLive: true,
      });
    }

    // Seamless Mock / Sandbox test order for development
    const mockOrderId = `order_sim_${Math.random().toString(36).substring(2, 12)}`;
    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: Math.round(amount * 100),
      currency,
      key: 'rzp_test_palette_hubb_mock',
      isLive: false,
      message: 'Operating in Sandbox/Test Mode. Instant payment verification supported.',
    });
  } catch (error: unknown) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
