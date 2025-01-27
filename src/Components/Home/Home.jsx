import React from 'react'
import AnnaHero from '../AnnaHero/AnnaHero'
import './Home.css'
import ComponentCard from '../ComponentCard/ComponentCard'
import PriceComp from '../PriceComp/PriceComp'
import Waitlist from '../WaitList/waitlist'
import Footer from '../Footer/Footer'

const Home = () => {
  return (
    <div className="home">
        <AnnaHero className="anna-hero" />
        <ComponentCard className="component-card" />
        <PriceComp className="price-comp" />
        <Waitlist className="waitlist" />
        <Footer/>
    </div>
  )
}

export default Home
