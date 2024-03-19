import React from 'react';
import html from '../assets/html.png';
import css from '../assets/css.png';
import js from '../assets/js.png';
import node from '../assets/node.png';
import mongo from '../assets/mongo.png';
import express from '../assets/express.png';
import react from '../assets/react.png';

export default function About() {
  return (
    <div>
      <h1>About</h1>
      <div className="image-grid" style={{width : 'auto'}}>
        <div className="image-item">
          <img src={html} alt="html" />
        </div>
        <div className="image-item">
          <img src={css} alt="css" />
        </div>
        <div className="image-item">
          <img src={js} alt="js" />
        </div>
        <div className="image-item">
          <img src={node} alt="node" />
        </div>
        <div className="image-item">
          <img src={mongo} alt="mongo" />
        </div>
        <div className="image-item">
          <img src={express} alt="express" />
        </div>
        <div className="image-item">
          <img src={react} alt="react" />
        </div>
      </div>
    </div>
  );
}
