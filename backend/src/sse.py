import asyncio


class SSEManager:
    def __init__(self):
        # Holds one asyncio.Queue for each open Admin Dashboard Browser tab
        print("\n\n[OK] Admin Dashboard SSEManager initialized.")
        self.active_queues: list[asyncio.Queue] = []

    async def connect(self) -> asyncio.Queue:
        """Called when an admin opens the SSE stream."""
        print("\n\n[OK] Admin connected to SSE stream.")

        queue = asyncio.Queue()
        self.active_queues.append(queue)
        return queue

    def disconnect(self, queue: asyncio.Queue):
        """Called when an admin closes the SSE stream."""
        print("\n\n[INFO] Admin disconnected from SSE stream.")

        if queue in self.active_queues:
            self.active_queues.remove(queue)

    async def broadcast(self, data: str):
        """Pushes JSON string into every connected admin's queue."""
        print(f"\n\n[BROADCAST] Broadcasting data: {data}")

        for queue in self.active_queues:
            await queue.put(data)


# Create a single instance to import inside routes/users.py
sse_manager = SSEManager()
