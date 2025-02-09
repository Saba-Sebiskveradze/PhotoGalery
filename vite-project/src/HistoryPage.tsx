import { useState, useEffect, useCallback } from "react";
import { popularPhoto, getStatistics } from "./data";
import "./App.css";
import ImageModal from "./ImageModal";

type Photo = {
  id: string;
  width: number;
  height: number;
  urls: { large: string; regular: string; raw: string; small: string };
  color: string | null;
  user: {
    username: string;
    name: string;
  };
  likes:number;

};

function HistoryPage() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [cachedPhotos, setCachedPhotos] = useState<Photo[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
    const [imageStats, setImageStats] = useState<{
      downloads: number;
      views: number;
      likes: number;
    } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history);
  }, []);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const cacheKey = `search_${query}_page_${page}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const cachedPhotos = JSON.parse(cachedData);
        setCachedPhotos((prevPhotos) => [...prevPhotos, ...cachedPhotos]);
        setDisplayedPhotos((prevPhotos) => [...prevPhotos, ...cachedPhotos]);
        setHasMore(cachedPhotos.length > 0);
      } else {
        const data = await popularPhoto(page, query);
        setCachedPhotos((prevPhotos) => [...prevPhotos, ...data]);
        setDisplayedPhotos((prevPhotos) => [...prevPhotos, ...data]);
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
    if (query) {
      fetchPhotos();
    }
  }, [page, query, fetchPhotos]);

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

  const handleSearchTermClick = (term: string) => {
    setQuery(term);
    setSearch("");
    setCachedPhotos([]);
    setDisplayedPhotos([]);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim() !== "" && query !== search) {
      setQuery(search);
      setCachedPhotos([]);
      setDisplayedPhotos([]);
      setPage(1);

      const searches = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      if (!searches.includes(search)) {
        localStorage.setItem("searchHistory", JSON.stringify([...searches, search]));
      }
    }
  };

  const handleRemoveSearchTerm = (term: string) => {
    const updatedHistory = searchHistory.filter((historyTerm) => historyTerm !== term);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    const cacheKey = `search_${term}`;
    localStorage.removeItem(cacheKey);
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleImageClick = async (photo: Photo) => {
      try {
        const stats = await getStatistics(photo.id);
        setImageStats(stats);
        setSelectedImage(photo);
        setIsModalOpen(true);      
      } catch (error) {
        console.error("Error fetching image statistics:", error);
      }
    };
  

  return (
    <div className="history-page">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </form>

      {!query && displayedPhotos.length === 0 && (
        <div className="history-list">
          {searchHistory.map((term) => (
            <div
              key={term}
              className="history-item"
              onClick={() => handleSearchTermClick(term)}
            >
              {term}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSearchTerm(term);
                }}
                className="remove-btn"
                aria-label="Remove search term"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {(query || displayedPhotos.length > 0) && (
        <div className="image-container">
          {displayedPhotos.map((photo) => (
            <img
              key={photo.id}
              src={photo.urls.regular}
              alt={`By ${photo.user.name}`}
              className="photo"
              onClick={() => handleImageClick(photo)}

            />
          ))}
          {loading && <div className="loading">Loading...</div>}
          {!loading && displayedPhotos.length === 0 && (
            <div className="no-results">No photos found.</div>
          )}
        </div>
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
        {isModalOpen && selectedImage && imageStats && (
          <ImageModal
            imageUrl={selectedImage.urls.regular}
            downloads={imageStats.downloads}
            views={imageStats.views}
            likes={selectedImage.likes}
            onClose={() => setIsModalOpen(false)}
          />
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
        {isModalOpen && selectedImage && imageStats && (
          <ImageModal
            imageUrl={selectedImage.urls.regular}
            downloads={imageStats.downloads}
            views={imageStats.views}
            likes={selectedImage.likes}
            onClose={() => setIsModalOpen(false)}
          />
        )}
    </div>
  );
}

export default HistoryPage;