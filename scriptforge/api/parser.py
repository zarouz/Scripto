from flask import jsonify, request
from . import api
from ..services.fountain_parser import FountainParserService

@api.route('/parser/preview', methods=['POST'])
def get_html_preview():
    """
    Accepts raw Fountain text and returns a rendered HTML preview.
    """
    data = request.get_json()
    if not data or 'fountain_text' not in data:
        return jsonify({'error': 'Request body must contain "fountain_text" key.'}), 400

    fountain_text = data['fountain_text']
    
    # Instantiate our service and use it
    parser_service = FountainParserService()
    rendered_html = parser_service.parse_to_html(fountain_text)
    
    return jsonify({'html': rendered_html})