import { NextRequest } from 'next/server';
import { orderEvents } from '@/lib/realtime';



export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial keep-alive comment
      controller.enqueue(encoder.encode(': keep-alive\n\n'));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleNewOrder = (order: any) => {
        try {
          const payload = JSON.stringify({ type: 'NEW_ORDER', order });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (e) {
          // stream might be closed
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleOrderUpdated = (order: any) => {
        try {
          const payload = JSON.stringify({ type: 'ORDER_UPDATED', order });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (e) {
          // stream might be closed
        }
      };

      orderEvents.on('new-order', handleNewOrder);
      orderEvents.on('order-updated', handleOrderUpdated);

      // Heartbeat every 25 seconds to prevent proxy / load balancer timeouts
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (e) {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        orderEvents.off('new-order', handleNewOrder);
        orderEvents.off('order-updated', handleOrderUpdated);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
