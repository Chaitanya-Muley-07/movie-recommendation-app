import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Movies {
  genre: string;
  movie_id: string;
  movie_name: string;
  year: number;
  language: string;
}

function Movies() {
  const [movies, setMovies] = useState<Movies[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const Search = (e: any) => {
    setSearch(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setSelectedLanguages((prev) =>
      checked ? [...prev, name] : prev.filter((lang) => lang !== name)
    );
  };

  const navigate = useNavigate();

  useEffect(() => {
    const getMovies = async () => {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/movies");
      const ans = await res.json();
      console.log(ans); 
      setMovies(ans);
      setLoading(false);
    };

    getMovies();
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center mt-10">
        <h1 className="bg-blue-500 w-fit p-3 rounded-xl text-white">Loading...</h1>
      </div>
    );
  }

  const filteredMovies = movies.filter((movie) => {

    const matchesSearch =
      search.toLowerCase() === "" ||
      movie.movie_name.toLowerCase().includes(search.toLowerCase());
  

    const matchesLanguage =
      selectedLanguages.length === 0 ||
      selectedLanguages.some(
        (lang) => movie.language.toLowerCase() === lang.toLowerCase()
      );
  
    return matchesSearch && matchesLanguage;
  });

  return (
    <>
      <div className="text-4xl font-bold text-center py-10">Explore Movies</div>

      <div className="w-full flex px-[16vh] mb-8">
        <input
          type="text"
          placeholder="Search Here..."
          className="w-full bg-zinc-200 pl-3 py-3 rounded-xl"
          onChange={Search}
          value={search} 
        />
        <button className="bg-blue-500 p-2 rounded-xl text-white">Search</button>
      </div>

      <div className="flex gap-10 px-[16vh] mb-8">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="Hindi"
            id="hindi"
            onChange={handleLanguageChange}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="hindi" className="ml-1 text-xl font-medium">Hindi</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="Marathi"
            id="marathi"
            onChange={handleLanguageChange}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="marathi" className="ml-1 text-xl font-medium">Marathi</label>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-7 px-[12vh]">
        {filteredMovies.length === 0 ? (
          <div className="col-span-5 text-center text-lg text-red-500">
            No movies found.
          </div>
        ) : (
          filteredMovies.map((item, id) => (
            <div
              key={id}
              className="flex justify-between bg-zinc-800 mt-5 p-10 rounded-xl cursor-pointer hover:scale-105 transition ease-in-out duration-500"
              onClick={() => navigate(`/${item.movie_id}`)}
            >
              <div className="space-y-6 text-white">
                <div>
                  <h1 className="text-2xl font-bold">{item.movie_name}</h1>
                  <h1>{item.year}</h1>
                </div>
                <h1>{item.genre}</h1>
                <h1>{item.language}</h1>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Movies;
