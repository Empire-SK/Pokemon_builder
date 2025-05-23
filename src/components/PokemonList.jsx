import React, { useState, useEffect } from 'react';
import '../css/PokemonList.css';
import pokeball from '../assets/pokeball.png';
import { fetchPokemon } from '../api/pokemonapi';
import TeamDisplay from './TeamDisplay';
import Filter from './Filter';

const PokemonList = () => {
    const [pokemonList, setPokemonList] = useState([]);
    const [filteredPokemon, setFilteredPokemon] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [team, setTeam] = useState([]);
    const MAX_TEAM_SIZE = 6;

    const isTeamFull = team.length >= MAX_TEAM_SIZE;

    const handleAddToTeam = (pokemon) => {
        if (team.length < MAX_TEAM_SIZE && !team.some(p => p.id === pokemon.id)) {
            setTeam([...team, pokemon]);
        }
    };

    const handleRemoveFromTeam = (pokemonId) => {
        setTeam(team.filter(pokemon => pokemon.id !== pokemonId));
    };

    const isInTeam = (pokemonId) => team.some(p => p.id === pokemonId);

    useEffect(() => {
        setIsLoading(true);
        fetchPokemon()
            .then((pokemonDetails) => {
                setPokemonList(pokemonDetails);
                setFilteredPokemon(pokemonDetails);
            })
            .catch((error) => {
                console.error('Error fetching Pokémon:', error);
                setError('Failed to load Pokémon.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        let filtered = pokemonList;

        if (searchTerm) {
            filtered = filtered.filter((pokemon) =>
                pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedType) {
            filtered = filtered.filter((pokemon) =>
                pokemon.types.some((type) => type.type.name.toLowerCase() === selectedType.toLowerCase())
            );
        }

        setFilteredPokemon(filtered);
    }, [searchTerm, selectedType, pokemonList]);

    return (
        <main className="pokemon-main">
            <div className="pokemon-container">
                <h2>Pokémon Collection</h2>
                <div className="team-counter">
                    Team Members: {team.length}/{MAX_TEAM_SIZE}
                </div>

                <Filter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                />

                <div className="pokemon-grid">
                    {isLoading ? (
                        <div className="loading-container">
                            <img src={pokeball} alt="Loading..." className="loading-spinner" />
                            <p className="loading-text">Loading Pokémon...</p>
                        </div>
                    ) : error ? (
                        <p className="status-message error">{error}</p>
                    ) : filteredPokemon.length > 0 ? (
                        filteredPokemon.map((pokemon) => (
                            <div key={pokemon.id} className="pokemon-card">
                                <img
                                    src={pokemon.sprites.front_default}
                                    alt={pokemon.name}
                                    className="pokemon-image"
                                />
                                <h3 className="pokemon-name">
                                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                                </h3>
                                <div className="pokemon-details">
                                    <div className="pokemon-types">
                                        {pokemon.types.map((type) => (
                                            <span
                                                key={type.type.name}
                                                className={`type-badge ${type.type.name}`}
                                            >
                                                {type.type.name}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="pokemon-stats">
                                        {pokemon.stats.map((stat) => (
                                            <div 
                                                key={stat.stat.name} 
                                                className="stat-badge" 
                                                data-stat={stat.stat.name}
                                            >
                                                {stat.stat.name.toUpperCase().replace('-', ' ')}: {stat.base_stat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    className={`add-button ${isInTeam(pokemon.id) ? 'in-team' : ''}`}
                                    onClick={() => handleAddToTeam(pokemon)}
                                    disabled={isInTeam(pokemon.id) || isTeamFull}
                                >
                                    {isInTeam(pokemon.id) ? 'Added to Team' : isTeamFull ? 'Team Full' : (
                                        <>
                                            <span className="plus-symbol">+</span> Add to Team
                                        </>
                                    )}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="status-message">No Pokémon found.</p>
                    )}
                </div>
            </div>
            <TeamDisplay team={team} removeFromTeam={handleRemoveFromTeam} />
        </main>
    );
};

export default PokemonList;