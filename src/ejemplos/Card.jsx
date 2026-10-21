import React from 'react';
import { useState } from 'react';
import './Card.css'; // Optional: Add styles for the card
import OnOff from './OnOff.jsx';

const Card = ({ children, userName, onFollow='false', formatUserName }) => {
    const [isFollowing, setIsFollowing] = useState(onFollow === 'true');
    const [count, setCount] = useState(0);

    // function handleFollow() {
    //     setIsFollowing(!isFollowing);
    // }
    //funcion igual que la anterior pero con arrow function
    const handleFollow = () => {
        setIsFollowing(!isFollowing);
    }

    const text = isFollowing ? 'Dejar de Seguir' : 'Seguir';
    const buttonStyle= isFollowing ? 'card__button--following' : 'card__button-not-following';

    return (
        <div className="card">
            <img src={`https://unavatar.io/github/${userName}`} alt={`${userName}'s profile`} className="card__image" />
            <div className="card__info">
                <div className="card-title">{children}</div>
                <p className="card__username">{formatUserName(userName)}</p>
                <button className={buttonStyle} onClick={handleFollow}>
                    {text}
                </button>
            </div>
        </div>  
    );
};

export default Card;