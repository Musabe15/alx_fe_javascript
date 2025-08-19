// Initial quotes data
let quotes = [];
let serverQuotes = [];
let lastSyncTime = null;
let isSyncing = false;
let syncIntervalId = null;

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteContainer = document.getElementById('addQuoteContainer');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const manualSyncBtn = document.getElementById('manualSyncBtn');
const syncStatus = document.getElementById('syncStatus');
const conflictModal = document.getElementById('conflictModal');
const useServerDataBtn = document.getElementById('useServerData');
const useLocalDataBtn = document.getElementById('useLocalData');
const mergeDataBtn = document.getElementById('mergeData');

// Storage keys
const STORAGE_KEYS = {
    QUOTES: 'quotes',
    LAST_VIEWED: 'lastViewedQuote',
    SELECTED_CATEGORY: 'selectedCategory',
    LAST_SYNC: 'lastSyncTime',
    SERVER_QUOTES: 'serverQuotes'
};

// Server configuration
const SERVER_BASE_URL = 'https://jsonplaceholder.typicode.com';
const SERVER_DELAY = 1500; // Simulate network delay
const SYNC_INTERVAL = 30000; // Sync every 30 seconds

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes if none in storage
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { text: "In the middle of difficulty lies opportunity.", category: "Opportunity" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
            { text: "Be the change that you wish to see in the world.", category: "Change" }
        ];
        saveQuotes();
    }
    
    // Load server quotes from storage (simulated)
    const storedServerQuotes = localStorage.getItem(STORAGE_KEYS.SERVER_QUOTES);
    if (storedServerQuotes) {
        serverQuotes = JSON.parse(storedServerQuotes);
    } else {
        // Initialize server quotes with the same data
        serverQuotes = JSON.parse(JSON.stringify(quotes));
        localStorage.setItem(STORAGE_KEYS.SERVER_QUOTES, JSON.stringify(serverQuotes));
    }
    
    // Load last sync time
    const storedSyncTime = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    lastSyncTime = storedSyncTime ? new Date(storedSyncTime) : new Date();
}

// Save last viewed quote to session storage
function saveLastViewedQuote(quote) {
    sessionStorage.setItem(STORAGE_KEYS.LAST_VIEWED, JSON.stringify(quote));
}

// Get last viewed quote from session storage
function getLastViewedQuote() {
    const lastQuote = sessionStorage.getItem(STORAGE_KEYS.LAST_VIEWED);
    return lastQuote ? JSON.parse(lastQuote) : null;
}

// Save selected category to local storage
function saveSelectedCategory(category) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY, category);
}

// Get selected category from local storage
function getSelectedCategory() {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CATEGORY) || 'all';
}

// Populate categories dropdown with unique categories from quotes
function populateCategories() {
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
    
    // Set the selected category from storage
    const selectedCategory = getSelectedCategory();
    categoryFilter.value = selectedCategory;
}

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    
    // Save the selected category
    saveSelectedCategory(selectedCategory);
    
    // If "all" is selected, show a random quote
    if (selectedCategory === 'all') {
        showRandomQuote();
        return;
    }
    
    // Filter quotes by selected category
    const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    
    // Check if there are quotes to display
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p class="placeholder">No quotes available for this category</p>';
        return;
    }
    
    // Get a random quote from filtered quotes
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Display the quote
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${randomQuote.text}"</p>
        <span class="quote-category">${randomQuote.category}</span>
    `;
    
    // Save to session storage
    saveLastViewedQuote(randomQuote);
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
    
    // Save to session storage
    saveLastViewedQuote(randomQuote);
}

// Create the form to add new quotes
function createAddQuoteForm() {
    const addQuoteSection = document.createElement('div');
    addQuoteSection.className = 'add-quote-section';
    addQuoteSection.innerHTML = `
        <h2>Add a New Quote</h2>
        <div class="form-group">
            <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        </div>
        <div class="form-group">
            <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        </div>
        <button id="addQuoteBtn" class="add-quote-btn">Add Quote</button>
    `;
    
    addQuoteContainer.appendChild(addQuoteSection);
    
    // Add event listener to the button
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

// Add a new quote
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();
    
    // Validate inputs
    if (!text || !category) {
        showNotification('Please enter both quote text and category', 'error');
        return;
    }
    
    // Create new quote object
    const newQuote = { text, category };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Save to local storage
    saveQuotes();
    
    // Update categories dropdown
    populateCategories();
    
    // Clear input fields
    textInput.value = '';
    categoryInput.value = '';
    
    // Show success message
    showNotification('Quote added successfully!', 'success');
    
    // Trigger sync with server
    syncWithServer();
}

// Export quotes to JSON file using Blob
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    
    // Create a Blob with the JSON data
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Validate the imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data is not an array');
            }
            
            // Check if each item has the required properties
            for (const quote of importedQuotes) {
                if (!quote.text || !quote.category) {
                    throw new Error('Invalid quote format in imported file');
                }
            }
            
            // Add imported quotes to our array
            quotes.push(...importedQuotes);
            
            // Save to local storage
            saveQuotes();
            
            // Update categories dropdown
            populateCategories();
            
            // Reset file input
            event.target.value = '';
            
            showNotification('Quotes imported successfully!', 'success');
            
            // Trigger sync with server
            syncWithServer();
        } catch (error) {
            showNotification('Error importing quotes: ' + error.message, 'error');
            console.error('Import error:', error);
        }
    };
    fileReader.readAsText(file);
}

// Display last viewed quote if available
function displayLastViewedQuote() {
    const lastQuote = getLastViewedQuote();
    if (lastQuote) {
        quoteDisplay.innerHTML = `
            <p class="quote-text">"${lastQuote.text}"</p>
            <span class="quote-category">${lastQuote.category}</span>
            <p class="last-viewed-note">(Last viewed quote)</p>
        `;
    }
}

// Show notification to user
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content and style
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Update sync status indicator
function updateSyncStatus(status, message = '') {
    syncStatus.textContent = status === 'synced' ? 'Synced' : 
                            status === 'syncing' ? 'Syncing...' : 
                            status === 'error' ? 'Sync Error' : status;
    
    syncStatus.className = 'sync-status';
    if (status === 'syncing') syncStatus.classList.add('syncing');
    if (status === 'error') syncStatus.classList.add('error');
    
    if (message) {
        showNotification(message, status === 'error' ? 'error' : 'success');
    }
}

// Fetch quotes from JSONPlaceholder server
async function fetchQuotesFromServer() {
    try {
        // Fetch posts from JSONPlaceholder using the exact URL
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const posts = await response.json();
        
        // Convert posts to our quote format (using first 10 posts for demo)
        return posts.slice(0, 10).map(post => ({
            text: post.title,
            category: `Post ${post.id}`
        }));
    } catch (error) {
        console.error('Error fetching from server:', error);
        throw error;
    }
}

// Post quotes to JSONPlaceholder server with proper POST method and headers
async function postToServer(data) {
    try {
        // Make a POST request to JSONPlaceholder with proper headers
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // JSONPlaceholder returns the created post with an ID, but we'll store locally too
        localStorage.setItem(STORAGE_KEYS.SERVER_QUOTES, JSON.stringify(data));
        
        return { success: true, message: 'Data synced with server', data: result };
    } catch (error) {
        console.error('Error posting to server:', error);
        
        // Fallback to local storage if server request fails
        try {
            localStorage.setItem(STORAGE_KEYS.SERVER_QUOTES, JSON.stringify(data));
            return { success: true, message: 'Data saved locally (server unavailable)' };
        } catch (localError) {
            throw new Error(`Failed to save data: ${localError.message}`);
        }
    }
}

// Check if data has conflicts
function hasConflicts(localData, serverData) {
    // Simple conflict detection - check if data is different
    return JSON.stringify(localData) !== JSON.stringify(serverData);
}

// Show conflict resolution modal
function showConflictModal() {
    conflictModal.style.display = 'block';
}

// Hide conflict resolution modal
function hideConflictModal() {
    conflictModal.style.display = 'none';
}

// Resolve conflict by using server data
function resolveWithServerData() {
    quotes = JSON.parse(JSON.stringify(serverQuotes));
    saveQuotes();
    populateCategories();
    hideConflictModal();
    showNotification('Data updated from server', 'success');
}

// Resolve conflict by keeping local data
function resolveWithLocalData() {
    // Update server with local data
    serverQuotes = JSON.parse(JSON.stringify(quotes));
    localStorage.setItem(STORAGE_KEYS.SERVER_QUOTES, JSON.stringify(serverQuotes));
    hideConflictModal();
    showNotification('Local data preserved', 'success');
}

// Resolve conflict by merging data
function resolveWithMerge() {
    // Merge strategy: combine both arrays and remove duplicates
    const mergedQuotes = [...quotes];
    
    serverQuotes.forEach(serverQuote => {
        const exists = mergedQuotes.some(localQuote => 
            localQuote.text === serverQuote.text && localQuote.category === serverQuote.category
        );
        
        if (!exists) {
            mergedQuotes.push(serverQuote);
        }
    });
    
    quotes = mergedQuotes;
    serverQuotes = JSON.parse(JSON.stringify(mergedQuotes));
    
    saveQuotes();
    localStorage.setItem(STORAGE_KEYS.SERVER_QUOTES, JSON.stringify(serverQuotes));
    populateCategories();
    hideConflictModal();
    showNotification('Data merged successfully', 'success');
}

// Sync quotes between local and server data
async function syncQuotes() {
    if (isSyncing) return;
    
    isSyncing = true;
    updateSyncStatus('syncing');
    
    try {
        // Fetch latest data from server
        const serverData = await fetchQuotesFromServer();
        serverQuotes = serverData;
        
        // Check for conflicts
        if (hasConflicts(quotes, serverQuotes)) {
            // Show conflict resolution UI
            showConflictModal();
            updateSyncStatus('error', 'Data conflict detected');
        } else {
            // No conflicts, update server with our data
            const result = await postToServer(quotes);
            updateSyncStatus('synced', result.message);
        }
    } catch (error) {
        console.error('Sync error:', error);
        updateSyncStatus('error', 'Sync failed: ' + error.message);
    } finally {
        isSyncing = false;
    }
}

// Sync data with server (alias for syncQuotes)
async function syncWithServer() {
    await syncQuotes();
}

// Start periodic syncing with setInterval
function startPeriodicSync() {
    // Clear any existing interval
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
    }
    
    // Start new interval for periodic syncing
    syncIntervalId = setInterval(syncQuotes, SYNC_INTERVAL);
}

// Initialize the application
function init() {
    // Load quotes from local storage
    loadQuotes();
    
    // Populate categories dropdown
    populateCategories();
    
    // Create the add quote form
    createAddQuoteForm();
    
    // Display last viewed quote if available
    displayLastViewedQuote();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    exportBtn.addEventListener('click', exportToJson);
    importFile.addEventListener('change', importFromJsonFile);
    manualSyncBtn.addEventListener('click', syncQuotes);
    useServerDataBtn.addEventListener('click', resolveWithServerData);
    useLocalDataBtn.addEventListener('click', resolveWithLocalData);
    mergeDataBtn.addEventListener('click', resolveWithMerge);
    
    // Start periodic syncing with setInterval
    startPeriodicSync();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);