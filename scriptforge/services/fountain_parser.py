import requests

class FountainParserService:
    # The URL of our new Node.js microservice
    PARSER_URL = "http://localhost:4000/parse"

    def parse_to_html(self, fountain_text: str) -> str:
        """
        Calls the external Node.js parser microservice to get rendered HTML.
        """
        if not fountain_text:
            return ""

        try:
            payload = {'fountain_text': fountain_text}
            response = requests.post(self.PARSER_URL, json=payload, timeout=5)
            
            # Raise an exception if the request failed (e.g., 4xx or 5xx error)
            response.raise_for_status()
            
            # Return the HTML from the JSON response
            return response.json().get('html', '<p>Error: Invalid response from parser service.</p>')

        except requests.exceptions.RequestException as e:
            # This will catch connection errors, timeouts, etc.
            print(f"Error calling parser service: {e}")
            return "<p>Error: Could not connect to the Fountain parser service.</p>"
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return "<p>An unexpected error occurred while parsing.</p>"