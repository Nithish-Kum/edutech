// Test course creation in browser console
// This helps debug the course creation flow

console.log('🧪 Testing Course Creation Flow');

// Test 1: Check if localStorage is working
const testCourse = {
  id: `test-course-${Date.now()}`,
  title: "Test Course",
  description: "This is a test course",
  difficulty: "Beginner",
  category: "Programming",
  estimatedDuration: "5 hours",
  modules: [
    {
      id: "module-1",
      title: "Test Module",
      duration: "2 hours",
      topics: ["Topic 1", "Topic 2"]
    }
  ],
  tags: ["test"],
  instructor: "Test",
  createdAt: new Date().toISOString(),
  progress: 0
};

// Save test course to localStorage
console.log('💾 Saving test course to localStorage...');
const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
existingCourses.push(testCourse);
localStorage.setItem('courses', JSON.stringify(existingCourses));

console.log('✅ Test course saved:', testCourse);
console.log('📚 All courses in localStorage:', JSON.parse(localStorage.getItem('courses') || '[]'));

// Test 2: Verify course structure
console.log('🔍 Verifying course structure...');
const courses = JSON.parse(localStorage.getItem('courses') || '[]');
const latestCourse = courses[courses.length - 1];

console.log('Latest course:', latestCourse);
console.log('Has required fields:', {
  id: !!latestCourse.id,
  title: !!latestCourse.title,
  description: !!latestCourse.description,
  modules: Array.isArray(latestCourse.modules),
  moduleCount: latestCourse.modules?.length || 0
});

// Test 3: Trigger a manual reload
console.log('🔄 Manual reload recommended. Check if the test course appears in the UI.');

// Instructions
console.log(`
📝 DEBUGGING STEPS:

1. Check browser console for:
   - "Loading courses..."
   - "localStorage data:"
   - "Parsed courses:"
   - "Final loaded courses:"

2. Look for course creation logs:
   - "Course saved successfully:"
   - "handleCourseCreated called with:"

3. If test course appears, course creation works
4. If not, check for JavaScript errors in console

5. To clear test data:
   localStorage.removeItem('courses');
   location.reload();
`);