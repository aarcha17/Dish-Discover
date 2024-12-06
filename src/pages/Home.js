import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import styles from './Home.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import data from './data';

const API_KEY = '6e837d10e4614b47a57625349a547e60'; // Replace with your Spoonacular API key
const INITIAL_SEARCH_QUERY = 'tomato'; // Example initial search query

const Home = () => {
  const [colourOptions, setColourOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  console.log(selectedOptions.length);
  const [recipes, setRecipes] = useState([]);
  console.log(recipes);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const previousSearch = location.state?.previousSearch || [];
    const previousRecipes = location.state?.previousRecipes || [];
    console.log(previousSearch)
    console.log(previousRecipes)
    setSelectedOptions(previousSearch);
    if (previousRecipes.length > 0) {
      setRecipes(previousRecipes);
    } else if (previousSearch.length > 0) {
      const labels = previousSearch.map((option) => option.label).join(',+');
      fetchIngredients(labels);
    } else {
      fetchIngredients(INITIAL_SEARCH_QUERY);
    }
  }, [location.state]);


  const fetchIngredients = async (query) => {
    try {
      const response = await fetch(`https://api.spoonacular.com/food/ingredients/search?query=${query}&number=10&apiKey=${API_KEY}`);
      const data = await response.json();
      
      // Update options with fetched ingredients
      if (data.results) {
        const options = data.results.map(item => ({
          value: item.id, // Use item.id as the value
          label: item.name // Use item.name as the label
        }));
        setColourOptions(options);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const handleSelectChange = (options) => {
    if (options.length === 0) {
      // If no options are selected, reset to initial options
      setRecipes([]);
      fetchIngredients(INITIAL_SEARCH_QUERY);
    }
    setSelectedOptions(options || []);
    const values = options ? options.map(option => option.value) : [];
    console.log(`Selected: ${values.length > 0 ? values.join(', ') : 'None'}`);
  };

  const handleCreateOption = (inputValue) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    setColourOptions(prevOptions => [...prevOptions, newOption]);
    setSelectedOptions(prevSelected => [...prevSelected, newOption]);
    console.log(`Created new option: ${inputValue}`);
  };

  const handleSearch = async () => {
    if (selectedOptions.length === 0) {
      console.log("No ingredients selected for search.");
      return;
    }
  
    // Extract the selected ingredient labels to form a comma-separated string
    const ingredientLabels = selectedOptions.map(option => option.label).join(',+');
    console.log(`Searching for recipes with: ${ingredientLabels}`);
  
    try {
      // Call the Spoonacular API to get recipes based on selected ingredients
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientLabels}&number=10&apiKey=${API_KEY}`
      );
      const recipes = await response.json();
  
      if (recipes.length > 0) {
        setRecipes(recipes); // Set fetched recipes to state
      } else {
        console.log('No recipes found for the selected ingredients.');
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };
  const handleRecipeClick = (id) => {
    navigate(`/recipe/${id}`, { state: { previousSearch: selectedOptions, previousRecipes: recipes } });
  };

  return (
      <div className={styles.container}>
        {/* Search Box Section */}
        <div>DishDiscover</div>
        <div className={styles.selectButtonWrapper}>
          <CreatableSelect
            placeholder="Search ingredients"
            isMulti
            isClearable
            options={colourOptions}
            onChange={handleSelectChange}
            onCreateOption={handleCreateOption}
            className={styles.creatableSelect}
            value={selectedOptions}
            onInputChange={(inputValue) => {
              // Fetch ingredients based on the input change
              if (inputValue) {
                fetchIngredients(inputValue);
              } else {
                fetchIngredients(INITIAL_SEARCH_QUERY);
              }
            }}
          />
          <button onClick={handleSearch} className={styles.searchButton}>
            Search
          </button>
        </div>
    
        {/* Recipes Display Section */}
        {recipes.length > 0 && (
        <div className={styles.recipesContainer}>
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={styles.recipeCard}
              onClick={() => handleRecipeClick(recipe.id)}
            >
              <h3>{recipe.title}</h3>
              <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
              <p>Used Ingredients: {recipe.usedIngredientCount}</p>
              {/* <p>Missed Ingredients: {recipe.missedIngredientCount}</p> */}
            </div>
          ))}
        </div>
      )}

      </div>
  );
};

export default Home;