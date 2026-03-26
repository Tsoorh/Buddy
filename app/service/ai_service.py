import google.generativeai as genai
import json
from app.core.config import settings
from app.core.logger import setup_logger
from typing import List, Dict, Any, Optional

logger = setup_logger("ai_logger")


class AiService:
    def __init__(self):
        if settings.gemini_api_key and settings.gemini_api_key != "YOUR_GEMINI_API_KEY":
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            self.enabled = True
        else:
            logger.warning(
                "GEMINI_API_KEY not set. AI Service will operate in mock mode."
            )
            self.enabled = False

    async def generate_fishing_insights(
        self, success_matrix: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Analyzes user's fishing success data and returns personalized insights.
        """
        if not self.enabled:
            return self._get_mock_insights()

        if not success_matrix:
            return {
                "insights": [
                    "Log more sessions to start seeing personalized data patterns!"
                ],
                "optimal_conditions": "Not enough sessions to determine optimal conditions for catching fishes",
            }

        prompt = f"""
        You are a Professional Fishing Data Analyst. 
        Analyze the following user fishing data (Success Matrix). 
        Your goal is to find mathematical correlations between environmental factors and catch success.
        
        DATA:
        {json.dumps(success_matrix, indent=2)}
        
        REQUIREMENTS:
        1. Provide 3-5 short, punchy insights.
        2. Conclusions MUST be data-driven (e.g., 'You caught 67% more fish on rising tides').
        3. Identify the 'Optimal Conditions' summary for this specific user.
        4. Be concise. Do not give generic advice.
        5. Respond ONLY in valid JSON format with keys: "insights" (array of strings) and "optimal_conditions" (string).
        """

        try:
            response = self.model.generate_content(prompt)
            # Clean up potential markdown formatting in response
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()

            return json.loads(text)
        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            return self._get_mock_insights()

    def _get_mock_insights(self) -> Dict[str, Any]:
        return {
            "insights": [
                "#1 rule in fishing : Never dive alone, get a buddy!",
                "#2 rule in fishing : The more you go fishing the more fishes you catch.",
                "#3 rule in fishing : Off shore winds can be dangerous to go fishing and less productive. Always check the weather forecast.",
            ],
            "optimal_conditions": "General advice: Morning sessions during rising tides and stable barometric pressure tends to be more productive",
        }
