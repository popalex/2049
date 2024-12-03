from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# CORS(app, resources={
#     r"/*": {
#         "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
#         "methods": ["GET", "POST", "PUT", "DELETE"],
#         "allow_headers": ["Content-Type"]
#     }
# })



# Sample player data
high_scores = [
    {"index": 1, "playerName": "John Smith", "highScore": 2500},
    {"index": 2, "playerName": "Sarah Jones", "highScore": 3100},
    {"index": 3, "playerName": "Michael Johnson", "highScore": 1800},
    {"index": 4, "playerName": "Emily Brown", "highScore": 2200},
    {"index": 5, "playerName": "David Wilson", "highScore": 2800}
]

@app.route('/high_scores', methods=['GET'])
def get_high_scores():
    return jsonify(high_scores)

if __name__ == '__main__':
    app.run(debug=True)