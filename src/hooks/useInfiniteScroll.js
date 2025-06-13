import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for implementing infinite scrolling functionality
 *
 * @param {Function} fetchData - Function to fetch data (page, pageSize) => Promise<Object>
 * @param {Object} options - Configuration options
 * @param {Object} options.initialData - Initial data to display as an object
 * @param {number} options.initialPage - Initial page number
 * @param {number} options.pageSize - Number of items per page
 * @param {number} options.threshold - Distance from bottom to trigger next load (in px)
 * @param {Array} options.dependencies - Dependencies that should trigger a data reset when changed
 * @returns {Object} - Infinite scroll state and helper functions
 */
const useInfiniteScroll = (
  fetchData,
  {
    initialData = [],
    initialPage = 1,
    pageSize = 3,
    threshold = 200,
    dependencies = [],
  } = {}
) => {
  const [items, setItems] = useState(
    Array.isArray(initialData) ? initialData : []
  );
  const pageRef = useRef(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const loaderRef = useRef(null);
  const observerRef = useRef(null);

  // Load data function
  const loadItems = useCallback(
    async (pageNum) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        // Expecting newItems to be an object from fetchData
        const { data: newItems, hasMore: moreAvailable } = await fetchData(
          pageNum,
          pageSize
        );

        if (Array.isArray(newItems) && newItems.length > 0) {
          setItems((prev) =>
            pageNum === initialPage ? newItems : [...prev, ...newItems]
          );
          setHasMore(moreAvailable); // trust server's hasMore
        } else {
          setHasMore(false);
        }
        pageRef.current = pageNum;
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Error loading data");
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchData, pageSize, initialPage]
  );

  // Load more items
  const loadMoreItems = useCallback(() => {
    if (!hasMore || isLoading) return;
    const nextPage = pageRef.current + 1;
    loadItems(nextPage);
  }, [hasMore, isLoading, loadItems]);

  // Reset data (useful when filters change)
  const resetItems = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setError(null);
    pageRef.current = initialPage;
    loadItems(initialPage);
  }, [initialPage, loadItems]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!hasMore || !loaderRef.current) return;

    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target && target.isIntersecting && hasMore && !isLoading) {
        loadMoreItems();
      }
    }, options);

    observerRef.current = observer;

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMoreItems, threshold]);

  // Reset on dependency change - FIXED: Keep dependencies array consistent
  useEffect(() => {
    // Check if we have all required dependencies before resetting
    const hasRequiredDeps = dependencies.length > 0 && 
      dependencies.every(dep => dep !== null && dep !== undefined && dep !== '');
    
    if (hasRequiredDeps) {
      resetItems();
    }
  }, dependencies); // Use dependencies directly without spreading

  return {
    items, // Current items as an object
    isLoading, // Loading state
    error, // Error state
    hasMore, // Whether there are more items to load
    loaderRef, // Ref to attach to loading element
    loadMoreItems, // Function to manually load more items
    resetItems, // Function to reset items (e.g., when filters change)
    setItems, // Setter for items (useful for custom manipulations)
  };
};

export default useInfiniteScroll;