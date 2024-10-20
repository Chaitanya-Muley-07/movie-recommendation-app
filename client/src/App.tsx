import { useEffect, useState } from 'react'
import Movies from './Movies'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MovieInfo from './MovieInfo'

function App() {



  return (
    <>
       
       <BrowserRouter>
       <Routes>
          <Route path='/' element={<Movies/>}/>
          <Route path='/:id' element={<MovieInfo/>}/>
       </Routes>
       </BrowserRouter>

    </>
  )
}

export default App
