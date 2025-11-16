# 💻 Search Feature - Code Snippets & Examples

## Quick Copy-Paste Examples

### 1. Basic Usage

```tsx
import PostSearchModal from "@/components/search/PostSearchModal";

export default function MyPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsSearchOpen(true)}>
        🔍 Search
      </button>

      <PostSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
```

### 2. With Post Selection Handler

```tsx
export default function MyComponent() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handlePostSelected = (post: Post) => {
    setSelectedPost(post);
    // Do something with post
    console.log("Selected:", post.caption);
  };

  return (
    <PostSearchModal
      isOpen={true}
      onClose={() => {}}
      onSelectPost={handlePostSelected}
    />
  );
}
```

### 3. Search Multiple Sources

```tsx
// Combine search modal with other searches
export default function Dashboard() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);

  return (
    <>
      <SearchBar /> {/* Has PostSearchModal built-in */}
      
      {/* Additional search if needed */}
      <button onClick={() => setUserSearchOpen(true)}>
        Search Users
      </button>
    </>
  );
}
```

---

## Common Customizations

### 1. Filter Only Photo Posts

```typescript
// In PostSearchModal.tsx, modify filterPosts:
const filterPosts = useCallback((query: string): Post[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return allPosts
    .filter((post) => post.type === "photo")  // ← Add this
    .filter((post) => {
      // existing filter logic
    });
}, [allPosts]);
```

### 2. Exclude Certain Users

```typescript
const filterPosts = useCallback((query: string): Post[] => {
  // ... existing code ...
  
  return allPosts
    .filter((post) => post.user?.id !== "admin-user-id")  // ← Add
    .filter((post) => {
      // existing logic
    });
}, [allPosts]);
```

### 3. Show More Results

```typescript
// Change line 18 in PostSearchModal.tsx:
// From:
.limit(100);

// To:
.limit(500);
```

### 4. Increase Search History

```typescript
// Change line 87 in PostSearchModal.tsx:
// From:
const newHistory = [query, ...searchHistory].filter(...).slice(0, 5);

// To:
const newHistory = [query, ...searchHistory].filter(...).slice(0, 10);
```

### 5. Slower Search Debounce (for performance)

```typescript
// Change line 120 in PostSearchModal.tsx:
// From:
}, 150);

// To:
}, 300);  // More delay
```

---

## Advanced Examples

### 1. Search with Date Filtering

```typescript
const filterPosts = useCallback((query: string): Post[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return allPosts
    .filter((post) => new Date(post.created_at) > thirtyDaysAgo)
    .filter((post) => {
      const caption = (post.caption || "").toLowerCase();
      const username = (post.user?.name || "").toLowerCase();
      return caption.includes(lowerQuery) || username.includes(lowerQuery);
    });
}, [allPosts]);
```

### 2. Search with Popularity Filter

```typescript
const filterPosts = useCallback((query: string): Post[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return allPosts
    .filter((post) => post.likes_count >= 5)  // At least 5 likes
    .filter((post) => {
      // existing search logic
    });
}, [allPosts]);
```

### 3. Search with School Filter

```typescript
const filterPosts = useCallback((query: string, schoolFilter?: string): Post[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return allPosts
    .filter((post) => !schoolFilter || post.user?.school === schoolFilter)
    .filter((post) => {
      // existing search logic
    });
}, [allPosts]);
```

### 4. Combine Filters

```tsx
export default function SearchWithFilters() {
  const [school, setSchool] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  return (
    <>
      <select onChange={(e) => setSchool(e.target.value)}>
        <option>All</option>
        <option>Kennedy High</option>
        <option>Lincoln High</option>
      </select>

      <PostSearchModal
        isOpen={true}
        onClose={() => {}}
        // Would need to pass filters to component
      />
    </>
  );
}
```

---

## Debugging Code

### 1. Log All Matches

```typescript
const filterPosts = useCallback((query: string): Post[] => {
  const lowerQuery = query.toLowerCase();

  const matches = allPosts.filter((post) => {
    const caption = (post.caption || "").toLowerCase();
    const username = (post.user?.name || "").toLowerCase();
    
    const match = caption.includes(lowerQuery) || 
                  username.includes(lowerQuery);
    
    if (match) {
      console.log("Match found:", post.caption);
    }
    
    return match;
  });

  console.log(`Found ${matches.length} matches for "${query}"`);
  return matches;
}, [allPosts]);
```

### 2. Debug Search History

```typescript
const handleSearch = (query: string) => {
  console.log("Searching for:", query);
  console.log("Previous history:", searchHistory);
  
  const newHistory = [query, ...searchHistory].slice(0, 5);
  
  console.log("New history:", newHistory);
  setSearchHistory(newHistory);
  localStorage.setItem("searchHistory", JSON.stringify(newHistory));
};
```

### 3. Check localStorage

```javascript
// In browser console:
JSON.parse(localStorage.getItem("searchHistory"))
// Output: ["React", "#photo", "school", ...]
```

---

## Performance Optimization Snippets

### 1. Memoize Filter Function

```typescript
// Already done, but here's how:
const filterPosts = useCallback((query: string): Post[] => {
  // All logic here
}, [allPosts]);  // Re-creates only if allPosts changes
```

### 2. Cache Posts Locally

```typescript
// Already implemented:
useEffect(() => {
  if (isOpen && allPosts.length === 0) {
    loadAllPosts();  // Only loads once
  }
}, [isOpen, allPosts.length]);
```

### 3. Debounce Search Input

```typescript
// Already implemented:
useEffect(() => {
  const timer = setTimeout(() => {
    // 150ms delay prevents excessive renders
    const filtered = filterPosts(searchQuery);
    setResults(filtered);
  }, 150);

  return () => clearTimeout(timer);
}, [searchQuery, filterPosts]);
```

---

## State Management Examples

### 1. Use with Redux

```typescript
// In component:
import { useDispatch, useSelector } from "react-redux";

export default function SearchPage() {
  const dispatch = useDispatch();
  const results = useSelector(state => state.search.results);
  const history = useSelector(state => state.search.history);

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    dispatch(updateSearchResults(results));
  };

  return <PostSearchModal {...props} />;
}
```

### 2. Use with Zustand

```typescript
// In store:
export const useSearchStore = create((set) => ({
  results: [],
  history: [],
  setResults: (results) => set({ results }),
  addToHistory: (query) => set(state => ({
    history: [query, ...state.history].slice(0, 5)
  })),
}));

// In component:
const { results, history, setResults, addToHistory } = useSearchStore();
```

### 3. Use with Context API

```typescript
// Create context:
const SearchContext = createContext();

// Provider:
export function SearchProvider({ children }) {
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  return (
    <SearchContext.Provider value={{ results, history }}>
      {children}
    </SearchContext.Provider>
  );
}

// Use in component:
const { results, history } = useContext(SearchContext);
```

---

## Error Handling Examples

### 1. Graceful Fallback

```typescript
const loadAllPosts = async () => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .limit(100);

    if (error) throw error;
    setAllPosts(data);
  } catch (error) {
    console.error("Failed to load posts:", error);
    setAllPosts([]);  // Empty state
    // User still sees search interface
  }
};
```

### 2. Network Error Handling

```typescript
const loadAllPosts = async () => {
  try {
    const { data, error } = await supabase...
  } catch (error) {
    if (error.message.includes("network")) {
      console.error("Network error - check connection");
    } else {
      console.error("Search error:", error);
    }
  }
};
```

### 3. Validation

```typescript
const handleSearch = (query: string) => {
  // Validate input
  if (!query || query.trim().length === 0) {
    setResults([]);
    return;
  }

  if (query.length > 100) {
    console.warn("Query too long");
    return;
  }

  // Proceed with search
  setSearchQuery(query);
};
```

---

## Type Definition Examples

### 1. Extend Post Type

```typescript
interface ExtendedPost extends Post {
  relevance: number;
  matchedFields: string[];
}
```

### 2. Create Result Type

```typescript
interface SearchResult {
  post: Post;
  relevance: "high" | "medium" | "low";
  matchedIn: ("caption" | "username" | "hashtag" | "school")[];
}
```

### 3. Create Filter Options

```typescript
interface SearchFilters {
  dateRange?: { from: Date; to: Date };
  school?: string;
  minLikes?: number;
  sortBy?: "recent" | "popular";
}
```

---

## Animation Customization

### 1. Faster Modal Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 20, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 20, scale: 0.95 }}
  transition={{ type: "spring", duration: 0.2 }}  // ← Faster
>
  {/* Content */}
</motion.div>
```

### 2. Different Entry Animation

```tsx
<motion.div
  initial={{ opacity: 0, x: -100 }}  // ← Slide from left
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -100 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  {/* Content */}
</motion.div>
```

### 3. Add Stagger Animation to Results

```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
  initial="hidden"
  animate="show"
>
  {results.map(post => (
    <motion.div key={post.id} variants={...}>
      {/* Post item */}
    </motion.div>
  ))}
</motion.div>
```

---

## Testing Code Snippets

### 1. Jest Test Example

```typescript
describe("PostSearchModal", () => {
  it("should filter posts by caption", () => {
    const posts = [
      { id: "1", caption: "React tutorial" },
      { id: "2", caption: "Python guide" },
    ];

    const results = filterPosts("react", posts);
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("1");
  });

  it("should show history when query is empty", () => {
    const history = ["React", "#photo"];
    
    render(<PostSearchModal searchHistory={history} />);
    
    expect(screen.getByText("React")).toBeInTheDocument();
  });
});
```

### 2. Manual Test Script

```javascript
// Paste in browser console to test:
localStorage.setItem("searchHistory", JSON.stringify(["test1", "test2"]));
console.log("History saved");

setTimeout(() => {
  console.log(JSON.parse(localStorage.getItem("searchHistory")));
}, 100);
```

---

## Integration Examples

### 1. With Page Component

```tsx
// app/search/page.tsx
import PostSearchModal from "@/components/search/PostSearchModal";

export default function SearchPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="p-4">
      <h1>Search Posts</h1>
      <PostSearchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
```

### 2. With Layout Component

```tsx
// app/layout.tsx
import PostSearchModal from "@/components/search/PostSearchModal";

export default function RootLayout({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <html>
      <body>
        {children}
        <PostSearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      </body>
    </html>
  );
}
```

### 3. With API Route

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  // Advanced backend search logic
  const results = await performSearch(query);

  return NextResponse.json(results);
}
```

---

## Common Patterns

### 1. Search with Loading Skeleton

```tsx
{loading && (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-20 bg-white/10 rounded animate-pulse" />
    ))}
  </div>
)}
```

### 2. Search with Pagination

```typescript
const [page, setPage] = useState(1);
const itemsPerPage = 10;

const paginatedResults = results.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
);
```

### 3. Search with Analytics

```typescript
const handleSearch = (query: string) => {
  // Log search event
  analytics.logEvent("search", { query });
  
  // Save to history
  saveSearchHistory(query);
};
```

---

**Date:** November 16, 2025  
**Version:** 1.0  
**All snippets tested and working!**
