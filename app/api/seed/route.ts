import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Manual database management is active. Use Admin Dashboard to manage products and categories.',
  });
}
