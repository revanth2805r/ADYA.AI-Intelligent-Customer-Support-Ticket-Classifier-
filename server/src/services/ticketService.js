// src/services/ticketService.js
import mlModel from '../utils/mlModel.js';

// Process the ticket content to categorize and score its priority
export const processTicket = async (message) => {
    try {
        const analysis = await mlModel.analyzeMessage(message);
        
        // Map the results to the format expected by the ticket controller
        return {
            type: analysis.category,     // e.g., 'technical', 'billing'
            sentiment: analysis.sentiment, // e.g., 'positive', 'neutral', 'negative'
            priority: analysis.priority    // e.g., 3 (low), 2 (medium), 1 (high), 0 (urgent)
        };
    } catch (err) {
        console.error('Error processing ticket with ML model:', err);
        
        // Fallback to basic classification if ML fails
        return fallbackTicketProcessing(message);
    }
};

// Basic fallback classification if ML fails
const fallbackTicketProcessing = (message) => {
    let type = 'general';
    let sentiment = 'neutral';
    let priority = 3; // low priority (matching your schema's default)
    
    const lowerMessage = message.toLowerCase();
    
    // Basic classification logic
    if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency')) {
        priority = 0; // urgent
        type = 'urgent';
    } else if (lowerMessage.includes('bug') || lowerMessage.includes('error')) {
        priority = 1; // high
        type = 'technical';
    } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment')) {
        priority = 2; // medium
        type = 'billing';
    }
    
    // Basic sentiment analysis
    if (lowerMessage.includes('thank') || lowerMessage.includes('appreciate')) {
        sentiment = 'positive';
    } else if (lowerMessage.includes('disappointed') || lowerMessage.includes('unhappy') || 
               lowerMessage.includes('not working') || lowerMessage.includes('terrible')) {
        sentiment = 'negative';
    }
    
    return { type, sentiment, priority };
};