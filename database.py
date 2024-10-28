import pandas as pd
import os
from flask import jsonify  # Ensure this is imported


def get_movies():
    # Load the CSV file into a DataFrame
    movies_df = pd.read_csv('project.csv')
    
    # Handle NaN values by replacing them with defaults
    movies_df['movie_id'].fillna("Unknown", inplace=True)
    movies_df['movie_name'].fillna("Untitled", inplace=True)
    movies_df['year'].fillna("Unknown", inplace=True)
    movies_df['genre'].fillna("Unknown", inplace=True)
    movies_df['language'].fillna("Unknown", inplace=True)

    # Convert the DataFrame to a list of dictionaries
    movies = movies_df[['movie_id', 'movie_name', 'year', 'genre', 'language']].to_dict(orient='records')
    
    # Return the list of dictionaries (NOT jsonify here)
    return movies




def get_user_ratings():
    ratings_df = pd.read_csv('ratings.csv')
    return ratings_df

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