import pandas as pd

def get_movies():
    movies_df = pd.read_csv('project.csv')
    return movies_df[['movie_id', 'movie_name', 'year', 'genre']].to_dict(orient='records')

def get_user_ratings():
    ratings_df = pd.read_csv('ratings.csv')
    return ratings_df

def add_user_rating(user_id, movie_id, rating):
    # Append the new rating to the ratings DataFrame
    new_rating = pd.DataFrame([[user_id, movie_id, rating]], columns=['user_id', 'movie_id', 'rating'])
    global ratings_df
    ratings_df = pd.concat([ratings_df, new_rating], ignore_index=True)

    # Save the updated DataFrame back to the CSV file
    ratings_df.to_csv('ratings.csv', index=False)