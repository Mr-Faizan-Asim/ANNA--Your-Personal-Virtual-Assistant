import React from 'react'
import AnnaHero from '../AnnaHero/AnnaHero'
import './Home.css'
import ComponentCard from '../ComponentCard/ComponentCard'
import PriceComp from '../PriceComp/PriceComp'

const Home = () => {
  return (
    <div className="home">
        <AnnaHero className="anna-hero" />
        <ComponentCard className="component-card" />
        <PriceComp className="price-comp" />
    </div>
  )
}

export default Home
