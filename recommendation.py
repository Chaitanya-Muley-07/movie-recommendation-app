import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack  # For combining sparse matrices

def get_content_based_recommendations(movie_id):
    # Load movie data
    movies_df = pd.read_csv('project.csv')

    # Extract overview and cast data
    overview_data = movies_df['overview']
    cast_data = movies_df['cast']

    # Vectorize overview and cast data using Bag-of-Words (CountVectorizer)
    count_vectorizer = CountVectorizer(stop_words='english')
    overview_vectors = count_vectorizer.fit_transform(overview_data)
    cast_vectors = count_vectorizer.fit_transform(cast_data)

    # Combine overview and cast vectors
    combined_vectors = hstack((overview_vectors, cast_vectors))

    # Calculate cosine similarity
    cosine_sim = cosine_similarity(combined_vectors)

    # Find the index of the input movie ID
    movie_index = movies_df[movies_df['movie_id'] == movie_id].index[0]

    # Get similar movies based on cosine similarity
    similar_movies = movies_df.iloc[cosine_sim[movie_index].argsort()[::-1][1:11]]

    return similar_movies

import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity

class RecommendationNotFoundError(Exception):
    pass

def get_collaborative_filtering_recommendations(user_id):
    # Load ratings data
    ratings_df = pd.read_csv('ratings.csv')

    # Load movie data (assuming you have a separate CSV for movie data)
    movies_df = pd.read_csv('project.csv')

    # Check if user exists
    if int(user_id) not in ratings_df['user_id'].unique():
        raise RecommendationNotFoundError(f"User with ID {user_id} not found")

    # Create a user-movie matrix where rows are users, columns are movies, and values are ratings
    user_movie_matrix = ratings_df.pivot_table(index='user_id', columns='movie_id', values='rating').fillna(0)

    # Fit the KNN model to find similar users based on their rating behavior
    knn = NearestNeighbors(n_neighbors=5, metric='cosine')
    knn.fit(user_movie_matrix)

    # Find the index of the input user_id
    user_index = user_movie_matrix.index.get_loc(int(user_id))

    # Get the distances and indices of the nearest neighbors (similar users)
    distances, indices = knn.kneighbors(user_movie_matrix.iloc[user_index].values.reshape(1, -1), n_neighbors=5)

    # Get the IDs of the similar users
    similar_user_ids = user_movie_matrix.index[indices.flatten()].tolist()

    # Find the movies that similar users have rated highly but the input user hasn't rated yet
    user_watched_movies = user_movie_matrix.loc[int(user_id)]
    watched_movie_ids = user_watched_movies[user_watched_movies > 0].index.tolist()

    # Find movies that similar users have rated highly
    similar_users_movies = user_movie_matrix.loc[similar_user_ids]
    movie_recommendations = similar_users_movies.mean(axis=0).sort_values(ascending=False)

    # Filter out movies the input user has already watched
    movie_recommendations = movie_recommendations[~movie_recommendations.index.isin(watched_movie_ids)]

    # Check if there are any recommendations
    if movie_recommendations.empty:
        raise RecommendationNotFoundError(f"No recommendations found for user {user_id}")

    # Get the top 10 movie recommendations
    top_movie_ids = movie_recommendations.index[:10].tolist()

    # Join recommendations with movie data to get names
    recommended_movies = pd.merge(pd.DataFrame({'movie_id': top_movie_ids}), movies_df, on='movie_id')

    return recommended_movies
