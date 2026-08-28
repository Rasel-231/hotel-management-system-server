import config from '../../../config';
import { aiHelper } from '../../../shared/ai.helper';
import prisma from '../../../shared/prisma.client';
import { z } from 'zod';
import { ParsedFilters } from './ai.interface';

export const chatStream = async (message: string, onToken: (token: string) => void): Promise<void> => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.ai_api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3-8b-instruct:free',
      messages: [{ role: 'user', content: message }],
      stream: true,
    }),
  });

  if (!response.body) {
    onToken(await response.text());
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reader = (response.body as any).getReader();
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { done, value } = (await reader.read()) as any;
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const token = json.choices?.[0]?.delta?.content;
        if (token) onToken(token as string);
      } catch {
        /* ignore partial frames */
      }
    }
  }
};

const filtersSchema = z.object({
  location: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  priceMax: z.number().optional(),
  guests: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  rating: z.number().optional(),
});

export const searchParse = async (query: string): Promise<ParsedFilters> => {
  const prompt = `Convert the following user request into strict JSON with keys: location, checkIn, checkOut, priceMax, guests, amenities (array), rating. Only output JSON. Request: ${query}`;
  const raw = await aiHelper.generateAiResponse(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  return filtersSchema.parse(parsed);
};

export const recommendations = async (userId: string, limit = 10) => {
  const bookings = await prisma.booking.findMany({
    where: { userId, status: 'CONFIRMED' },
    include: { room: { include: { hotel: true } } },
    take: 20,
  });
  const visitedHotelIds = bookings.map((b) => b.room.hotel.id);
  const locations = Array.from(new Set(bookings.map((b) => b.room.hotel.location).filter(Boolean))) as string[];

  return prisma.hotel.findMany({
    where: {
      id: { notIn: visitedHotelIds },
      ...(locations.length ? { location: { in: locations } } : {}),
      status: 'ACTIVE',
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

export const AIService = { chatStream, searchParse, recommendations };
