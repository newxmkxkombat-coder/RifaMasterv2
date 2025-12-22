
import { GoogleGenAI } from "@google/genai";
import { Ticket, TicketStatus } from "../types";
// Fix: Corrected import to DEFAULT_TICKET_PRICE
import { DEFAULT_TICKET_PRICE } from "../constants";

export const askRaffleAssistant = async (
  tickets: Ticket[],
  question: string
): Promise<string> => {
  // Fix: Initialize GoogleGenAI directly with process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const reservedCount = tickets.filter(t => t.status === TicketStatus.RESERVED).length;
  const paidCount = tickets.filter(t => t.status === TicketStatus.PAID).length;
  const availableCount = tickets.filter(t => t.status === TicketStatus.AVAILABLE).length;
  
  // Fix: Use DEFAULT_TICKET_PRICE
  const totalMoneyRaised = paidCount * DEFAULT_TICKET_PRICE;
  const totalMoneyPending = reservedCount * DEFAULT_TICKET_PRICE;

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
    Precio: $${DEFAULT_TICKET_PRICE}
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

    // Fix: response.text is a property, not a method
    return response.text || "No hay respuesta.";
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "Error de conexión con la IA.";
  }
};
