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


def get_collaborative_filtering_recommendations(movie_id):
    # Load ratings data
    ratings_df = pd.read_csv('ratings.csv')

    # Load movie data (assuming you have a separate CSV for movie data)
    movies_df = pd.read_csv('project.csv')

    # Prepare the data for KNN
    user_movie_matrix = ratings_df.pivot_table(index='user_id', columns='movie_id', values='rating').fillna(0)

    # Fit the KNN model
    knn = NearestNeighbors(n_neighbors=5, metric='cosine')
    knn.fit(user_movie_matrix.T)

    # Find the index of the input movie_id
    movie_index = user_movie_matrix.columns.get_loc(movie_id)

    # Get the distances and indices of the nearest neighbors
    distances, indices = knn.kneighbors(user_movie_matrix.iloc[:, movie_index].values.reshape(1, -1))

    # Get the recommended movie IDs
    recommended_movie_ids = user_movie_matrix.columns[indices.flatten()].tolist()

    # Join recommendations with movie data to get names
    recommended_movies = pd.merge(pd.DataFrame({'movie_id': recommended_movie_ids}), movies_df, on='movie_id')

    return recommended_movies