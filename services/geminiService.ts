
import { GoogleGenAI } from "@google/genai";
import { Ticket, TicketStatus } from "../types";
import { TICKET_PRICE } from "../constants";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const askRaffleAssistant = async (
  tickets: Ticket[],
  question: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key no configurada.";

  const reservedCount = tickets.filter(t => t.status === TicketStatus.RESERVED).length;
  const paidCount = tickets.filter(t => t.status === TicketStatus.PAID).length;
  const availableCount = tickets.filter(t => t.status === TicketStatus.AVAILABLE).length;
  
  const totalMoneyRaised = paidCount * TICKET_PRICE;
  const totalMoneyPending = reservedCount * TICKET_PRICE;

  const buyersMap = new Map<string, number>();
  tickets.forEach(t => {
    if (t.ownerName) {
      buyersMap.set(t.ownerName, (buyersMap.get(t.ownerName) || 0) + 1);
    }
  });
  
  const topBuyers = Array.from(buyersMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name} (${count})`)
    .join(", ");

  const systemPrompt = `
    Eres un asistente inteligente para una aplicación de Rifa (00-99).
    Datos actuales:
    - Precio por boleta: $${TICKET_PRICE}
    - Disponibles: ${availableCount}
    - Reservadas (Deben dinero): ${reservedCount} ($${totalMoneyPending} pendientes)
    - Pagadas: ${paidCount} ($${totalMoneyRaised} recaudados)
    - Top compradores: ${topBuyers || "Ninguno aún"}
    
    Responde a la pregunta del usuario basándote en estos datos. Sé breve, carismático y útil.
    Si te piden elegir un ganador, elige uno al azar de los números VENDIDOS (RESERVED o PAID).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text || "No pude generar una respuesta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocurrió un error consultando a la IA.";
  }
};
