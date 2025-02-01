import { useEffect, useState, useCallback } from "react";
import "./App.css";
import { popularPhoto } from "./data";

type Photo = {
  id: number;
  width: number;
  height: number;
  urls: { large: string; regular: string; raw: string; small: string };
  color: string | null;
  user: {
    username: string;
    name: string;
  };
};

function App() {
  const [popularPhotos, setPopularPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await popularPhoto(page, query);
      setPopularPhotos((prevPhotos) => [...prevPhotos, ...data]);
      setHasMore(data.length > 0);
    } catch (error) {
      setError("Failed to fetch photos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (!loading && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    const handleScrollVisibility = () => {
      if (window.pageYOffset > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScrollVisibility);
    return () => window.removeEventListener('scroll', handleScrollVisibility);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setQuery(search);
      setPage(1);
      setPopularPhotos([]);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="app">
      <form onSubmit={(e) => e.preventDefault()} className="search-form">
        <label htmlFor="search">Search Photos:</label>
        <input
          id="search"
          placeholder="Search..."
          type="search"
          className="search-input"
          value={search}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
      </form>

      <div className="image-container">
        {popularPhotos.map((data) => (
          <img
            key={data.id}
            src={data.urls.regular}
            alt={`Photo by ${data.user.name}`}
            width={500}
            height={500}
            className="photo"
          />
        ))}
        {loading && <p className="loading">Loading photos...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && popularPhotos.length === 0 && (
          <p className="no-results">No photos found.</p>
        )}
      </div>

      {showScrollButton && (
        <button className="scroll-button" onClick={scrollToTop} aria-label="Scroll to top">
          UP
        </button>
      )}
    </div>
  );
}

export default App;