import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import WestIcon from '@mui/icons-material/West';

interface Genre {
  id: number;
  name: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
}

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  genres: Genre[];
  credits: {
    cast: CastMember[];
  };
}

interface ContentBased {
  cast: string;
  director: string;
  genre: string;
  language: string;
  movie_id: string;
  movie_name: string;
  overview: string;
  sr_no: number;
  year: number;
}

function MovieInfo() {
  const { id } = useParams<{ id: string }>(); // IMDb ID passed via the route parameters
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contentRecommendations, setContentRecommendations] = useState<ContentBased[]>([]);
  const [collaberativeBased, setcollaberativeBased] = useState<ContentBased[]>([]);

  const [userId, setUserId] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const apiKey = "91a7bc615e78124694205aa0a77e27f0";
        const findMovieUrl = `https://api.themoviedb.org/3/find/${id}?api_key=${apiKey}&language=en-US&external_source=imdb_id`;
        const findMovieResponse = await fetch(findMovieUrl);
        const findMovieData = await findMovieResponse.json();

        const movie = findMovieData.movie_results[0];
        if (!movie) {
          setError("Movie not found.");
          setLoading(false);
          return;
        }
        const movieId = movie.id;

        // Fetch movie details and cast using movie_id
        const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=credits`;
        const movieDetailsResponse = await fetch(movieDetailsUrl);
        const movieDetails: MovieDetails = await movieDetailsResponse.json();

        setMovie(movieDetails);
        setLoading(false);
      } catch (error) {
        setError("Error fetching movie details.");
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const contentBased = async () => {
    const res = await fetch(`http://127.0.0.1:5000/recommendations/content/${id}`);
    const ans = await res.json();
    setContentRecommendations(ans);
  };


 
  const Collaberative=async()=>{
    const res = await fetch(`http://127.0.0.1:5000/recommendations/collaborative/${userId}`);
    const ans = await res.json();
    console.log(ans);
    setcollaberativeBased(ans);
  }




  const handleSubmit = async () => {
    const data = {
      user_id: userId, // Note: Matching the "user_id" key
      movie_id: id, // IMDb ID passed from the route
      rating // Rating given by the user
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('Rating submitted successfully:', result);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center mt-10">
        <h1 className="bg-blue-500 w-fit p-3 rounded-xl text-white">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div>
        {movie ? (
          <>
            <div className="flex gap-10 px-[26vh] w-full items-center bg-slate-200 py-10 shadow-xl">
              <button
                className="absolute top-0 left-0 m-3 bg-zinc-700 text-white p-2 rounded-xl"
                onClick={() => navigate('/')}>

                <WestIcon className="mr-1" />
                Home
              </button>
              <div className="w-[25%]">
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                  alt={movie.title}
                  className="w-[100%] rounded-xl"
                />
              </div>

              <div className="w-[50%] py-4">
                <div className="">
                  <h1 className="text-3xl font-semibold">{movie.title}</h1>
                  <p>{movie.overview}</p>
                </div>

                <h2 className="text-xl font-medium mt-5">Genres</h2>
                <ul className="flex gap-5">
                  {movie.genres.map((genre) => (
                    <li
                      key={genre.id}
                      className="bg-zinc-200 border-[1px] border-zinc-300 p-2 rounded-xl"
                    >
                      {genre.name}
                    </li>
                  ))}
                </ul>

                <div>
                  <h2 className="text-xl font-medium mt-5">Cast</h2>
                  <ul>
                    {movie.credits.cast.slice(0, 5).map((castMember) => (
                      <li key={castMember.id}>
                        {castMember.name} as {castMember.character}
                      </li>
                    ))}
                  </ul>
                </div>

                <Box sx={{ '& > legend': { mt: 2 } }}>
                  <Typography component="legend" className="font-semibold">
                    Rate this movie
                  </Typography>
                  <Rating
                    name="simple-controlled"
                    value={rating}
                    onChange={(event, newValue) => {
                      setRating(newValue || 0);
                    }}
                  />
                </Box>

                <div className="mt-6">
                  <label htmlFor="id">User Id</label> <br />
                  <input
                    type="number"
                    placeholder="Add user id"
                    id="id"
                    className="bg-zinc-200 p-2 rounded-xl"
                    onChange={(e) => setUserId(Number(e.target.value))}
                  />
                </div>

                <button className="mt-4 bg-blue-500 p-2 rounded-xl text-white" onClick={handleSubmit}>
                  Submit Rating
                </button>
              </div>
            </div>
          </>
        ) : (
          <div>No movie details found.</div>
        )}
      </div>


   <div className="flex items-center justify-center gap-10">

      <div className="mt-10 text-center">
        <button
          onClick={contentBased}
          className="bg-blue-600 p-2 rounded-xl text-white mb-9"
        >
          Content Based
        </button>
      </div>

    
    <div className="text-center mt-10 ">
      <button onClick={()=>Collaberative()} className="bg-blue-600 p-2 rounded-xl text-white mb-9">Get Collaberative Based</button>
    </div>

    </div>


<div className="flex "> 

      <div className="grid grid-cols-2 gap-10 px-[6vh] w-[50%] border-r-2 border-zinc-200">
        {contentRecommendations.map((item) => (
          <div
            key={item.movie_id}
            className="flex justify-between bg-zinc-800 mt-5 p-10 rounded-xl cursor-pointer hover:scale-105 transition ease-in-out duration-500"
            onClick={() => navigate(`/${item.movie_id}`)}
          >
            <div className="space-y-6 text-white">
              <div>
                <h1 className="text-2xl font-bold">{item.movie_name}</h1>
                <h1>{item.year}</h1>
              </div>

              <h1>{item.genre}</h1>
            </div>
          </div>
        ))}
      </div>

   

      <div className="grid grid-cols-2 gap-10 px-[6vh] w-[50%] border-r-2">
  {collaberativeBased && collaberativeBased.length > 0 ? (
    collaberativeBased.map((item, idx) => (
      <div
        key={item.movie_id}
        className="flex justify-between bg-zinc-800 mt-5 p-10 rounded-xl cursor-pointer hover:scale-105 transition ease-in-out duration-500"
        onClick={() => navigate(`/${item.movie_id}`)}
      >
        <div className="space-y-6 text-white">
          <div>
            <h1 className="text-2xl font-bold">{item.movie_name}</h1>
            <h1>{item.year}</h1>
          </div>
          <h1>{item.genre}</h1>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-2 text-center ">
      <h2 className="text-xl font-semibold mt-5 text-red-500">No recommendations available Please rate the movie for collaberative Based</h2>
    </div>
  )}
</div>

   </div>

 


    </>
  );
}

export default MovieInfo;
