package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

const systemPrompt = `You are an energy management AI assistant.
Your task is to explain an anomaly detected by our deterministic analytics engine.
IMPORTANT:
- Respond entirely in Spanish.
- Use only the provided evidence.
- Do not invent events.
- Do not modify the classification.
- Do not change the severity.
- Do not invent measurements.
- If evidence is insufficient, explicitly say so.
Return valid JSON with:
{
  "reason": string,
  "recommended_action": string
}`

type OpenAIProvider struct {
	APIKey string
	Model  string
	Client *http.Client
}

func NewOpenAIProvider() *OpenAIProvider {
	apiKey := os.Getenv("OPENAI_API_KEY")
	model := os.Getenv("OPENAI_MODEL")
	if model == "" {
		model = "gpt-4o-mini"
	}
	return &OpenAIProvider{
		APIKey: apiKey,
		Model:  model,
		Client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (p *OpenAIProvider) Explain(ctx context.Context, input AIInput) (AIResponse, error) {
	if p.APIKey == "" {
		return AIResponse{
			Reason:            "Not available",
			RecommendedAction: "Not available",
		}, nil
	}

	promptBytes, err := json.MarshalIndent(input, "", "  ")
	if err != nil {
		return AIResponse{}, err
	}

	requestBody := map[string]interface{}{
		"model": p.Model,
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": string(promptBytes)},
		},
		"response_format": map[string]string{"type": "json_object"},
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return AIResponse{}, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return AIResponse{}, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.APIKey)

	resp, err := p.Client.Do(req)
	if err != nil {
		return AIResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return AIResponse{}, fmt.Errorf("openai api error status: %d", resp.StatusCode)
	}

	var openAIResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return AIResponse{}, err
	}

	if len(openAIResp.Choices) == 0 {
		return AIResponse{}, fmt.Errorf("empty response from openai")
	}

	var aiResult AIResponse
	if err := json.Unmarshal([]byte(openAIResp.Choices[0].Message.Content), &aiResult); err != nil {
		return AIResponse{}, err
	}

	return aiResult, nil
}
