import React from 'react';
import './ComponentCard.css';


function ComponentCard({ title, description, buttonText }) {
  return (
    <div className='container'>
      <header className="header">
        <h1>ANNA WILL DO</h1>
      </header>

      <div className="content">
        <div className="card">
          <h2>TYPE ANYTHING.</h2>
          <p>
            Buttons, cards, components, icons, illustrations, even full page
            sections. Fantom uses the power of AI and machine learning to
            generate whatever you need.
          </p>
          <div className="example-box">A call to action with a gradient button</div>
        </div>

        <div className="card">
          <h2>ENDLESS COMPONENTS VARIATIONS.</h2>
          <p>
            Don’t like what you see? Fantom can generate multiple versions of your
            components.
          </p>
          <div className="button-row">
            <button>A BUTTON</button>
            <button className="gradient-button">A BUTTON</button>
            <button className="outline-button">A BUTTON</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentCard;