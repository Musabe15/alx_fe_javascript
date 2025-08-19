// Initial quotes data
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Opportunity" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "Be the change that you wish to see in the world.", category: "Change" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');

// Initialize categories dropdown
function initializeCategories() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Display a random quote
function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let filteredQuotes = quotes;
    
    // Filter quotes by category if not "all"
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    // Check if there are quotes to display
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p class="placeholder">No quotes available for this category</p>';
        return;
    }
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Display the quote
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${randomQuote.text}"</p>
        <span class="quote-category">${randomQuote.category}</span>
    `;
}

// Add a new quote
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    
    // Validate inputs
    if (!text || !category) {
        alert('Please enter both quote text and category');
        return;
    }
    
    // Create new quote object
    const newQuote = { text, category };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Update categories dropdown
    initializeCategories();
    
    // Clear input fields
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    
    // Show success message
    alert('Quote added successfully!');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize categories dropdown
    initializeCategories();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    categoryFilter.addEventListener('change', showRandomQuote);
});