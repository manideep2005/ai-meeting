const axios = require('axios');

class OllamaService {
    constructor() {
        this.baseUrl = "http://localhost:11434/api/generate";
        // Fallback chain: llama3.2 -> gemma3 -> mistral (if installed)
        this.models = ["llama3.2:1b", "gemma3:1b", "llama3"]; 
    }

    async _request(payload, modelIndex = 0) {
        if (modelIndex >= this.models.length) {
            throw new Error("All LLM providers failed.");
        }

        const model = this.models[modelIndex];
        console.log(`Using model: ${model}`);

        try {
            const response = await axios.post(this.baseUrl, {
                ...payload,
                model: model,
                stream: false
            });
            return response.data;
        } catch (error) {
            console.warn(`Model ${model} failed, falling back...`);
            return this._request(payload, modelIndex + 1);
        }
    }

    async processMeeting(text) {
        const prompt = `
        Analyze the following meeting transcript and provide a structured summary, action items, and key decisions.
        Return the response ONLY as a JSON object with the following structure:
        {
            "summary": "3-4 sentence overview",
            "action_items": [
                {
                    "description": "task description",
                    "assignee": "name or 'Unassigned'",
                    "deadline": "date/time if mentioned or 'N/A'"
                }
            ],
            "decisions": ["decision 1", "decision 2"]
        }

        Transcript:
        ${text}
        `;

        const result = await this._request({ prompt, format: "json" });
        return JSON.parse(result.response);
    }

    async generateEmail(summary, actionItems) {
        const prompt = `
        Draft a professional follow-up email based on this meeting summary and action items.
        
        Summary: ${summary}
        Action Items: ${JSON.stringify(actionItems)}
        
        The email should be polite, structured, and clear. Return only the email body.
        `;

        const result = await this._request({ prompt });
        return result.response.trim();
    }

    async chatWithMeeting(transcript, question, history = []) {
        const prompt = `
        You are an AI assistant helping a team understand their meeting notes.
        Transcript:
        ${transcript}

        User Question: ${question}
        
        Answer based ONLY on the transcript provided. If the information is not there, say you don't know.
        `;

        const result = await this._request({ prompt });
        return result.response.trim();
    }
}

module.exports = new OllamaService();
