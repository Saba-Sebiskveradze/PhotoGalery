import { useEffect, useState, useCallback } from "react";
import { popularPhoto } from "./data";
import "./App.css";

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

function MainPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
    
      const cacheKey = `search_${query}_page_${page}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const cachedPhotos = JSON.parse(cachedData);
        setPhotos((prevPhotos) => [...prevPhotos, ...cachedPhotos]);
        setHasMore(cachedPhotos.length > 0);
      } else {
        const data = await popularPhoto(page, query);
        setPhotos((prevPhotos) => [...prevPhotos, ...data]);
        setHasMore(data.length > 0);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
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

    window.addEventListener("scroll", handleScrollVisibility);
    return () => window.removeEventListener("scroll", handleScrollVisibility);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query !== search) {
      setQuery(search);
      setPhotos([]); 
      setPage(1); 
      const searches = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      if (!searches.includes(search) && search!="") {
        localStorage.setItem("searchHistory", JSON.stringify([...searches, search]));
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
 


  return (
    <div className="main-page">
      <form onSubmit={handleSearch} className="search-form">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </form>

      <div className="image-container">
        {photos.map((photo) => (
          <img
            key={photo.id}
            src={photo.urls.regular}
            alt={`By ${photo.user.name}`}
            className="photo"
          />
        ))}
        {loading && <div className="loading">Loading...</div>}
        {!loading && photos.length === 0 && (
          <div className="no-results">No photos found.</div>
        )}
        {showScrollButton && (
          <button
            className="scroll-button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            UP
          </button>
        )}
      </div>
    </div>
  );
}

export default MainPage;
