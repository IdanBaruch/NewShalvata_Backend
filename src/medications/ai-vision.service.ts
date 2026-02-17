import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiVisionService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: configService.get('ANTHROPIC_API_KEY'),
    });
  }

  /**
   * Verify medication intake from image using Claude Vision
   */
  async verifyMedicationImage(
    imageBase64: string,
    medicationName: string,
  ): Promise<{
    isValid: boolean;
    confidence: number;
    detected: string[];
    reasoning: string;
  }> {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `You are a medication verification assistant. Analyze this image to verify if the person is taking their medication correctly.

Expected medication: ${medicationName}

Please verify:
1. Is there a pill/medication visible in the image?
2. Is the person holding it (hand visible)?
3. Does it appear to be the correct medication?

Respond in JSON format:
{
  "isValid": true/false,
  "confidence": 0-100,
  "detected": ["pill", "hand", "water"],
  "reasoning": "brief explanation"
}`,
              },
            ],
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          isValid: result.isValid || false,
          confidence: result.confidence || 0,
          detected: result.detected || [],
          reasoning: result.reasoning || 'No reasoning provided',
        };
      }

      // Fallback if parsing fails
      return {
        isValid: false,
        confidence: 0,
        detected: [],
        reasoning: 'Failed to parse AI response',
      };
    } catch (error) {
      console.error('AI Vision Error:', error);
      return {
        isValid: false,
        confidence: 0,
        detected: [],
        reasoning: `Error: ${error.message}`,
      };
    }
  }
}
