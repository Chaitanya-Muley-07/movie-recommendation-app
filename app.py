from flask import Flask, jsonify, request
from flask_cors import CORS  # Import the CORS package
from database import get_movies, add_user_rating, get_user_ratings
from recommendation import get_collaborative_filtering_recommendations, RecommendationNotFoundError
from recommendation import get_content_based_recommendations
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/movies', methods=['GET'])
def movies():
    movies_list = get_movies()
    return jsonify(movies_list) 

@app.route('/recommendations/collaborative/<string:user_id>', methods=['GET'])
def collaborative_recommendations(user_id):
    try:
        recommendations = get_collaborative_filtering_recommendations(user_id)
        recommendations_json = recommendations.to_dict('records')
        return jsonify(recommendations_json)

    except RecommendationNotFoundError as e:
        return jsonify({"error": f"User with ID {user_id} not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommendations/content/<string:movie_id>', methods=['GET'])
def content_based_recommendations(movie_id):
    recommendations = get_content_based_recommendations(movie_id)
    recommendations_json = recommendations.to_dict('records')
    return jsonify(recommendations_json)



def add_user_rating(user_id, movie_id, rating):
    # Define the path for the ratings CSV file
    ratings_file_path = 'ratings.csv'

    # Create a DataFrame from the existing ratings CSV
    if os.path.exists(ratings_file_path):
        ratings_df = pd.read_csv(ratings_file_path)
    else:
        ratings_df = pd.DataFrame(columns=['user_id', 'movie_id', 'rating'])

    # Check if the user already has ratings in the DataFrame
    user_rating_exists = ratings_df[(ratings_df['user_id'] == user_id) & (ratings_df['movie_id'] == movie_id)]

    if not user_rating_exists.empty:
        # Update the existing rating
        ratings_df.loc[(ratings_df['user_id'] == user_id) & (ratings_df['movie_id'] == movie_id), 'rating'] = rating
    else:
        # Append the new rating to the DataFrame
        new_rating = pd.DataFrame({'user_id': [user_id], 'movie_id': [movie_id], 'rating': [rating]})
        ratings_df = pd.concat([ratings_df, new_rating], ignore_index=True)

    # Save the updated DataFrame back to the CSV file
    ratings_df.to_csv(ratings_file_path, index=False)

@app.route('/rate', methods=['POST'])
def rate_movie():
    data = request.get_json()

    # Validate the input data
    if not data:
        return jsonify({"error": "Request body cannot be empty"}), 400
    
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')
    rating = data.get('rating')

    if user_id is None or movie_id is None or rating is None:
        return jsonify({"error": "Missing data"}), 400

    try:
        # Ensure the rating is a number (optional validation)
        rating = float(rating)
        if rating < 1 or rating > 5:  # Assuming a rating scale of 1 to 5
            return jsonify({"error": "Rating must be between 1 and 5"}), 400
        
        # Add the user rating
        add_user_rating(user_id, movie_id, rating)

    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Internal server error

    return jsonify({"message": "Rating submitted successfully"}), 201


if __name__ == '__main__':
    app.run(debug=True)
