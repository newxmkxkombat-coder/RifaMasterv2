
import { GoogleGenAI } from "@google/genai";
import { Ticket, TicketStatus } from "../types";
import { TICKET_PRICE } from "../constants";

const getAiClient = () => {
  // Verificación segura de la existencia de process y env
  try {
    const apiKey = (window as any).process?.env?.API_KEY || "";
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    return null;
  }
};

export const askRaffleAssistant = async (
  tickets: Ticket[],
  question: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Configura tu API Key para usar la IA.";

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
    Eres un asistente para una Rifa (00-99).
    Precio: $${TICKET_PRICE}
    Disponibles: ${availableCount}
    Reservadas: ${reservedCount} ($${totalMoneyPending} deuda)
    Pagadas: ${paidCount} ($${totalMoneyRaised} total)
    Top: ${topBuyers || "Ninguno"}
    
    Responde breve y profesionalmente.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "No hay respuesta.";
  } catch (error) {
    return "Error de conexión con la IA.";
  }
};
