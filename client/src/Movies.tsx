import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';

interface Movies {
  genre: string;
  movie_id: string;
  movie_name: string;
  year: number;
  language:string
}

function Movies() {
  const [movies, setMovies] = useState<Movies[]>([]);
  const [loading,setLoading]=useState<boolean>(false)
  const [search,setSearch]=useState<string>('')

  const Search=(e:any)=>{
    console.log(search);
  }

  const navigate=useNavigate()

  useEffect(() => {
    const getMovies = async () => {
      setLoading(true)
      const res = await fetch("http://127.0.0.1:5000/movies");
      const ans = await res.json();
      console.log(ans);
      setMovies(ans)
      setLoading(false)
    };

    getMovies();
  }, []);

  if(loading){
    return  <div className="grid place-items-center mt-10">
                <h1 className="bg-blue-500 w-fit p-3 rounded-xl text-white">Loading...</h1>
            </div>
  }

  return (
    <>
      <div className="text-4xl font-bold text-center py-10">Explore Movies</div>
      {/* <Box
      component="form"
      sx={{ '& > :not(style)': { m: 1, width: '100%' } }}
      noValidate
      autoComplete="off"
      className="px-[16vh]"
    >
      <div className="w-full flex">
      <TextField id="outlined-basic" label="Search Movies..." variant="outlined" className="w-full" onChange={Search} />
      <button className="bg-blue-500 p-2 rounded-xl"><SearchIcon/> </button>
      </div>
    </Box> */}

   <div className="w-full flex px-[16vh] mb-8">
    <input type="text" placeholder="Search Here..." className="w-full bg-zinc-200 pl-3 py-3 rounded-xl" onChange={(e)=>setSearch(e.target.value)} />
    <button className="bg-blue-500 p-2 rounded-xl text-white" onClick={Search}>Seach</button>
   </div>
         
         <div className="grid grid-cols-5 gap-7 px-[12vh]">   
        {
            movies.filter((item)=>{
              return search.toLowerCase()=='' ? item :item.movie_name.toLowerCase().includes(search)
            }).map((item,id)=>(
            <div key={id} className="flex justify-between bg-zinc-800 mt-5 p-10 rounded-xl cursor-pointer hover:scale-105 transition ease-in-out duration-500" onClick={()=>navigate(`/${item.movie_id}`)}>
                <div className="space-y-6 text-white">
                    
                    <div>
                    <h1 className="text-2xl font-bold">{item.movie_name}</h1>
                    <h1> <h1>{item.year}</h1></h1>
                    </div>
           
                    <h1>{item.genre}</h1>                 
                    <h1>{item.language}</h1>                 
                </div>
            </div>

            ))
        }

        </div>

    </>
  );
}

export default Movies;
