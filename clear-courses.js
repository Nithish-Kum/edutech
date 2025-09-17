// Clear existing course data from localStorage
// Run this in browser console to start fresh

console.log('Clearing all course data...');

// Clear localStorage courses
localStorage.removeItem('courses');
localStorage.removeItem('messages');

// Clear any other course-related data
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('course') || key.includes('lesson') || key.includes('module'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
});

console.log('✅ All course data cleared!');
console.log('🔄 Refresh the page to see the empty state.');

// Optionally reload the page
// window.location.reload();