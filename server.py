# Import your parser
from terms_parser import parse_terms_and_conditions

from flask import Flask, request, jsonify 
from flask_cors import CORS
from deep_translator import GoogleTranslator
# Flask: The web framework used to define routes and handle requests.
# request: Lets you read incoming HTTP request data (JSON body, query params).
# jsonify: Safely builds JSON responses (sets Content-Type: application/json).
# CORS: Enables Cross-Origin Resource Sharing—critical so Chrome 
# extension (which runs from a different origin) can call this server 
# without being blocked by the browser

app = Flask(__name__) 
CORS(app)  # allow requests from the extension popup

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        url = request.json.get('url')
        if not url:
            raise ValueError("Missing 'url' in request body")

        summary_points = parse_terms_and_conditions(url)  # list of sentences
        # Directly provides translated summary as user picks lang at beginning 
        lang = request.args.get('lang')
        if lang:
            translator = GoogleTranslator(source='auto', target=lang)
            summary_points = [translator.translate(s) for s in summary_points]

        return jsonify({"status": "success", "summary": summary_points})
    except Exception as e:
        print(f"Error in summarize: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Tranlsates provided texts 
@app.route('/translate', methods=['POST'])
def translate_text():
    try:
        texts = request.json.get('texts', [])
        if not texts:
            raise ValueError("No text provided for translation")
        translator = GoogleTranslator(source='auto', target='hi')
        translated_texts = [translator.translate(text) for text in texts]
        return jsonify({"status": "success", "translations": translated_texts})
    except Exception as e:
        print(f"Error in translation: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Simple html display for server host page 
@app.route('/', methods=['GET'])
def index():
    # Simple JSON health check
    return jsonify({
        "status": "ok",
        "service": "summarizer"
        # Optionally add: "version": "1.0.0"
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
