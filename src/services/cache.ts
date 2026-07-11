interface CacheEntry<V> {
  value: V;
  expiry: number;
}

/**
 * A generic, in-memory LRU cache with TTL expiration.
 * Evicts Least Recently Used items when size exceeds maxEntries.
 */
export class LruTtlCache<K, V> {
  private readonly cache = new Map<K, CacheEntry<V>>();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;
  private readonly timeProvider: () => number;
  private hits = 0;
  private misses = 0;

  /**
   * @param maxEntries Maximum number of items in the cache.
   * @param defaultTtlMs Time to live in milliseconds (default 10 minutes).
   * @param timeProvider Custom function providing the current timestamp (for mock clock tests).
   */
  constructor(
    maxEntries: number = 200,
    defaultTtlMs: number = 600000,
    timeProvider: () => number = Date.now
  ) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
    this.timeProvider = timeProvider;
  }

  /**
   * Retrieves an item from the cache. Refreshes item position for LRU tracking.
   * @param key Cache key.
   * @returns Value or undefined if not found or expired.
   */
  public get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (this.timeProvider() > entry.expiry) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Move to end to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value;
  }

  /**
   * Stores an item in the cache. Evicts LRU item if cache size exceeds limit.
   * @param key Cache key.
   * @param value Value to cache.
   * @param ttlMs Custom TTL in milliseconds.
   */
  public set(key: K, value: V, ttlMs: number = this.defaultTtlMs): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: this.timeProvider() + ttlMs
    });
  }

  /**
   * Calculates the current hit rate.
   */
  public getHitRate(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 0.0;
    return parseFloat((this.hits / total).toFixed(4));
  }

  /**
   * Clears the cache and resets hit metrics.
   */
  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Retrieves hit and miss metrics.
   */
  public getMetrics() {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: this.getHitRate()
    };
  }
}
export default LruTtlCache;
