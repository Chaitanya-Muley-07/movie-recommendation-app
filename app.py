from flask import Flask, jsonify, request
from database import get_movies, add_user_rating
from recommendation import get_collaborative_filtering_recommendations
from recommendation import get_content_based_recommendations
app = Flask(__name__)

@app.route('/movies', methods=['GET'])
def movies():
    return jsonify(get_movies())
@app.route('/recommendations/collaborative/<string:movie_id>', methods=['GET'])
def collaborative_recommendations(movie_id):
    recommendations = get_collaborative_filtering_recommendations(movie_id)
    recommendations_json = recommendations.to_dict('records')
    return jsonify(recommendations_json)

@app.route('/recommendations/content/<string:movie_id>', methods=['GET'])
def content_based_recommendations(movie_id):
    recommendations = get_content_based_recommendations(movie_id)
    recommendations_json = recommendations.to_dict('records')
    return jsonify(recommendations_json)


@app.route('/rate', methods=['POST'])
def rate_movie():
    data = request.get_json()
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')
    rating = data.get('rating')

    # Validate the input data
    if user_id is None or movie_id is None or rating is None:
        return jsonify({"error": "Missing data"}), 400

    # Add the user rating
    add_user_rating(user_id, movie_id, rating)

    return jsonify({"message": "Rating submitted successfully"}), 201

if __name__ == '__main__':
    app.run(debug=True)